import express from 'express';
import { runJobScraper } from './jobScraper.js';

const router = express.Router();

// @route   POST /api/scraper/run
// @desc    Manually trigger job scraper
// @access  Public (in production, should be protected)
router.post('/run', async (req, res, next) => {
  try {
    // Get io instance from app
    const io = req.app.get('io');
    
    // Emit scraper start event
    if (io) {
      io.emit('scraper:status', {
        status: 'started',
        message: 'Starting job scraper...',
        timestamp: new Date()
      });
    }
    
    // Run scraper in background
    runJobScraper(io).then(count => {
      if (io) {
        io.emit('scraper:status', {
          status: 'completed',
          message: `Scraping completed. Found ${count} jobs.`,
          count,
          timestamp: new Date()
        });
      }
    }).catch(error => {
      console.error('Scraper error:', error);
      if (io) {
        io.emit('scraper:status', {
          status: 'error',
          message: 'Scraping failed',
          error: error.message,
          timestamp: new Date()
        });
      }
    });
    
    res.json({
      success: true,
      message: 'Job scraper started. Listen to Socket.io events for updates.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
