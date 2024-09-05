const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();
const USE_CACHE = process.env.USE_CACHE === 'true';
// Make this a env flag
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

redisClient.on('error', (error) => {
  console.error('Redis Error:', error);
});

if (USE_CACHE){
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });
}

const originalGetAsync = promisify(redisClient.get).bind(redisClient);
const originalSetAsync = promisify(redisClient.set).bind(redisClient);
console.log('USE_CACHE:', USE_CACHE);
redisClient.getAsync = async (key) => {
  if (USE_CACHE) {
    return originalGetAsync(key);
  }
  return false

};

redisClient.setAsync = async (key, value) => {
  if (USE_CACHE) {
    return originalSetAsync(key, value);
  }
  return false;
};

module.exports = redisClient;
