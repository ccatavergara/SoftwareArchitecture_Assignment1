const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');
const cassandra = require('cassandra-driver');

router.get('/tables', async (req, res) => {
    try {
        const authorsResult = await client.execute('SELECT * FROM authors');
        const authors = authorsResult.rows;

        const booksResult = await client.execute('SELECT * FROM books');
        const books = booksResult.rows;

        const reviewsResult = await client.execute('SELECT * FROM reviews');
        const reviews = reviewsResult.rows;

        const salesResult = await client.execute('SELECT * FROM sales_by_year');
        const sales = salesResult.rows;

        const authorData = authors.map(author => {
            const authorBooks = books.filter(book => book.author.equals(author.id));
            const numBooks = authorBooks.length;
            const totalSales = authorBooks.reduce((acc, book) => {
                const bookSales = sales.filter(sale => sale.book.equals(book.id));
                return acc + bookSales.reduce((acc, sale) => acc + sale.sales, 0);
            }, 0);
            const totalScore = authorBooks.reduce((acc, book) => {
                const bookReviews = reviews.filter(review => review.book.equals(book.id));
                return acc + bookReviews.reduce((acc, review) => acc + review.score, 0);
            }, 0);
            const numReviews = authorBooks.reduce((acc, book) => acc + reviews.filter(review => review.book.equals(book.id)).length, 0);
            const avgScore = numReviews ? totalScore / numReviews : 0;

            return {
                author: author.name,
                numBooks,
                avgScore,
                totalSales
            };
        });

        console.log(authorData);
        res.json(authorData);
    } catch (error) {
        console.error('Error fetching information:', error);
        res.status(500).json({ error: 'Error fetching information.', details: error.message });
    }
});

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const client = require('../db');
// const { v4: uuid } = require('uuid');
// const cassandra = require('cassandra-driver');

// async function fetchAuthors() {
//     const authorsResult = await client.execute('SELECT * FROM authors');
//     return authorsResult.rows;
// }

// async function fetchBooks() {
//     const booksResult = await client.execute('SELECT * FROM books');
//     return booksResult.rows;
// }

// async function fetchReviews() {
//     const reviewsResult = await client.execute('SELECT * FROM reviews');
//     return reviewsResult.rows;
// }

// async function fetchSales() {
//     const salesResult = await client.execute('SELECT * FROM sales_by_year');
//     return salesResult.rows;
// }

// async function fetchBookDetails(bookId) {
//     try {
//         const response = await fetch(`/api/books/${bookId}`);
//         return await response.json();
//     } catch (error) {
//         console.error(`Error fetching details for book ${bookId}:`, error);
//         return {};
//     }
// }

// async function fetchTopRatedBooks(reviews) {
//     const topBooksQuery = `
//         SELECT book, AVG(score) as avg_score
//         FROM reviews
//         GROUP BY book
//         ORDER BY avg_score DESC
//         LIMIT 10
//     `;
//     const topBooksResult = await client.execute(topBooksQuery);
//     return topBooksResult.rows;
// }

// async function fetchBookReviews(bookId) {
//     const bookReviewsQuery = `
//         SELECT * FROM reviews
//         WHERE book = ?
//         ORDER BY score DESC
//     `;
//     const bookReviewsResult = await client.execute(bookReviewsQuery, [bookId], { prepare: true });
//     return bookReviewsResult.rows;
// }

// async function fetchTopRatedBooksWithReviews() {
//     const reviews = await fetchReviews();
//     const topBooks = await fetchTopRatedBooks(reviews);

//     const booksWithReviews = await Promise.all(topBooks.map(async (book) => {
//         const reviews = await fetchBookReviews(book.book);
//         const details = await fetchBookDetails(book.book);
//         const mostPopularReview = reviews.reduce((max, review) => (review.number_of_upvotes > (max.number_of_upvotes || 0)) ? review : max, {});
//         const highestRatedReview = reviews[0];
//         const lowestRatedReview = reviews[reviews.length - 1];

//         return {
//             bookId: book.book,
//             bookName: details.name,
//             avgScore: book.avg_score,
//             mostPopularReview,
//             highestRatedReview,
//             lowestRatedReview
//         };
//     }));

//     return booksWithReviews;
// }

// router.get('/tables', async (req, res) => {
//     try {
//         const authors = await fetchAuthors();
//         const books = await fetchBooks();
//         const reviews = await fetchReviews();
//         const sales = await fetchSales();

//         const authorData = authors.map(author => {
//             const authorBooks = books.filter(book => book.author.equals(author.id));
//             const numBooks = authorBooks.length;
//             const totalSales = authorBooks.reduce((acc, book) => {
//                 const bookSales = sales.filter(sale => sale.book.equals(book.id));
//                 return acc + bookSales.reduce((acc, sale) => acc + sale.sales, 0);
//             }, 0);
//             const totalScore = authorBooks.reduce((acc, book) => {
//                 const bookReviews = reviews.filter(review => review.book.equals(book.id));
//                 return acc + bookReviews.reduce((acc, review) => acc + review.score, 0);
//             }, 0);
//             const numReviews = authorBooks.reduce((acc, book) => acc + reviews.filter(review => review.book.equals(book.id)).length, 0);
//             const avgScore = numReviews ? totalScore / numReviews : 0;

//             return {
//                 author: author.name,
//                 numBooks,
//                 avgScore,
//                 totalSales
//             };
//         });

//         const topRatedBooks = await fetchTopRatedBooksWithReviews();
//         console.log('finding informatioo')
//         console.log(authorData);
//         console.log(topRatedBooks);
//         res.json({ authorData, topRatedBooks });
//     } catch (error) {
//         res.status(500).json({ error: 'Error fetching information.' });
//     }
// });

// module.exports = router;
