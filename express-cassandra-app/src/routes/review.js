const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');
const redisClient = require('../cacheDb');

// GET REVIEWS
// I DONT KNOW IF THIS LOGIC IS CORRECT
router.get('/reviews', async (req, res) => {
  try {
    const cachedReviews = await redisClient.getAsync('reviews');
    const cachedBooks = await redisClient.getAsync('books');
    if (cachedBooks && cachedReviews) {
      console.log('Using cached reviews');
      return res.json(JSON.parse(cachedReviews));
    }
    const result = await client.execute('SELECT * FROM reviews');
    const books = await client.execute('SELECT * FROM books');
    const bookReduced = books.rows.map((book) => {
      return { id: book.id, name: book.name };
    });
    result.rows.forEach((review) => {
      

      const book = bookReduced.find((book) => book.id.toString() === review.book.toString());
      review["bookName"] = book.name;
    });
    redisClient.setAsync('reviews', JSON.stringify(result.rows));
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
    redisClient.del('reviews');
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
    redisClient.del('reviews');
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
    redisClient.del('reviews');
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
    cachedReviews = await redisClient.getAsync('reviews');
    if (cachedReviews) {
      console.log('Using cached reviews');
      const reviews = JSON.parse(cachedReviews);
      const review = reviews.find((review) => review.id === id);
      return res.json(review);
    }
    const result = await client.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    res.json(result.rowLength ? result.rows[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching review' });
  }
});

module.exports = router;
