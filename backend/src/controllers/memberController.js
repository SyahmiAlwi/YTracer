const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');

// @desc    Get all members
// @route   GET /api/members
// @access  Public
const getMembers = asyncHandler(async (req, res) => {
  const { status, paymentType, search } = req.query;
  
  let query = {};
  
  // Filter by payment status
  if (status) {
    query.paymentStatus = status;
  }
  
  // Filter by payment type
  if (paymentType) {
    query.paymentType = paymentType;
  }
  
  // Search by name
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  const members = await Member.find(query).sort({ name: 1 });
  
  res.json({
    success: true,
    count: members.length,
    data: members
  });
});

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Public
const getMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  
  res.json({
    success: true,
    data: member
  });
});

// @desc    Create new member
// @route   POST /api/members
// @access  Public
const createMember = asyncHandler(async (req, res) => {
  const {
    name,
    paymentType,
    paymentStatus,
    lastPaymentDate,
    nextDueDate,
    notes,
    isOwner,
    monthlyAmount,
    yearlyAmount
  } = req.body;
  
  // Validate required fields
  if (!name || !paymentType || !lastPaymentDate || !nextDueDate) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  // Check if member with same name already exists
  const existingMember = await Member.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingMember) {
    res.status(400);
    throw new Error('Member with this name already exists');
  }
  
  const member = await Member.create({
    name,
    paymentType,
    paymentStatus: paymentStatus || 'Unpaid',
    lastPaymentDate,
    nextDueDate,
    notes: notes || '',
    isOwner: isOwner || false,
    monthlyAmount: monthlyAmount || 3.79,
    yearlyAmount: yearlyAmount || 45.48
  });
  
  res.status(201).json({
    success: true,
    data: member
  });
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Public
const updateMember = asyncHandler(async (req, res) => {
  const {
    name,
    paymentType,
    paymentStatus,
    lastPaymentDate,
    nextDueDate,
    notes,
    isOwner,
    monthlyAmount,
    yearlyAmount
  } = req.body;
  
  let member = await Member.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  
  // Check if name is being changed and if it conflicts with existing member
  if (name && name !== member.name) {
    const existingMember = await Member.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingMember) {
      res.status(400);
      throw new Error('Member with this name already exists');
    }
  }
  
  member = await Member.findByIdAndUpdate(
    req.params.id,
    {
      name,
      paymentType,
      paymentStatus,
      lastPaymentDate,
      nextDueDate,
      notes,
      isOwner,
      monthlyAmount,
      yearlyAmount
    },
    {
      new: true,
      runValidators: true
    }
  );
  
  res.json({
    success: true,
    data: member
  });
});

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Public
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  
  await member.deleteOne();
  
  res.json({
    success: true,
    message: 'Member deleted successfully'
  });
});

// @desc    Get overdue members
// @route   GET /api/members/overdue
// @access  Public
const getOverdueMembers = asyncHandler(async (req, res) => {
  const members = await Member.getOverdueMembers();
  
  res.json({
    success: true,
    count: members.length,
    data: members
  });
});

// @desc    Get upcoming payments
// @route   GET /api/members/upcoming
// @access  Public
const getUpcomingPayments = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const members = await Member.getUpcomingPayments(parseInt(days));
  
  res.json({
    success: true,
    count: members.length,
    data: members
  });
});

// @desc    Mark member as paid
// @route   PATCH /api/members/:id/mark-paid
// @access  Public
const markMemberAsPaid = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  
  // Calculate next due date based on payment type
  const lastPaymentDate = new Date();
  let nextDueDate;
  
  if (member.paymentType === 'Monthly') {
    nextDueDate = new Date(lastPaymentDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  } else {
    nextDueDate = new Date(lastPaymentDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
  }
  
  member.paymentStatus = 'Paid';
  member.lastPaymentDate = lastPaymentDate;
  member.nextDueDate = nextDueDate;
  
  await member.save();
  
  res.json({
    success: true,
    data: member
  });
});

// @desc    Get member statistics
// @route   GET /api/members/stats
// @access  Public
const getMemberStats = asyncHandler(async (req, res) => {
  const totalMembers = await Member.countDocuments();
  const paidMembers = await Member.countDocuments({ paymentStatus: 'Paid' });
  const unpaidMembers = await Member.countDocuments({ paymentStatus: 'Unpaid' });
  const overdueMembers = await Member.getOverdueMembers();
  const upcomingPayments = await Member.getUpcomingPayments(30);
  
  const monthlyMembers = await Member.countDocuments({ paymentType: 'Monthly' });
  const yearlyMembers = await Member.countDocuments({ paymentType: 'Yearly' });
  
  res.json({
    success: true,
    data: {
      total: totalMembers,
      paid: paidMembers,
      unpaid: unpaidMembers,
      overdue: overdueMembers.length,
      upcoming: upcomingPayments.length,
      monthly: monthlyMembers,
      yearly: yearlyMembers
    }
  });
});

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getOverdueMembers,
  getUpcomingPayments,
  markMemberAsPaid,
  getMemberStats
}; 