const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config(); // ✅ load env before reading variables

const redisClient = redis.createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

module.exports = redisClient;