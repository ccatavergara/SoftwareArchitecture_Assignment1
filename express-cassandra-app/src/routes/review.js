const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');

// GET REVIEWS
router.get('/reviews', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM reviews');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// CREATE REVIEW
router.post('/reviews', async (req, res) => {
  const { book, review, score } = req.body;

  try {
    await client.execute(
      'INSERT INTO reviews (id, book, review, score, number_of_upvotes) VALUES (?, ?, ?, ?, ?)',
      [uuid(), book, review, parseInt(score, 10), 0],
      { prepare: true }
    );
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: `Error adding review: ${error.message}` });
  }
});

module.exports = router;
