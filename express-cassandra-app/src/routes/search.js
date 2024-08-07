const express = require('express');
const router = express.Router();
const client = require('../db');

async function searchBookByDescription(description) {
    const terms = description.split(' ');
    const query = 'SELECT * FROM books WHERE summary LIKE ?';
    const results = new Set();

    for (const term of terms) {
        const params = [`%${term}%`];
        const result = await client.execute(query, params, { prepare: true });
        result.rows.forEach(row => results.add(JSON.stringify(row)));
    }
    const data = Array.from(results).map(JSON.parse);
    console.log(data);
    const finalData = await Promise.all(data.map( async (element) => {
        let authorId = element.author;
        const authorQuery = 'SELECT * FROM authors WHERE id = ?';
        const authorParams = [authorId];
        const author = await client.execute(authorQuery, authorParams, { prepare: true });
        element.author = author.rows[0].name;
        return element;
    }));
    console.log(finalData);
    return finalData;
}

// Example route using the function
router.get('/search', async (req, res) => {
    try {
        const { description } = req.query;
        console.log(description);
        const books = await searchBookByDescription(description);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while searching for books' });
    }
});

module.exports = router;