const express = require('express');
const router = express.Router();
const { createBook } = require('../models/book');

router.post('/books', async (req, res) => {
  try {
    const { name, summary, dateOfPublication, numberOfSales } = req.body;
    await createBook(name, summary, dateOfPublication, numberOfSales);
    res.status(201).send('Book created');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Define other routes as needed

module.exports = router;
