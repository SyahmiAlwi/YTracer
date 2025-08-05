const express = require('express');
const {
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getCardTransactions,
  createCardTransaction,
  getCardStats,
  getExpiringCards
} = require('../controllers/cardController');

const router = express.Router();

// GET /api/cards - Get all cards
router.get('/', getCards);

// GET /api/cards/expiring - Get expiring cards
router.get('/expiring', getExpiringCards);

// POST /api/cards - Create new card
router.post('/', createCard);

// GET /api/cards/:id - Get single card
router.get('/:id', getCard);

// PUT /api/cards/:id - Update card
router.put('/:id', updateCard);

// DELETE /api/cards/:id - Delete card
router.delete('/:id', deleteCard);

// GET /api/cards/:id/stats - Get card statistics
router.get('/:id/stats', getCardStats);

// GET /api/cards/:id/transactions - Get card transactions
router.get('/:id/transactions', getCardTransactions);

// POST /api/cards/:id/transactions - Create card transaction
router.post('/:id/transactions', createCardTransaction);

module.exports = router; 