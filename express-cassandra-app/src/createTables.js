const executeCqlCommand = require('./executeCqlCommand');

const createTables = async () => {
  const createAuthorsTable = `
    CREATE TABLE IF NOT EXISTS authors (
      id UUID PRIMARY KEY,
      name TEXT,
      date_of_birth DATE,
      country_of_origin TEXT,
      short_description TEXT
    );
  `;

  const createBooksTable = `
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY,
      name TEXT,
      summary TEXT,
      date_of_publication DATE,
      number_of_sales INT
    );
  `;

  const createReviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY,
      book UUID,
      review TEXT,
      score INT,
      number_of_upvotes INT
    );
  `;

  const createSalesByYearTable = `
    CREATE TABLE IF NOT EXISTS sales_by_year (
      id UUID PRIMARY KEY,
      book UUID,
      year INT,
      sales INT
    );
  `;

  try {
    await executeCqlCommand(createAuthorsTable);
    await executeCqlCommand(createBooksTable);
    await executeCqlCommand(createReviewsTable);
    await executeCqlCommand(createSalesByYearTable);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = createTables;
