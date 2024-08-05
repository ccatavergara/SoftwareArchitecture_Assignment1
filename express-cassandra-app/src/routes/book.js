const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');
const cassandra = require('cassandra-driver');

// GET BOOKS
router.get('/books', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM books');
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
    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: `Error adding book: ${error.message}` });
  }
});

module.exports = router;
