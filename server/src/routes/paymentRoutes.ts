import express from 'express';
import {
  createPaymentIntent,
  verifyPayment,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Stripe routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Razorpay routes
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;

