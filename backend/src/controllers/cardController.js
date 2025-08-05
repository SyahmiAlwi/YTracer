const asyncHandler = require('express-async-handler');
const CardDetail = require('../models/CardDetail');
const CardTransaction = require('../models/CardTransaction');

// @desc    Get all card details
// @route   GET /api/cards
// @access  Public
const getCards = asyncHandler(async (req, res) => {
  const { isActive, cardType } = req.query;
  
  let query = {};
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (cardType) {
    query.cardType = cardType;
  }
  
  const cards = await CardDetail.find(query).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: cards.length,
    data: cards
  });
});

// @desc    Get single card detail
// @route   GET /api/cards/:id
// @access  Public
const getCard = asyncHandler(async (req, res) => {
  const card = await CardDetail.findById(req.params.id);
  
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  
  res.json({
    success: true,
    data: card
  });
});

// @desc    Create new card detail
// @route   POST /api/cards
// @access  Public
const createCard = asyncHandler(async (req, res) => {
  const {
    cardName,
    lastFourDigits,
    expiryDate,
    cardType,
    bankName,
    cardHolderName,
    notes,
    monthlyLimit,
    currentBalance
  } = req.body;
  
  // Validate required fields
  if (!cardName || !lastFourDigits || !expiryDate) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  // Check if card with same last four digits already exists
  const existingCard = await CardDetail.findOne({ lastFourDigits });
  if (existingCard) {
    res.status(400);
    throw new Error('Card with these last four digits already exists');
  }
  
  const card = await CardDetail.create({
    cardName,
    lastFourDigits,
    expiryDate,
    cardType: cardType || 'Other',
    bankName: bankName || '',
    cardHolderName: cardHolderName || '',
    notes: notes || '',
    monthlyLimit: monthlyLimit || 1000,
    currentBalance: currentBalance || 0
  });
  
  res.status(201).json({
    success: true,
    data: card
  });
});

// @desc    Update card detail
// @route   PUT /api/cards/:id
// @access  Public
const updateCard = asyncHandler(async (req, res) => {
  const {
    cardName,
    lastFourDigits,
    expiryDate,
    cardType,
    bankName,
    cardHolderName,
    notes,
    monthlyLimit,
    currentBalance
  } = req.body;
  
  let card = await CardDetail.findById(req.params.id);
  
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  
  // Check if lastFourDigits is being changed and if it conflicts with existing card
  if (lastFourDigits && lastFourDigits !== card.lastFourDigits) {
    const existingCard = await CardDetail.findOne({ 
      lastFourDigits,
      _id: { $ne: req.params.id }
    });
    if (existingCard) {
      res.status(400);
      throw new Error('Card with these last four digits already exists');
    }
  }
  
  card = await CardDetail.findByIdAndUpdate(
    req.params.id,
    {
      cardName,
      lastFourDigits,
      expiryDate,
      cardType,
      bankName,
      cardHolderName,
      notes,
      monthlyLimit,
      currentBalance
    },
    {
      new: true,
      runValidators: true
    }
  );
  
  res.json({
    success: true,
    data: card
  });
});

// @desc    Delete card detail
// @route   DELETE /api/cards/:id
// @access  Public
const deleteCard = asyncHandler(async (req, res) => {
  const card = await CardDetail.findById(req.params.id);
  
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  
  // Check if card has transactions
  const transactionCount = await CardTransaction.countDocuments({ cardId: req.params.id });
  if (transactionCount > 0) {
    res.status(400);
    throw new Error('Cannot delete card with existing transactions');
  }
  
  await card.deleteOne();
  
  res.json({
    success: true,
    message: 'Card deleted successfully'
  });
});

// @desc    Get card transactions
// @route   GET /api/cards/:id/transactions
// @access  Public
const getCardTransactions = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  // Validate card exists
  const card = await CardDetail.findById(cardId);
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  
  let query = { cardId };
  
  if (type) {
    query.type = type;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await CardTransaction.find(query)
    .populate('cardId', 'cardName lastFourDigits')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await CardTransaction.countDocuments(query);
  
  res.json({
    success: true,
    count: transactions.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    },
    data: transactions
  });
});

// @desc    Create card transaction
// @route   POST /api/cards/:id/transactions
// @access  Public
const createCardTransaction = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const {
    date,
    amount,
    description,
    type,
    category,
    status,
    referenceNumber,
    notes
  } = req.body;
  
  // Validate card exists
  const card = await CardDetail.findById(cardId);
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  
  // Validate required fields
  if (!date || !amount || !description || !type) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  // Calculate balance after transaction
  let balanceAfter;
  if (type === 'Deposit') {
    balanceAfter = card.currentBalance + amount;
  } else if (type === 'Withdrawal') {
    if (card.currentBalance < amount) {
      res.status(400);
      throw new Error('Insufficient balance');
    }
    balanceAfter = card.currentBalance - amount;
  }
  
  const transaction = await CardTransaction.create({
    cardId,
    date,
    amount,
    description,
    type,
    category: category || 'Other',
    status: status || 'Completed',
    referenceNumber,
    notes: notes || '',
    balanceAfter
  });
  
  const populatedTransaction = await CardTransaction.findById(transaction._id)
    .populate('cardId', 'cardName lastFourDigits');
  
  res.status(201).json({
    success: true,
    data: populatedTransaction
  });
});

// @desc    Get card statistics
// @route   GET /api/cards/:id/stats
// @access  Public
const getCardStats = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Validate card exists
  const card = await CardDetail.findById(cardId);
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  
  // Get total deposits
  const depositsResult = await CardTransaction.getTotalDeposits(
    cardId,
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );
  const totalDeposits = depositsResult.length > 0 ? depositsResult[0].total : 0;
  
  // Get total withdrawals
  const withdrawalsResult = await CardTransaction.getTotalWithdrawals(
    cardId,
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );
  const totalWithdrawals = withdrawalsResult.length > 0 ? withdrawalsResult[0].total : 0;
  
  // Get recent transactions
  const recentTransactions = await CardTransaction.getRecentCardTransactions(cardId, 5);
  
  res.json({
    success: true,
    data: {
      currentBalance: card.currentBalance,
      totalDeposits,
      totalWithdrawals,
      recentTransactions
    }
  });
});

// @desc    Get expiring cards
// @route   GET /api/cards/expiring
// @access  Public
const getExpiringCards = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const cards = await CardDetail.getExpiringCards(parseInt(days));
  
  res.json({
    success: true,
    count: cards.length,
    data: cards
  });
});

module.exports = {
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getCardTransactions,
  createCardTransaction,
  getCardStats,
  getExpiringCards
}; 