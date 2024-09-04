const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const client = require('../db');
const redisClient = require('../cacheDb');
const openSearchClient = require('../config/opensearchClient');

// GET AUTHORS
router.get('/authors', async (req, res) => {
  try {
  
    // If OpenSearch is not available, check if authors are in cache
    const cachedAuthors = await redisClient.getAsync('authors');
    if (cachedAuthors) {
      console.log("Using cached authors");
      return res.json(JSON.parse(cachedAuthors));
    }

    // If authors are not in cache, fetch them from the database
    const result = await client.execute('SELECT * FROM authors');
    console.log('Fetching authors from database');

    // Store authors in cache
    await redisClient.setAsync('authors', JSON.stringify(result.rows));
    console.log('Cached authors');

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: `Error fetching authors: ${error.message}` });
  }
});

// CREATE AUTHOR
router.post('/authors', async (req, res) => {
  const { name, date_of_birth, country_of_origin, short_description } = req.body;
  const birthdate = new Date(date_of_birth).toISOString().split('T')[0]; // Format YYYY-MM-DD
  const id = uuid(); // Generate a new UUID for the author

  try {
    // Insert author into the database
    await client.execute(
      'INSERT INTO authors (id, name, date_of_birth, country_of_origin, short_description) VALUES (?, ?, ?, ?, ?)',
      [id, name, birthdate, country_of_origin, short_description],
      { prepare: true }
    );
    
    // Index the new author in OpenSearch
    if (openSearchClient) {
      await openSearchClient.index({
        index: 'authors',
        id: id,
        body: {
          id: id,
          name: name,
          date_of_birth: birthdate,
          country_of_origin: country_of_origin,
          short_description: short_description
        }
      });
      console.log('Indexed author in OpenSearch');
    }

    // Clear cached authors
    redisClient.del('authors');
    console.log('Deleted cached authors');

    res.status(201).json({ message: 'Author added successfully' });
  } catch (error) {
    console.error('Error adding author:', error);
    res.status(500).json({ error: `Error adding author: ${error.message}` });
  }
});

// EDIT AUTHOR
router.put('/authors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date_of_birth, country_of_origin, short_description } = req.body;
  const birthdate = new Date(date_of_birth).toISOString().split('T')[0];

  try {
    // Update author in the database
    await client.execute(
      'UPDATE authors SET name = ?, date_of_birth = ?, country_of_origin = ?, short_description = ? WHERE id = ?',
      [name, birthdate, country_of_origin, short_description, id],
      { prepare: true }
    );
    
    // Update the author in OpenSearch
    if (openSearchClient) {
      await openSearchClient.index({
        index: 'authors',
        id: id,
        body: {
          name: name,
          date_of_birth: birthdate,
          country_of_origin: country_of_origin,
          short_description: short_description
        }
      });
      console.log('Updated author in OpenSearch');
    }

    // Clear cached authors
    redisClient.del('authors');
    res.json({ message: 'Author updated successfully' });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: `Error updating author: ${error.message}` });
  }
});

// DELETE AUTHOR
router.delete('/authors/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    // Delete the author from the database
    await client.execute('DELETE FROM authors WHERE id = ?', [id], { prepare: true });

    // Remove the author from Redis cache
    redisClient.del('authors');
    console.log('Deleted cached authors');

    // If OpenSearch is available, delete the author from OpenSearch
    if (openSearchClient) {
      try {
        const deleteResult = await openSearchClient.delete({
          index: 'authors',
          id: id
        });

        if (deleteResult.body.result === 'not_found') {
          console.log(`Author with ID ${id} not found in OpenSearch`);
        } else {
          console.log(`Deleted author with ID ${id} from OpenSearch`);
        }
      } catch (osError) {
        if (osError.meta.statusCode === 404) {
          console.log(`Author with ID ${id} not found in OpenSearch`);
        } else {
          throw osError;
        }
      }
    }

    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ error: `Error deleting author: ${error.message}` });
  }
});

// SPECIFIC AUTHOR
router.get('/authors/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // If OpenSearch is available, use it to fetch the author
    if (openSearchClient) {
      try {
        const searchResult = await openSearchClient.get({
          index: 'authors',
          id: id
        });
        
        // Return the author if found in OpenSearch
        return res.json(searchResult.body._source);
      } catch (error) {
        // If the author is not found in OpenSearch, continue to check the database
        if (error.meta.statusCode === 404) {
          console.log('Author not found in OpenSearch, checking database...');
        } else {
          throw error; // Re-throw other errors
        }
      }
    }
    
    // If OpenSearch is not available or the author is not found, check the cache
    const cachedAuthors = await redisClient.getAsync('authors');
    if (cachedAuthors) {
      console.log("Using cached authors");
      const author = JSON.parse(cachedAuthors).find((author) => author.id === id);
      if (author) {
        return res.json(author);
      }
    }
    
    // If author is not in cache, fetch from the database
    const result = await client.execute('SELECT * FROM authors WHERE id = ?', [id]);
    if (result.rowLength === 0) {
      res.status(404).json({ error: 'Author not found' });
    } else {
      // Optionally, cache the result
      redisClient.setAsync('authors', JSON.stringify(result.rows));
      console.log('Cached authors');
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ error: `Error fetching author: ${error.message}` });
  }
});

module.exports = router;
