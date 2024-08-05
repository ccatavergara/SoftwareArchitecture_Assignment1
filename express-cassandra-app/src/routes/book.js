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
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting book' });
  }
});

// GET SPECIFIC BOOK
router.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.execute('SELECT * FROM books WHERE id = ?', [id]);
    res.json(result.rowLength ? result.rows[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching book' });
  }
});


module.exports = router;
