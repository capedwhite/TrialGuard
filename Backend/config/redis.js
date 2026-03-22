const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  // Retry with exponential backoff — if Redis is temporarily down
  // don't hammer it with reconnection attempts every millisecond
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

module.exports = redis;