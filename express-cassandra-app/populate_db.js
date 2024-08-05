const { faker } = require('@faker-js/faker');


const cassandra = require('cassandra-driver');

const client = new cassandra.Client({ 
  contactPoints: ['cassandra'],
  localDataCenter: 'datacenter1',
  keyspace: 'book_app'
});

client.connect()
  .then(() => {
    console.log('Connected to Cassandra');
  })
  .catch(err => {
    console.error('Failed to connect to Cassandra', err);
  });


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
    const query = 'INSERT INTO books (id, author, name, summary, date_of_publication, number_of_sales) VALUES (?, ?, ?, ?, ?, ?)';
    await executeCqlCommand(query, [uuidv4(), name, summary, dateOfPublication, numberOfSales]);
  };


const createReview =  async (id,bookId, review, score, numberOfUpvotes) => {
    const query = 'INSERT INTO reviews (id, book, review, score, number_of_upvotes) VALUES (?, ?, ?, ?, ?)';
    await executeCqlCommand(query, [id, bookId, review, score, numberOfUpvotes]);
    };

const createSalesByYear  = async (id,bookId,year,sales) => {
    const query = 'INSERT INTO sales_by_year (id, book, year, sales) VALUES (?, ?, ?, ?)';
    await executeCqlCommand(query, [id, bookId, year, sales]);
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
        dateOfPublication: faker.date.past({ refDate: new Date('2017-01-01') }).getFullYear(),
        numberOfSales: faker.number.int(300000),
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


const createRandomSalesByYear = (bookId,year) => {
    return {
        salesByYearId: faker.string.uuid(),
        bookId,
        year: year,
        sales: faker.number.int(10000),
    }
};


const AUTHORS = faker.helpers.multiple(createRandomAuthor, {
    count:2,
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
    try {
        AUTHORS.forEach(async (author) => {
            await createAuthor(author.authorId, author.name, author.dateOfBirth, author.countryOfOrigin, author.shortDescription);
        }
    );
    } catch (error) {
        console.error('Error creating authors:', error);
    }
    console.log("populating books");
    try {
        BOOKS.forEach(async (book) => {
            await createBook(book.bookId, book.authorId, book.name, book.summary, book.dateOfPublication, book.numberOfSales);
        });
    } catch (error) {
        console.error('Error creating books:', error);
    }
    console.log("populating reviews");
    try {
        REVIEWS.forEach(async (review) => {
            await createReview(review.reviewId, review.bookId, review.review, review.score, review.numberOfUpvotes);
        });
    } catch (error) {
        console.error('Error creating reviews:', error);
    }
    console.log("populating sales by year");
    try {
        SALES_BY_YEAR.forEach(async (salesByYear) => {
            await createSalesByYear(salesByYear.salesByYearId, salesByYear.bookId, salesByYear.year, salesByYear.sales);
        });
    } catch (error) {
        console.error('Error creating sales by year:', error);
    }
    console.log('Database populated successfully');
}

populateDb();
