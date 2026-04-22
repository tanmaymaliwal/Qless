const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL,
    'https://qlesscollege.netlify.app',
    
  ],
  credentials: true
  
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/super', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cafes', require('./routes/cafe'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/users', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Qless API is running'
  });
});

app.use(require('./middleware/errorHandler'));

// Connect DB and Redis FIRST then start server
const startServer = async () => {
  try {
    // Step 1 — Connect MongoDB
    await connectDB();
    console.log('MongoDB Connected ');

    // Step 2 — Connect Redis
    await redisClient.connect();
    console.log('Redis Connected ');

    // Step 3 — Create limiters AFTER Redis connected
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'auth_limit:',
      }),
      message: {
        success: false,
        message: 'Too many attempts, please try again after 15 minutes'
      }
    });

    const orderLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 5,
      // Fix IPv6 issue — use ipKeyGenerator helper
      keyGenerator: (req) => {
        if (req.user?.id) return req.user.id;
        return rateLimit.ipKeyGenerator(req);
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'order_limit:',
      }),
      message: {
        success: false,
        message: 'Too many orders, please slow down'
      }
    });

    // Wallet limiter 
    const walletLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      keyGenerator: (req) => {
        if (req.user?.id) return req.user.id;
        return rateLimit.ipKeyGenerator(req);
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'wallet_limit:',
      }),
      message: {
        success: false,
        message: 'Too many wallet requests, please try again after 1 hour'
      }
    });

    // Step 4 — Apply limiters AFTER they are created
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/orders', orderLimiter);

    // Step 5 — Start server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} `);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();