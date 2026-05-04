import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './core/auth/authRoutes.js';
import userRoutes from './core/users/userRoutes.js';
import jobRoutes from './core/jobs/jobRoutes.js';
import alertRoutes from './alerts/alertRoutes.js';
import subscriptionRoutes from './subscriptions/subscriptionRoutes.js';
import trackerRoutes from './tracker/trackerRoutes.js';
import exportRoutes from './features/export/exportRoutes.js';
import scraperRoutes from './core/scraper/scraperRoutes.js';
import { startJobScraper } from './core/scraper/jobScraper.js';
import { initializeAlertSystem } from './alerts/alertService.js';
import { seedTestData } from './utils/seedTestData.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/scraper', scraperRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  
  // Seed test data on startup (development only)
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    try {
      await seedTestData();
    } catch (error) {
      console.error('⚠️  Failed to seed test data:', error.message);
    }
  }
  
  // Start job scraper (runs on schedule)
  if (process.env.NODE_ENV !== 'test') {
    startJobScraper(io);
    initializeAlertSystem(io);
  }
});

export { io };
