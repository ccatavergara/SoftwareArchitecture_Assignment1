const { Client } = require('@opensearch-project/opensearch');

const opensearchClient = new Client({ node: 'http://opensearch-node1:9200' });

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
