const express = require('express');
const router = express.Router();
const client = require('../db');
const { v4: uuid } = require('uuid');
const redisClient = require('../cacheDb');
const openSearchClient = require('../config/opensearchClient')

// GET REVIEWS
// I DONT KNOW IF THIS LOGIC IS CORRECT
router.get('/reviews', async (req, res) => {
  try {
    
    // If OpenSearch is not available, check if reviews are cached in Redis
    const cachedReviews = await redisClient.getAsync('reviews');
    const cachedBooks = await redisClient.getAsync('books');
    if (cachedReviews && cachedBooks) {
      console.log('Using cached reviews');
      const reviews = JSON.parse(cachedReviews);
      const books = JSON.parse(cachedBooks);

      // Map book names to reviews from cache
      reviews.forEach(review => {
        if (review.book) {
          const book = books.find(book => book.id && book.id.toString() === review.book.toString());
          review.bookName = book ? book.name : 'Unknown Book';
        } else {
          review.bookName = 'Unknown Book';
        }
      });

      return res.json(reviews);
    }

    // Fetch reviews from Cassandra
    const result = await client.execute('SELECT * FROM reviews');
    console.log('Fetching reviews from database');

    // Fetch books from Cassandra to map review to book names
    const books = await client.execute('SELECT * FROM books');
    const bookReduced = books.rows.map(book => ({
      id: book.id,
      name: book.name
    }));

    // Map book names to reviews
    result.rows.forEach(review => {
      if (review.book) {
        const book = bookReduced.find(book => book.id && book.id.toString() === review.book.toString());
        review.bookName = book ? book.name : 'Unknown Book';
      } else {
        review.bookName = 'Unknown Book';
      }
    });

    // Cache reviews and books in Redis
    redisClient.setAsync('reviews', JSON.stringify(result.rows));
    redisClient.setAsync('books', JSON.stringify(bookReduced));
    console.log('Cached reviews and books');

    // Send reviews as response
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Error fetching reviews: ' + error.message });
  }
});

// CREATE REVIEW
router.post('/reviews', async (req, res) => {
  const { book, review, score } = req.body;
  console.log('Creating review:', book, review, score);
  const reviewId = uuid();

  try {
    // Insert review in Cassandra
    await client.execute(
      'INSERT INTO reviews (id, book, review, score, number_of_upvotes) VALUES (?, ?, ?, ?, ?)',
      [reviewId, book, review, parseInt(score, 10), 0],
      { prepare: true }
    );

    // If OpenSearch is available, index the review
    if (openSearchClient) {
      console.log("Indexing review in OpenSearch");
      await openSearchClient.index({
        index: 'reviews',
        id: reviewId,
        body: {
          id: reviewId,
          book: book,
          review: review,
          score: parseInt(score, 10),
          number_of_upvotes: 0
        }
      });
    }

    // Clear the reviews cache
    await redisClient.del('reviews', (err, response) => {
      if (err) {
        console.error('Error clearing Redis cache:', err);
      } else {
        console.log('Redis cache cleared:', response);
      }
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: `Error adding review: ${error.message}` });
  }
});

// EDIT REVIEW
router.put('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { book, review, score } = req.body;
  

  try {
    // Update review in Cassandra
    await client.execute(
      'UPDATE reviews SET book = ?, review = ?, score = ? WHERE id = ?',
      [book, review, parseInt(score, 10), id],
      { prepare: true }
    );

    // If OpenSearch is available, update the review
    if (openSearchClient) {
      console.log("Updating review in OpenSearch");
      await openSearchClient.update({
        index: 'reviews',
        id: id,
        body: {
          doc: {
            book: book,
            review: review,
            score: parseInt(score, 10),
          }
        }
      });
    }

    await redisClient.del('reviews');

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Error updating review' });
  }
});


// DELETE REVIEW
router.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete review in Cassandra
    await client.execute('DELETE FROM reviews WHERE id = ?', [id]);

    // If OpenSearch is available, delete the review
    if (openSearchClient) {
      console.log("Deleting review from OpenSearch");
      await openSearchClient.delete({
        index: 'reviews',
        id: id
      });
    }

    await redisClient.del('reviews');

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Error deleting review' });
  }
});


// GET SPECIFIC REVIEW
router.get('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First, try to get the review from the cache
    const cachedReviews = await redisClient.getAsync('reviews');
    if (cachedReviews) {
      console.log('Using cached reviews');
      const reviews = JSON.parse(cachedReviews);
      const review = reviews.find((review) => review.id === id);
      if (review) {
        return res.json(review);
      }
    }

 

    // If OpenSearch is not available, search in Cassandra
    const result = await client.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    
    if (result.rowLength) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Error fetching review' });
  }
});


module.exports = router;
