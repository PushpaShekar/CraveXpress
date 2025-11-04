import { Response } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        amount: paymentIntent.amount / 100,
        paymentId: paymentIntent.id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Webhook for Stripe events
// @route   POST /api/payment/webhook
// @access  Public (Stripe)
export const stripeWebhook = async (req: any, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!', paymentIntent.id);
        // Update order status in database
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed');
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    // Note: You'll need to install razorpay package and configure it
    // This is a placeholder implementation
    res.json({
      orderId: `order_${Date.now()}`,
      amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature using Razorpay SDK
    // This is a placeholder implementation
    res.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

