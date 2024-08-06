const express = require('express');
const router = express.Router();
const client = require('../db');

async function getReviewsForBook(bookId) {
  const query = 'SELECT * FROM reviews WHERE book = ? ALLOW FILTERING';
  const params = [bookId];
  const result = await client.execute(query, params, { prepare: true });
  return result.rows;
}

router.get('/top10Books', async (req, res) => {
  try {
    // Step 1: Fetch all books
    const booksQuery = 'SELECT * FROM books';
    const booksResult = await client.execute(booksQuery);
    const books = booksResult.rows;

    // Step 2: Calculate average ratings and find top 10
    const bookRatings = [];
    for (const book of books) {
      const reviews = await getReviewsForBook(book.id);
      if (reviews.length === 0) continue; // Skip books with no reviews

      const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
      const averageScore = totalScore / reviews.length;
      bookRatings.push({ ...book, averageScore, reviews });
    }

    // Sort books by average score and get top 10
    bookRatings.sort((a, b) => b.averageScore - a.averageScore);
    const top10Books = bookRatings.slice(0, 10);

    // Step 3: Find highest and lowest rated reviews for top 10 books
    const top10BooksWithReviews = await Promise.all(top10Books.map(async (book) => {
      const highestRatedReview = book.reviews.reduce((max, review) => review.score > max.score ? review : max, book.reviews[0]);
      const lowestRatedReview = book.reviews.reduce((min, review) => review.score < min.score ? review : min, book.reviews[0]);

      return {
        ...book,
        highestRatedReview,
        lowestRatedReview
      };
    }));

    res.status(200).json(top10BooksWithReviews);
  } catch (error) {
    console.error('Error fetching top 10 books:', error);
    res.status(500).send({ error: 'Error fetching top 10 books: ' + error.message });
  }
});

module.exports = router;
