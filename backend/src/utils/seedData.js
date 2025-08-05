const mongoose = require('mongoose');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const CardDetail = require('../models/CardDetail');
const CardTransaction = require('../models/CardTransaction');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Member.deleteMany({});
    await Transaction.deleteMany({});
    await CardDetail.deleteMany({});
    await CardTransaction.deleteMany({});
    console.log('Cleared existing data...');

    // Create sample members
    const members = await Member.create([
      {
        name: 'You (Owner)',
        paymentType: 'Monthly',
        paymentStatus: 'Paid',
        lastPaymentDate: new Date(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        notes: 'Your own contribution',
        isOwner: true,
        monthlyAmount: 3.79,
        yearlyAmount: 45.48
      },
      {
        name: 'Alice',
        paymentType: 'Monthly',
        paymentStatus: 'Unpaid',
        lastPaymentDate: new Date('2025-07-01'),
        nextDueDate: new Date('2025-08-01'),
        notes: 'Friend from college',
        monthlyAmount: 3.79,
        yearlyAmount: 45.48
      },
      {
        name: 'Bob',
        paymentType: 'Yearly',
        paymentStatus: 'Paid',
        lastPaymentDate: new Date('2025-01-15'),
        nextDueDate: new Date('2026-01-15'),
        notes: 'Brother',
        monthlyAmount: 3.79,
        yearlyAmount: 45.48
      },
      {
        name: 'Charlie',
        paymentType: 'Monthly',
        paymentStatus: 'Paid',
        lastPaymentDate: new Date(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        notes: 'Cousin',
        monthlyAmount: 3.79,
        yearlyAmount: 45.48
      },
      {
        name: 'Diana',
        paymentType: 'Monthly',
        paymentStatus: 'Unpaid',
        lastPaymentDate: new Date('2025-07-05'),
        nextDueDate: new Date('2025-08-05'),
        notes: 'Sister',
        monthlyAmount: 3.79,
        yearlyAmount: 45.48
      }
    ]);
    console.log('Created sample members...');

    // Create sample transactions
    const transactions = await Transaction.create([
      {
        date: new Date(),
        amount: 18.99,
        memberId: null,
        description: 'YouTube Premium Monthly Subscription Cost',
        type: 'Outgoing',
        category: 'Subscription',
        paymentMethod: 'Credit Card',
        status: 'Completed'
      },
      {
        date: new Date(),
        amount: 3.79,
        memberId: members[0]._id, // You (Owner)
        description: 'Your contribution',
        type: 'Incoming',
        category: 'Member Payment',
        paymentMethod: 'Bank Transfer',
        status: 'Completed'
      },
      {
        date: new Date('2025-07-20'),
        amount: 3.79,
        memberId: members[3]._id, // Charlie
        description: 'Charlie\'s monthly payment',
        type: 'Incoming',
        category: 'Member Payment',
        paymentMethod: 'E-Wallet',
        status: 'Completed'
      },
      {
        date: new Date('2025-01-15'),
        amount: 45.48,
        memberId: members[2]._id, // Bob
        description: 'Bob\'s yearly payment',
        type: 'Incoming',
        category: 'Member Payment',
        paymentMethod: 'Bank Transfer',
        status: 'Completed'
      }
    ]);
    console.log('Created sample transactions...');

    // Create sample card detail
    const cardDetail = await CardDetail.create({
      cardName: 'YouTube Card',
      lastFourDigits: '1234',
      expiryDate: '12/28',
      cardType: 'Visa',
      bankName: 'Maybank',
      cardHolderName: 'John Doe',
      notes: 'Main card for YouTube Premium',
      monthlyLimit: 1000,
      currentBalance: 50.0
    });
    console.log('Created sample card detail...');

    // Create sample card transactions
    const cardTransactions = await CardTransaction.create([
      {
        cardId: cardDetail._id,
        date: new Date(),
        amount: 50.0,
        description: 'Initial deposit',
        type: 'Deposit',
        category: 'Manual Deposit',
        status: 'Completed',
        balanceAfter: 50.0
      },
      {
        cardId: cardDetail._id,
        date: new Date(),
        amount: 18.99,
        description: 'YouTube Premium deduction',
        type: 'Withdrawal',
        category: 'YouTube Premium',
        status: 'Completed',
        balanceAfter: 31.01
      }
    ]);
    console.log('Created sample card transactions...');

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${members.length} members`);
    console.log(`💰 Created ${transactions.length} transactions`);
    console.log(`💳 Created 1 card detail`);
    console.log(`🏦 Created ${cardTransactions.length} card transactions`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 