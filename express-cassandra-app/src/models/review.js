const executeCqlCommand = require('../executeCqlCommand');
const { v4: uuidv4 } = require('uuid');

const createReview = async (book, review, score, numberOfUpvotes) => {
  const query = 'INSERT INTO reviews (id, book, review, score, number_of_upvotes) VALUES (?, ?, ?, ?, ?)';
  await executeCqlCommand(query, [uuidv4(), book, review, score, numberOfUpvotes]);
};

// Define other CRUD functions as needed

module.exports = {
  createReview,
  // other CRUD functions
};
