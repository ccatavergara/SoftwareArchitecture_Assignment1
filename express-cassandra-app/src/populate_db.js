const { faker, de } = require('@faker-js/faker');


const createTables = require('./createTables');
const client = require('./db');
const fiveYearsAgo = new Date();
fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function initialize() {
    console.log('Creating tables...');
    await createTables();
    console.log('Tables created successfully');

    console.log('Waiting for 5 seconds...');
    await delay(5000); 

    console.log('Continuing with database population...');
    await populateDb().then(() => {
        console.log('Database population completed successfully');
    });
    await delay(9000);
    process.exit(0);
}

const executeCqlCommand = async (query, params = []) => {
try {
    const result = await client.execute(query, params, { prepare: true });
    return result;
} catch (error) {
    console.error('Error executing CQL command:', error);
    throw error;
}
};

const createAuthor = async (id,name, dateOfBirth, countryOfOrigin, shortDescription) => {
    const query = 'INSERT INTO authors (id, name, date_of_birth, country_of_origin, short_description) VALUES (?, ?, ?, ?, ?)';
    await executeCqlCommand(query, [id, name, dateOfBirth, countryOfOrigin, shortDescription]);
  };


const createBook = async (id, authorId, name, summary, dateOfPublication, numberOfSales) => {
    const query = 'INSERT INTO books (id, author, name, summary, date_of_publication, number_of_sales, cover_image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeCqlCommand(query, [id, authorId, name, summary, dateOfPublication, numberOfSales, '']);
  };


const createReview =  async (id,bookId, review, score, numberOfUpvotes) => {
    const query = 'INSERT INTO reviews (id, book, review, score, number_of_upvotes) VALUES (?, ?, ?, ?, ?)';
    await executeCqlCommand(query, [id, bookId, review, score, numberOfUpvotes]);
    };

const createSalesByYear  = async (id,bookId,year,sales) => {
    const query = 'INSERT INTO sales_by_year (id, book, sales, year) VALUES (?, ?, ?, ?)';
    await executeCqlCommand(query, [id, bookId, sales, year]);
}

function createRandomAuthor() {
  return {
    authorId: faker.string.uuid(),
    name: faker.name.fullName(),
    dateOfBirth: faker.date.past(),
    countryOfOrigin: faker.address.country(),
    shortDescription: faker.lorem.sentence(),
  };
};


function createRandomBook(authorId) {
    return {
        bookId: faker.string.uuid(),
        authorId: authorId,
        name: faker.commerce.productName(),
        summary: faker.lorem.paragraph(),
        dateOfPublication: faker.date.between({ from: fiveYearsAgo, to: new Date() }),
        numberOfSales: 0,
    }
}


function createRandomReview(bookId) {
    return {
        reviewId: faker.string.uuid(),
        bookId,
        review: faker.lorem.paragraph(),
        score: faker.number.int(5),
        numberOfUpvotes: faker.number.int(10000),
    }
}


function updateNumberOfSales(bookId, sales) {
    let query =  `UPDATE books SET number_of_sales =  ? WHERE id = ?`;
    return executeCqlCommand(query, [sales, bookId]);
}


const createRandomSalesByYear = (bookId,year) => {
    return {
        salesByYearId: faker.string.uuid(),
        bookId,
        year: year,
        sales: faker.number.int(10000),
    }
};


const AUTHORS = faker.helpers.multiple(createRandomAuthor, {
    count:50,
});


const BOOKS = AUTHORS.flatMap((author) => {
    return Array.from({ length: 6 }, () => createRandomBook(author.authorId));
  });


const REVIEWS = BOOKS.flatMap((book) => {
    return Array.from({ length: faker.number.int({ min: 1, max: 10 })}, () => createRandomReview(book.bookId));
  }
);


const currentYear = new Date().getFullYear();


const SALES_BY_YEAR = BOOKS.flatMap((book) => {
  return Array.from({ length: 6 }, (_, index) => {
    const year = currentYear - index;
    return createRandomSalesByYear(book.bookId, year);
  });
});


const populateDb = async () => {
    console.log('Populating database...');

    console.log("Populating Authors");
    for (const author of AUTHORS) {
        try {
            await createAuthor(author.authorId, author.name, author.dateOfBirth, author.countryOfOrigin, author.shortDescription);
        } catch (error) {
            console.error('Error creating author:', error);
        }
    }

    console.log("Populating Books");
    for (const book of BOOKS) {
        try {
            await createBook(book.bookId, book.authorId, book.name, book.summary, book.dateOfPublication, book.numberOfSales);
        } catch (error) {
            console.error('Error creating book:', error);
        }
    }

    console.log("Populating Reviews");
    for (const review of REVIEWS) {
        try {
            await createReview(review.reviewId, review.bookId, review.review, review.score, review.numberOfUpvotes);
        } catch (error) {
            console.error('Error creating review:', error);
        }
    }

    console.log("Populating Sales by Year");
    let actualBook = '';
    let totalSales = 0;
    for (const salesByYear of SALES_BY_YEAR) {
        try {
            if (actualBook !== salesByYear.bookId) {
                if (actualBook === '') {
                    actualBook = salesByYear.bookId;
                }
                else{
                    await updateNumberOfSales(actualBook, totalSales);
                }
                totalSales = 0;
                actualBook = salesByYear.bookId;
            }
            totalSales += salesByYear.sales;
            await createSalesByYear(salesByYear.salesByYearId, salesByYear.bookId, salesByYear.year, salesByYear.sales);
        } catch (error) {
            console.error('Error creating sales by year:', error);
        }
    }

    console.log('Database populated successfully');
};
initialize().catch(console.error);
