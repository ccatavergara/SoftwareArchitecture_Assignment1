const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

redisClient.on('error', (error) => {
  console.error('Redis Error:', error);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Promisify Redis methods
redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
redisClient.setAsync = promisify(redisClient.set).bind(redisClient);

module.exports = redisClient;