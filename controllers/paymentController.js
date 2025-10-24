import Transaction from '../models/Deposit.js';
import User from '../models/User.js';

// POST /api/payments/initiate
export const initiateDeposit = async (req, res) => {
  try {
    const { amount, method } = req.body;

    const transaction = await Transaction.create({
      userId: req.user.id,
      amount,
      method,
      type: 'deposit',
      status: 'pending'
    });

    // TODO: Integrate with Flutterwave, Paystack, or USDT here
    res.status(201).json({
      message: 'Deposit initiated',
      transactionId: transaction._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/payments/verify
export const verifyDeposit = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    if (transaction.status === 'completed') {
      return res.status(400).json({ error: 'Already verified' });
    }

    if (status === 'completed') {
      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findById(transaction.userId);
      user.walletBalance += transaction.amount;
      await user.save();
    } else {
      transaction.status = 'failed';
      await transaction.save();
    }

    res.json({ message: 'Transaction updated', transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/payments/history/:userId
export const getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Get user's transaction history
 * @route GET /api/transactions
 * @access Private
 */
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate("campaignId", "platform goal status")
      .sort({ createdAt: -1 });

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};