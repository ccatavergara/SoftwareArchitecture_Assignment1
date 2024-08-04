const executeCqlCommand = require('../executeCqlCommand');
const { v4: uuidv4 } = require('uuid');

const createSalesByYear = async (book, year, sales) => {
  const query = 'INSERT INTO sales_by_year (id, book, year, sales) VALUES (?, ?, ?, ?)';
  await executeCqlCommand(query, [uuidv4(), book, year, sales]);
};

// Define other CRUD functions as needed

module.exports = {
  createSalesByYear,
  // other CRUD functions
};
