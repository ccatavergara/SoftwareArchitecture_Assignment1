const executeCqlCommand = require('../executeCqlCommand');
const { v4: uuidv4 } = require('uuid');

const createAuthor = async (name, dateOfBirth, countryOfOrigin, shortDescription) => {
  const query = 'INSERT INTO authors (id, name, date_of_birth, country_of_origin, short_description) VALUES (?, ?, ?, ?, ?)';
  await executeCqlCommand(query, [uuidv4(), name, dateOfBirth, countryOfOrigin, shortDescription]);
};

// Define other CRUD functions as needed

module.exports = {
  createAuthor,
  // other CRUD functions
};
