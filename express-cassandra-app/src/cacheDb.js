const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();
const noCache = process.env.NO_CACHE === 'true';
// Make this a env flag
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

const originalGetAsync = promisify(redisClient.get).bind(redisClient);
const originalSetAsync = promisify(redisClient.set).bind(redisClient);
console.log('noCache:', noCache);
redisClient.getAsync = async (key) => {
  if (noCache) {
    return false;
  }
  return originalGetAsync(key);
};

redisClient.setAsync = async (key, value) => {
  if (noCache) {
    return false;
  }
  return originalSetAsync(key, value);
};

module.exports = redisClient;