const Razorpay = require('razorpay');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return res.status(500).json({ error: 'Razorpay environment keys are not configured.' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};

    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount must be 100 paise (₹1).',
      });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || { source: 'Simpliven Single Product Store' },
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    });
  } catch (error) {
    console.error('[Vercel API] Create Order Error:', error);
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed. Check API credentials.' });
    }
    return res.status(error.statusCode || 500).json({
      error: error.description || error.message || 'Failed to create Razorpay order',
    });
  }
};
