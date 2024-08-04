const cassandra = require('cassandra-driver');

const client = new cassandra.Client({ 
  contactPoints: ['cassandra'],
  localDataCenter: 'datacenter1',
  keyspace: 'book_app'
});

client.connect()
  .then(() => {
    console.log('Connected to Cassandra');
  })
  .catch(err => {
    console.error('Failed to connect to Cassandra', err);
  });

module.exports = client;
