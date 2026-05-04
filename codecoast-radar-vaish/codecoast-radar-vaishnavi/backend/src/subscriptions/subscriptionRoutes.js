import express from 'express';
import Stripe from 'stripe';
import User from '../core/users/User.js';
import { protect } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// All routes protected
router.use(protect);

// @route   GET /api/subscriptions/status
// @desc    Get subscription status
// @access  Private
router.get('/status', async (req, res, next) => {
  try {
    const user = req.user;
    
    const isActive = user.subscription.tier === 'pro' 
      && user.subscription.endDate 
      && new Date(user.subscription.endDate) > new Date();

    res.json({
      success: true,
      subscription: {
        tier: user.subscription.tier,
        isActive,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        daysRemaining: isActive 
          ? Math.ceil((new Date(user.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/subscriptions/create-checkout
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout', async (req, res, next) => {
  try {
    const user = req.user;

    // Create or get Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_1234', // Set your Stripe price ID
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/subscriptions/webhook
// @desc    Handle Stripe webhooks
// @access  Public (Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        // Activate Pro subscription
        const user = await User.findById(userId);
        if (user) {
          user.subscription.tier = 'pro';
          user.subscription.startDate = new Date();
          user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          user.subscription.stripeSubscriptionId = session.subscription;
          await user.save();
          
          console.log(`✅ Pro subscription activated for user ${user.email}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
        
        if (user) {
          user.subscription.tier = 'free';
          user.subscription.endDate = null;
          await user.save();
          
          console.log(`❌ Subscription cancelled for user ${user.email}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
        
        if (user && user.subscription.tier === 'pro') {
          // Extend subscription by 30 days
          user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await user.save();
          
          console.log(`💳 Payment succeeded for user ${user.email}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.subscription.stripeSubscriptionId) {
      throw new AppError('No active subscription found', 404);
    }

    // Cancel at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/subscriptions/plans
// @desc    Get available plans
// @access  Public
router.get('/plans', async (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        name: 'Free',
        price: 0,
        features: [
          '50 alerts per week',
          '80% minimum match score',
          'Basic job filters',
          'Email summaries'
        ]
      },
      {
        name: 'Pro',
        price: 199,
        currency: 'INR',
        interval: 'month',
        features: [
          'Unlimited alerts',
          '90%+ match accuracy',
          'Phone push notifications',
          'Priority support',
          'Advanced analytics',
          'Excel/CSV exports'
        ]
      }
    ]
  });
});

export default router;
