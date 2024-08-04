const express = require('express');
const router = express.Router();
const { createReview } = require('../models/review');

router.post('/reviews', async (req, res) => {
  try {
    const { book, review, score, numberOfUpvotes } = req.body;
    await createReview(book, review, score, numberOfUpvotes);
    res.status(201).send('Review created');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Define other routes as needed

module.exports = router;
