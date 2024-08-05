const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const client = require('../db');

// GET AUTHORS
router.get('/authors', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM authors');
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

  try {
    await client.execute(
      'INSERT INTO authors (id, name, date_of_birth, country_of_origin, short_description) VALUES (?, ?, ?, ?, ?)',
      [uuid(), name, birthdate, country_of_origin, short_description],
      { prepare: true }
    );
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
    await client.execute(
      'UPDATE authors SET name = ?, date_of_birth = ?, country_of_origin = ?, short_description = ? WHERE id = ?',
      [name, birthdate, country_of_origin, short_description, id],
      { prepare: true }
    );
    res.json({ message: 'Author updated successfully' });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: `Error updating author: ${error.message}` });
  }
});

// DELETE AUTHOR
router.delete('/authors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.execute('DELETE FROM authors WHERE id = ?', [id], { prepare: true });
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
    const result = await client.execute('SELECT * FROM authors WHERE id = ?', [id]);
    if (result.rowLength === 0) {
      res.status(404).json({ error: 'Author not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ error: `Error fetching author: ${error.message}` });
  }
});

module.exports = router;
