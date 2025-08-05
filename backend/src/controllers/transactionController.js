const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Public
const getTransactions = asyncHandler(async (req, res) => {
  const { type, memberId, category, status, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  let query = {};
  
  // Filter by transaction type
  if (type) {
    query.type = type;
  }
  
  // Filter by member
  if (memberId) {
    query.memberId = memberId;
  }
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by date range
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await Transaction.find(query)
    .populate('memberId', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Transaction.countDocuments(query);
  
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

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Public
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('memberId', 'name');
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  res.json({
    success: true,
    data: transaction
  });
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = asyncHandler(async (req, res) => {
  const {
    date,
    amount,
    memberId,
    description,
    type,
    category,
    paymentMethod,
    status,
    receiptNumber,
    notes
  } = req.body;
  
  // Validate required fields
  if (!date || !amount || !description || !type) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  // Validate member exists if memberId is provided
  if (memberId) {
    const member = await Member.findById(memberId);
    if (!member) {
      res.status(400);
      throw new Error('Member not found');
    }
  }
  
  // Validate incoming transactions must have memberId
  if (type === 'Incoming' && !memberId) {
    res.status(400);
    throw new Error('Incoming transactions must be associated with a member');
  }
  
  const transaction = await Transaction.create({
    date,
    amount,
    memberId,
    description,
    type,
    category: category || 'Other',
    paymentMethod: paymentMethod || 'Other',
    status: status || 'Completed',
    receiptNumber,
    notes: notes || ''
  });
  
  const populatedTransaction = await Transaction.findById(transaction._id).populate('memberId', 'name');
  
  res.status(201).json({
    success: true,
    data: populatedTransaction
  });
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Public
const updateTransaction = asyncHandler(async (req, res) => {
  const {
    date,
    amount,
    memberId,
    description,
    type,
    category,
    paymentMethod,
    status,
    receiptNumber,
    notes
  } = req.body;
  
  let transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  // Validate member exists if memberId is provided
  if (memberId) {
    const member = await Member.findById(memberId);
    if (!member) {
      res.status(400);
      throw new Error('Member not found');
    }
  }
  
  // Validate incoming transactions must have memberId
  if (type === 'Incoming' && !memberId) {
    res.status(400);
    throw new Error('Incoming transactions must be associated with a member');
  }
  
  transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    {
      date,
      amount,
      memberId,
      description,
      type,
      category,
      paymentMethod,
      status,
      receiptNumber,
      notes
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('memberId', 'name');
  
  res.json({
    success: true,
    data: transaction
  });
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  await transaction.deleteOne();
  
  res.json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Public
const getTransactionStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }
  
  // Get total income
  const incomeResult = await Transaction.getTotalIncome(
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );
  const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
  
  // Get total outgoing
  const outgoingResult = await Transaction.getTotalOutgoing(
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );
  const totalOutgoing = outgoingResult.length > 0 ? outgoingResult[0].total : 0;
  
  // Get net balance
  const balanceResult = await Transaction.getNetBalance(
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );
  const netBalance = balanceResult.length > 0 ? balanceResult[0].netBalance : 0;
  
  // Get transaction counts by type
  const incomeCount = await Transaction.countDocuments({ type: 'Incoming', ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }) });
  const outgoingCount = await Transaction.countDocuments({ type: 'Outgoing', ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }) });
  
  // Get recent transactions
  const recentTransactions = await Transaction.getRecentTransactions(5);
  
  res.json({
    success: true,
    data: {
      totalIncome,
      totalOutgoing,
      netBalance,
      incomeCount,
      outgoingCount,
      recentTransactions
    }
  });
});

// @desc    Get transactions by member
// @route   GET /api/transactions/member/:memberId
// @access  Public
const getTransactionsByMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { limit = 10 } = req.query;
  
  // Validate member exists
  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  
  const transactions = await Transaction.getTransactionsByMember(memberId, parseInt(limit));
  
  res.json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Get transactions by category
// @route   GET /api/transactions/category/:category
// @access  Public
const getTransactionsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await Transaction.find({ category })
    .populate('memberId', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Transaction.countDocuments({ category });
  
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

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getTransactionsByMember,
  getTransactionsByCategory
}; 