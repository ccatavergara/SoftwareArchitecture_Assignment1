const { Client } = require('@opensearch-project/opensearch');
require('dotenv').config();
const USE_OPENSEARCH = process.env.USE_OPENSEARCH === 'true';
console.log("using opensearch: ", USE_OPENSEARCH);
let opensearchClient;
if (USE_OPENSEARCH) {
    console.log('Connecting to OpenSearch');
    opensearchClient = new Client({ node: 'http://opensearch-node1:9200' });
}
else {
    console.log('OpenSearch not enabled');
    opensearchClient = false;
}

async function checkOpenSearchConnection() {
    try {
        const health = await opensearchClient.cluster.health({});
        console.log('OpenSearch cluster health:', health.body.status);
    } catch (error) {
        console.error('Error connecting to OpenSearch:', error);
    }
}

checkOpenSearchConnection();

module.exports = opensearchClient;
