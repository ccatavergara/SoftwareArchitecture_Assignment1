const openSearchClient = require('./opensearchClient');

async function ensureIndexExists(indexName, mapping) {
    try {
        const indexExists = await openSearchClient.indices.exists({ index: indexName });
        if (!indexExists.body) {
            await openSearchClient.indices.create({
                index: indexName,
                body: {
                    mappings: mapping
                }
            });
            console.log(`Index ${indexName} created successfully`);
        } else {
            console.log(`Index ${indexName} already exists`);
        }
    } catch (error) {
        console.error(`Error ensuring index ${indexName} exists: ${error}`);
    }
};

// Mappings
const bookMapping = {
    properties: {
        id: { type: 'keyword' },
        name: { type: 'text' },
        summary: { type: 'text' },
        date_of_publication: { type: 'date' },
        number_of_sales: { type: 'integer' }
    }
};

const reviewMapping = {
    properties: {
        id: { type: 'keyword' },
        book: { type: 'keyword' },
        review: { type: 'text' },
        score: { type: 'integer' },
        number_of_upvotes: { type: 'integer' }
    }
};

const authorMapping = {
    properties: {
        id: { type: 'keyword' },
        name: { type: 'text' },
        date_of_birth: { type: 'date' },
        country_of_origin: { type: 'text' },
        short_description: { type: 'text' }
    }
};

const salesByYearMapping = {
    properties: {
        id: { type: 'keyword' },
        book: { type: 'keyword' },
        year: { type: 'integer' },
        sales: { type: 'integer' }
    }
};

async function createIndices() {
    await ensureIndexExists('books', bookMapping);
    await ensureIndexExists('reviews', reviewMapping);
    await ensureIndexExists('authors', authorMapping);
    await ensureIndexExists('sales_by_year', salesByYearMapping);
};

module.exports = createIndices;
