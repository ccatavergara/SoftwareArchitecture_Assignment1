const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');

// GET SALES BY YEAR
router.get('/salesByYear', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM sales_by_year');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sales' });
  }
});

// CREATE SALE
router.post('/salesByYear', async (req, res) => {
  const { book, year, sales } = req.body;
  const id = uuidv4();

  const query = 'INSERT INTO sales_by_year (id, book, year, sales) VALUES (?, ?, ?, ?)';
  const params = [id, book, year, sales];

  console.log("DATA:", id, book, year, sales);

  try {
      await client.execute(query, params, { prepare: true });
      res.status(201).send({ message: 'Sale added successfully!' });
  } catch (error) {
      console.error('Error adding sale:', error);
      res.status(500).send({ error: 'Error adding sale: ' + error.message });
  }
});

// EDIT SALE
router.put('/salesByYear/:id', async (req, res) => {
  const { id } = req.params;
  const { year, sales } = req.body;

  try {
    await client.execute(
      'UPDATE sales_by_year SET year = ?, sales = ? WHERE id = ?',
      [year, sales, id],
      { prepare: true }
    );
    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Error updating sale' });
  }
});

// DELETE SALE
router.delete('/salesByYear/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.execute('DELETE FROM sales_by_year WHERE id = ?', [id]);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting sale' });
  }
});

// GET SPECIFIC SALE
router.get('/salesByYear/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.execute('SELECT * FROM sales_by_year WHERE id = ?', [id]);
    res.json(result.rowLength ? result.rows[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sale' });
  }
});

module.exports = router;
