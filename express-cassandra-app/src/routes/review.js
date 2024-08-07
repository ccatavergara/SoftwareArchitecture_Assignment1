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

// UPDATE REVIEW
router.put('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { book, review, score } = req.body;

  try {
    await client.execute(
      'UPDATE reviews SET book = ?, review = ?, score = ? WHERE id = ?',
      [book, review, parseInt(score, 10), id],
      { prepare: true }
    );
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Error updating review' });
  }
});

// DELETE REVIEW
router.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.execute('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Error deleting review' });
  }
});

// GET SPECIFIC REVIEW
router.get('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    res.json(result.rowLength ? result.rows[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching review' });
  }
});

module.exports = router;
