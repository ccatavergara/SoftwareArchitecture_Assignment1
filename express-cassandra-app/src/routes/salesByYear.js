const express = require('express');
const router = express.Router();
const { createSalesByYear } = require('../models/salesByYear');

router.post('/sales-by-year', async (req, res) => {
  try {
    const { book, year, sales } = req.body;
    await createSalesByYear(book, year, sales);
    res.status(201).send('Sales record created');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Define other routes as needed

module.exports = router;
