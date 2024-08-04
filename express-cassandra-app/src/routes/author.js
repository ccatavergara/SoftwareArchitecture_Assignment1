const express = require('express');
const router = express.Router();
const { createAuthor } = require('../models/author');
const client = require('../db');
const { v4: uuid } = require('uuid');
const cassandra = require('cassandra-driver');

// GET AUTHORS
router.get('/authors', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM authors');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching authors' });
  }
});

// CREATE AUTHOR
router.post('/authors', async (req, res) => {
  const { name, date_of_birth, country_of_origin, short_description } = req.body;

  const birthdate = new Date(date_of_birth).toISOString().split('T')[0];

  try {
    await client.execute(
      'INSERT INTO authors (id, name, date_of_birth, country_of_origin, short_description) VALUES (?, ?, ?, ?, ?)',
      [uuid(), name, birthdate, country_of_origin, short_description],
      {prepare: true}
    );
    res.status(201).json({ message: 'Author added successfully' });
  } catch (error) {
    console.error('Error adding author:', error);
    res.status(500).json({ error: `Error adding author: ${error.message}` });
  }
});

module.exports = router;
