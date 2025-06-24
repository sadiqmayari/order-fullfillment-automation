// routes/webhook.js
import express from 'express';
const router = express.Router();

// Shopify Webhook - Order Paid
router.post('/shopify/order-paid', express.json(), async (req, res) => {
  const data = req.body;
  console.log('🛒 Order paid webhook received:', data);
  // You can add logic here to auto-fulfill or tag the order
  res.sendStatus(200);
});

// Leopards Status Update Webhook
router.post('/leopards/status', express.json(), async (req, res) => {
  const packets = req.body?.data || [];
  console.log('📦 Leopards status update:', packets);
  // Loop through status updates and apply tags to orders
  res.status(202).json([{ status: 1, errors: [] }]);
});

export default router;
