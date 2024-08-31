const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');
const cassandra = require('cassandra-driver');
const redisClient = require('../cacheDb');
let openSearchClient;

try {
  openSearchClient = require('../config/opensearchClient');
  console.log('OpenSearch client connected for books.');
} catch (error) {
  console.warn('OpenSearch client not available for books, running without search functionality');
}

// GET BOOKS
router.get('/books', async (req, res) => {
  try {
    // Search in OpenSearch if available
    if (openSearchClient) {
      const { q } = req.query;
      console.log("OpenSearchClient aviable:", openSearchClient);
      if (q) {
        const searchResult = await openSearchClient.search({
          index: 'books',
          body: {
            query: {
              multi_match: {
                query: q,
                fields: ['name', 'summary']
              }
            }
          }
        });

        const books = searchResult.hits.hits.map(hit => hit._source);
        return res.json(books);
      }
    }

    // Check if books are cached in Redis
    const cachedBooks = await redisClient.getAsync('books');
    if (cachedBooks) {
      console.log('Using cached books');
      return res.json(JSON.parse(cachedBooks));
    }

    // If not cached, fetch books from Cassandra
    const result = await client.execute('SELECT * FROM books');
    console.log('Fetching books from database');

    // Save books in Redis
    redisClient.setAsync('books', JSON.stringify(result.rows));
    console.log('Cached books');

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Error fetching books: ' + error.message });
  }
});

// CREATE BOOK
//TODO fix this to add the author uuid
router.post('/books', async (req, res) => {
  const { name, summary, date_of_publication, number_of_sales } = req.body;

  try {
    const publicationDate = cassandra.types.LocalDate.fromDate(new Date(date_of_publication));
    const bookId = uuid();

    // Insert book in Cassandra
    await client.execute(
      'INSERT INTO books (id, name, summary, date_of_publication, number_of_sales) VALUES (?, ?, ?, ?, ?)',
      [bookId, name, summary, publicationDate, parseInt(number_of_sales, 10)],
      { prepare: true }
    );

    // Delete caché of books in Redis
    redisClient.del('books');

    // If OpenSearch is aviable, also insert the book in OpenSearch
    if (openSearchClient) {
      console.log("OpenSearchClient aviable:", openSearchClient);
      await openSearchClient.index({
        index: 'books',
        id: bookId,
        body: {
          name,
          summary,
          date_of_publication: publicationDate,
          number_of_sales: parseInt(number_of_sales, 10)
        }
      });
    }

    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: `Error adding book: ${error.message}` });
  }
});

// EDIT BOOK
router.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { name, summary, date_of_publication, number_of_sales } = req.body;

  try {
    const formattedDate = date_of_publication ? new Date(date_of_publication) : null;

    // Update Book in Cassandra
    await client.execute(
      'UPDATE books SET name = ?, summary = ?, date_of_publication = ?, number_of_sales = ? WHERE id = ?',
      [name, summary, formattedDate, parseInt(number_of_sales, 10), id],
      { prepare: true }
    );

    // Delete caché of books in Redis
    redisClient.del('books');

    // If OpenSearch is aviable, also update the book in OpenSearch
    if (openSearchClient) {
      console.log("OpenSearchClient aviable:", openSearchClient);
      await openSearchClient.update({
        index: 'books',
        id: id,
        body: {
          doc: {
            name,
            summary,
            date_of_publication: formattedDate,
            number_of_sales: parseInt(number_of_sales, 10)
          }
        }
      });
    }

    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Error updating book: ' + error.message });
  }
});

// DELETE BOOK
router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete book in Cassandra
    await client.execute('DELETE FROM books WHERE id = ?', [id]);

    // Delete caché of books in Redis
    redisClient.del('books');

    // If OpenSearch is aviable, also delete the book in OpenSearch
    if (openSearchClient) {
      console.log("OpenSearchClient aviable:", openSearchClient);
      await openSearchClient.delete({
        index: 'books',
        id: id
      });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Error deleting book: ' + error.message });
  }
});

// GET SPECIFIC BOOK
router.get('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Search in OpenSearch if available
    if (openSearchClient) {
      console.log("OpenSearchClient aviable:", openSearchClient);
      const searchResult = await openSearchClient.search({
        index: 'books',
        body: {
          query: {
            match: {
              id: id
            }
          }
        }
      });

      if (searchResult.hits.total.value > 0) {
        console.log('Using OpenSearch book');
        return res.json(searchResult.hits.hits[0]._source);
      }
    }

    // If no OpenSearch, check if book is cached in Redis
    const cachedBooks = await redisClient.getAsync('books');
    if (cachedBooks) {
      console.log('Using cached books');
      const book = JSON.parse(cachedBooks).find((book) => book.id === id);
      if (book) {
        return res.json(book);
      }
    }

    // If not cached, fetch book from Cassandra
    const result = await client.execute('SELECT * FROM books WHERE id = ?', [id]);
    if (result.rowLength) {
      const book = result.rows[0];
      res.json(book);

      // Save book in Redis
      redisClient.setAsync('books', JSON.stringify([...JSON.parse(cachedBooks || '[]'), book]));
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Error fetching book: ' + error.message });
  }
});



module.exports = router;
