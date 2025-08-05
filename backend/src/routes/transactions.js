const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getTransactionsByMember,
  getTransactionsByCategory
} = require('../controllers/transactionController');

const router = express.Router();

// GET /api/transactions - Get all transactions
router.get('/', getTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', getTransactionStats);

// GET /api/transactions/category/:category - Get transactions by category
router.get('/category/:category', getTransactionsByCategory);

// POST /api/transactions - Create new transaction
router.post('/', createTransaction);

// GET /api/transactions/:id - Get single transaction
router.get('/:id', getTransaction);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', deleteTransaction);

// GET /api/transactions/member/:memberId - Get transactions by member
router.get('/member/:memberId', getTransactionsByMember);

module.exports = router; 