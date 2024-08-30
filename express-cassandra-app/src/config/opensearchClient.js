const { Client } = require('@opensearch-project/opensearch');

let opensearchClient;
try {
    opensearchClient = new Client({ node: 'http://localhost:9200' });
    console.log('OpenSearch client connected');
} catch (error) {
    console.error('OpenSearch client connection failed', error);
    opensearchClient = null;
}

module.exports = opensearchClient;
