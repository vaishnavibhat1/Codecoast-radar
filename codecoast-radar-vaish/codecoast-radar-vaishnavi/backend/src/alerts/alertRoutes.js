import express from 'express';
import { protect } from '../middleware/auth.js';
import { detectHiringSpikes, predictHiringTrends } from '../features/analytics/hiringAnalytics.js';
import { sendDailyEmailSummary } from './alertService.js';

const router = express.Router();

// All routes protected
router.use(protect);

// @route   GET /api/alerts/spikes
// @desc    Get hiring spikes
// @access  Private
router.get('/spikes', async (req, res, next) => {
  try {
    const spikes = await detectHiringSpikes();
    res.json({ success: true, spikes });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/alerts/trends
// @desc    Get hiring trends
// @access  Private
router.get('/trends', async (req, res, next) => {
  try {
    const trends = await predictHiringTrends();
    res.json({ success: true, trends });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/alerts/test-email
// @desc    Test daily email (dev only)
// @access  Private
router.post('/test-email', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ success: false, error: 'Only available in development' });
    }
    
    await sendDailyEmailSummary();
    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/alerts/usage
// @desc    Get alert usage stats
// @access  Private
router.get('/usage', async (req, res, next) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      usage: {
        tier: user.subscription.tier,
        alertsUsed: user.subscription.alertsUsed.count,
        limit: user.subscription.tier === 'pro' ? 'unlimited' : 50,
        lastReset: user.subscription.alertsUsed.lastReset
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
