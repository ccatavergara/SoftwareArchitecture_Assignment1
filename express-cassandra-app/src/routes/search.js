const express = require('express');
const router = express.Router();
const client = require('../db');
let openSearchClient;

try {
    openSearchClient = require('../config/opensearchClient');
    log("OpenSearch client connected for search.");
} catch (error) {
    console.warn('OpenSearch client not available for search, running without search functionality');
}

async function searchBookByDescription(description) {
    if (openSearchClient) {
        console.log("OpenSearchClient aviable:", openSearchClient);
        const response = await openSearchClient.search({
            index: 'books',
            body: {
                query: {
                    multi_match: {
                        query: description,
                        fields: ['summary']
                    }
                }
            }
        });

        const hits = response.body.hits.hits;
        const books = hits.map(hit => hit._source);
        
        const finalData = await Promise.all(books.map(async (element) => {
            let authorId = element.author;
            const authorQuery = 'SELECT * FROM authors WHERE id = ?';
            const authorParams = [authorId];
            const author = await client.execute(authorQuery, authorParams, { prepare: true });
            element.author = author.rows[0].name;
            return element;
        }));

        return finalData;

    } else {
        // Fallback to Cassandra search
        const terms = description.split(' ');
        const query = 'SELECT * FROM books WHERE summary LIKE ?';
        const results = new Set();

        for (const term of terms) {
            const params = [`%${term}%`];
            const result = await client.execute(query, params, { prepare: true });
            result.rows.forEach(row => results.add(JSON.stringify(row)));
        }
        
        const data = Array.from(results).map(JSON.parse);

        const finalData = await Promise.all(data.map(async (element) => {
            let authorId = element.author;
            const authorQuery = 'SELECT * FROM authors WHERE id = ?';
            const authorParams = [authorId];
            const author = await client.execute(authorQuery, authorParams, { prepare: true });
            element.author = author.rows[0].name;
            return element;
        }));
        
        return finalData;
    }
}

router.get('/search', async (req, res) => {
    try {
        console.log("Attempting to search using OpenSearch...");
        const { description } = req.query;
        const books = await searchBookByDescription(description);
        res.json(books);
    } catch (error) {
        console.error('Error during search operation:', error);
        res.status(500).json({ error: 'An error occurred while searching for books' });
    }
});

module.exports = router;
