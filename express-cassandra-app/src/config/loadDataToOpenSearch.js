const client = require('../db');
const openSearchClient = require('./opensearchClient');



async function loadBooksToOpenSearch() {
    try {
        const result = await client.execute('SELECT * FROM books');
        const books = result.rows;

        for (const book of books) {
            await openSearchClient.index({
                index: 'books',
                body: {
                id: book.id,
                name: book.name,
                summary: book.summary,
                date_of_publication: book.date_of_publication,
                number_of_sales: book.number_of_sales
                }
            });
        }

        console.log('Books loaded into OpenSearch');
    } catch (error) {
        console.error('Error loading books into OpenSearch:', error);
    }
}


async function loadReviewsToOpenSearch() {
    try {
        const result = await client.execute('SELECT * FROM reviews');
        const reviews = result.rows;

        for (const review of reviews) {
            await openSearchClient.index({
                index: 'reviews',
                id: review.id.toString(),
                body: {
                book: review.book,
                review: review.review,
                score: review.score,
                number_of_upvotes: review.number_of_upvotes
                }
            });
        }

        console.log('Reviews loaded into OpenSearch');
    } catch (error) {
        console.error('Error loading reviews into OpenSearch:', error);
    }
}


async function loadDataToOpenSearch() {
    try {
        const pingResponse = await openSearchClient.ping();
        if (pingResponse) {
            console.log('OpenSearch is available. Loading data...');
            await loadBooksToOpenSearch();
            await loadReviewsToOpenSearch();
            console.log('Data successfully loaded into OpenSearch');
        } else {
            console.log('OpenSearch is not available. Skipping data load.');
        }
    } catch (error) {
        console.error('Error checking OpenSearch availability or loading data:', error);
    }
}

module.exports = loadDataToOpenSearch;