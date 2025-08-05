const express = require('express');
const {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getOverdueMembers,
  getUpcomingPayments,
  markMemberAsPaid,
  getMemberStats
} = require('../controllers/memberController');

const router = express.Router();

// GET /api/members - Get all members
router.get('/', getMembers);

// GET /api/members/stats - Get member statistics
router.get('/stats', getMemberStats);

// GET /api/members/overdue - Get overdue members
router.get('/overdue', getOverdueMembers);

// GET /api/members/upcoming - Get upcoming payments
router.get('/upcoming', getUpcomingPayments);

// POST /api/members - Create new member
router.post('/', createMember);

// GET /api/members/:id - Get single member
router.get('/:id', getMember);

// PUT /api/members/:id - Update member
router.put('/:id', updateMember);

// PATCH /api/members/:id/mark-paid - Mark member as paid
router.patch('/:id/mark-paid', markMemberAsPaid);

// DELETE /api/members/:id - Delete member
router.delete('/:id', deleteMember);

module.exports = router; 