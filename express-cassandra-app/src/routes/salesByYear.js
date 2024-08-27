const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');
const redisClient = require('../cacheDb');

// GET SALES BY YEAR
router.get('/salesByYear', async (req, res) => {
  try {
    cachedSales = await redisClient.getAsync('salesByYear');
    if (cachedSales) {
      console.log('Using cached sales');
      return res.json(JSON.parse(cachedSales));
    }

    const result = await client.execute('SELECT * FROM sales_by_year');
    redisClient.setAsync('salesByYear', JSON.stringify(result.rows));
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
      redisClient.del('salesByYear');
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
    redisClient.del('salesByYear');
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
    redisClient.del('salesByYear');
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting sale' });
  }
});

// GET SPECIFIC SALE
router.get('/salesByYear/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cachedSales = await redisClient.getAsync('salesByYear');
    if (cachedSales){
      console.log('Using cached sales');
      const sales = JSON.parse(cachedSales);
      const sale = sales.find(sale => sale.id === id);
      return res.json(sale);
    }
    const result = await client.execute('SELECT * FROM sales_by_year WHERE id = ?', [id]);
    res.json(result.rowLength ? result.rows[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sale' });
  }
});

module.exports = router;
