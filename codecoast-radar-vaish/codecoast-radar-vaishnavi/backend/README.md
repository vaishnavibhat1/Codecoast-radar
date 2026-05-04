# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Stripe account for payments
- Gmail account for sending emails

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecoast?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_monthly_price_id

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Frontend
FRONTEND_URL=http://localhost:3000

# Geo-fencing (Mangalore coordinates)
BASE_LOCATION_LAT=12.9141
BASE_LOCATION_LNG=74.8560
GEO_RADIUS_KM=50
```

### 3. Get API Keys

#### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your IP (or use 0.0.0.0/0 for dev)
5. Get connection string

#### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from Developers → API keys
3. Create a product and get price ID
4. For webhooks: Developers → Webhooks → Add endpoint
   - URL: `https://your-backend-url.com/api/subscriptions/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`

#### Gmail App Password
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use this password in .env

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 5. Test API

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "skills": ["React", "Node.js", "MongoDB"]
  }'
```

## Features

### Job Scraper
- Runs automatically every 6 hours
- Scrapes Naukri and Indeed
- Filters jobs within 50km of Mangalore
- Stores in MongoDB with geospatial indexing

### Alert System
- Checks for new jobs every 5 minutes
- Sends instant Socket.io alerts
- Daily email summaries at 9 AM
- Weekly trend predictions on Mondays at 8 AM

### API Documentation

All endpoints documented in main README.md

## Production Deployment

### Railway

1. Create new project on [Railway](https://railway.app)
2. Connect GitHub repo
3. Add MongoDB plugin (or use Atlas)
4. Set environment variables
5. Deploy!

### Render

1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables
6. Deploy!

## Troubleshooting

### MongoDB Connection Error
- Check if IP is whitelisted
- Verify connection string format
- Ensure database user has correct permissions

### Puppeteer Issues on Linux
```bash
# Install Chrome dependencies
sudo apt-get install -y \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

### Email Not Sending
- Verify Gmail app password (not regular password)
- Check if 2FA is enabled
- Try with different email provider

## Monitoring

```bash
# View logs
npm start

# Manual scraper run
node src/core/scraper/jobScraper.js

# Test email
curl -X POST http://localhost:5000/api/alerts/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
