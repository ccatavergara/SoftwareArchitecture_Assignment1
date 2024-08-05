const executeCqlCommand = require('../executeCqlCommand');
const { v4: uuidv4 } = require('uuid');

//TODO fix this to add the author uuid
const createBook = async (name, summary, dateOfPublication, numberOfSales) => {
  const query = 'INSERT INTO books (id, name, summary, date_of_publication, number_of_sales) VALUES (?, ?, ?, ?, ?)';
  await executeCqlCommand(query, [uuidv4(), name, summary, dateOfPublication, numberOfSales]);
};

// Define other CRUD functions as needed

module.exports = {
  createBook,
  // other CRUD functions
};
