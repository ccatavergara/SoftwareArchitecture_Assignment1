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
      author UUID,
      name TEXT,
      summary TEXT,
      date_of_publication DATE,
      number_of_sales INT,
      cover_image_path TEXT
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

  const createIndexingForBooks = `CREATE CUSTOM INDEX books_summary_idx ON books (summary) USING 'org.apache.cassandra.index.sasi.SASIIndex' WITH OPTIONS =  {'mode': 'CONTAINS'};`;

  try {
    await executeCqlCommand(createAuthorsTable);
    await executeCqlCommand(createBooksTable);
    await executeCqlCommand(createReviewsTable);
    await executeCqlCommand(createSalesByYearTable);
    await executeCqlCommand(createIndexingForBooks);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = createTables;
