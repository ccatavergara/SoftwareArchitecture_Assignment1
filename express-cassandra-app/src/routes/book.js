const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');
const cassandra = require('cassandra-driver');
const redisClient = require('../cacheDb');

// GET BOOKS
router.get('/books', async (req, res) => {
  try {
    const cachedBooks = await redisClient.getAsync('books');
    if (cachedBooks) {
      console.log('Using cached books');
      return res.json(JSON.parse(cachedBooks));
    }
    const result = await client.execute('SELECT * FROM books');
    console.log('Fetching books from database');
    redisClient.setAsync('books', JSON.stringify(result.rows));
    console.log('Cached books');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching books' });
  }
});

// CREATE BOOK
//TODO fix this to add the author uuid
router.post('/books', async (req, res) => {
  const { name, summary, date_of_publication, number_of_sales } = req.body;

  try {
    const publicationDate = cassandra.types.LocalDate.fromDate(new Date(date_of_publication));
    await client.execute(
      'INSERT INTO books (id, name, summary, date_of_publication, number_of_sales) VALUES (?, ?, ?, ?, ?)',
      [uuid(), name, summary, publicationDate, parseInt(number_of_sales, 10)],
      { prepare: true }
    );
    redisClient.del('books');
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
    await client.execute(
      'UPDATE books SET name = ?, summary = ?, date_of_publication = ?, number_of_sales = ? WHERE id = ?',
      [name, summary, formattedDate, number_of_sales, id],
      { prepare: true }
    );
    redisClient.del('books');
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Error updating book' });
  }
});

// DELETE BOOK
router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.execute('DELETE FROM books WHERE id = ?', [id]);
    redisClient.del('books');
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting book' });
  }
});

// GET SPECIFIC BOOK
router.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cachedBook = await redisClient.getAsync('books');
    if (cachedBook) {
      console.log('Using cached book');
      const book = JSON.parse(cachedBook).find((book) => book.id === id);
      if (book) {
        return res.json(book);
      }
    }
    const result = await client.execute('SELECT * FROM books WHERE id = ?', [id]);
    res.json(result.rowLength ? result.rows[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching book' });
  }
});


module.exports = router;
