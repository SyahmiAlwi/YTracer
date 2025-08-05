const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const memberRoutes = require('./routes/members');
const transactionRoutes = require('./routes/transactions');
const cardRoutes = require('./routes/cards');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'YTracer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);

// Dashboard stats endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const Member = require('./models/Member');
    const Transaction = require('./models/Transaction');
    const CardDetail = require('./models/CardDetail');
    const CardTransaction = require('./models/CardTransaction');

    // Get member stats
    const totalMembers = await Member.countDocuments();
    const paidMembers = await Member.countDocuments({ paymentStatus: 'Paid' });
    const unpaidMembers = await Member.countDocuments({ paymentStatus: 'Unpaid' });
    const overdueMembers = await Member.getOverdueMembers();

    // Get transaction stats
    const incomeResult = await Transaction.getTotalIncome();
    const outgoingResult = await Transaction.getTotalOutgoing();
    const balanceResult = await Transaction.getNetBalance();

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const totalOutgoing = outgoingResult.length > 0 ? outgoingResult[0].total : 0;
    const netBalance = balanceResult.length > 0 ? balanceResult[0].netBalance : 0;

    // Get upcoming payments
    const upcomingPayments = await Member.getUpcomingPayments(30);

    // Get card stats
    const activeCards = await CardDetail.getActiveCards();
    const expiringCards = await CardDetail.getExpiringCards(30);

    res.json({
      success: true,
      data: {
        members: {
          total: totalMembers,
          paid: paidMembers,
          unpaid: unpaidMembers,
          overdue: overdueMembers.length,
          upcoming: upcomingPayments.length
        },
        transactions: {
          totalIncome,
          totalOutgoing,
          netBalance
        },
        cards: {
          active: activeCards.length,
          expiring: expiringCards.length
        },
        upcomingPayments: upcomingPayments.slice(0, 5) // Return first 5 upcoming payments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching dashboard data'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 YTracer API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app; 