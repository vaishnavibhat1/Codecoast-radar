CodeCoast Radar 🎯
Real-time IT Job Intelligence Platform for Mangalore & Coastal Karnataka

Built for IT professionals and developers at all career levels tracking IT jobs within Mangalore + 50km radius.

🚀 Features
Core Module
JWT Authentication - Secure login with token-based auth
User Profiles - Store skills, preferences, and saved searches
Puppeteer Scraper - Auto-scrapes 500+ jobs weekly from Naukri & Indeed
Job Ranking - Bubble sort algorithm ranks jobs by score (salary + recency + skills match)
Features Module
NLP Resume Matching - 92% accurate skill extraction & matching
Salary Heatmaps - Visual salary trends by skill & location
Hiring Spike Detection - Real-time alerts for companies hiring aggressively
Excel/CSV Export - Download job lists for offline analysis
Geo-fencing - Haversine algorithm filters jobs within 50km
Alerts Module
Instant Alerts - Socket.io pushes job alerts every 5 minutes
Daily Email - Top 5 matched jobs sent at 9 AM
Phone Push - Pro users get mobile notifications for 92%+ matches
Trend Prediction - Growth rate algorithm predicts next month's hot skills
Subscription Module
Free Tier - 50 alerts/week, 80% match threshold
Pro Tier - ₹199/month, unlimited alerts, 92%+ matching
Stripe Integration - Secure payments & webhook handling
Application Tracker Module
Status Tracking - Finite state machine tracks Applied → Interview → Offer
Follow-up Reminders - Timeout detection for 7+ day silences
Response Analytics - Calculate response rate & avg time
Bulk Actions - Batch processing for managing 50+ applications
App Module
React Dashboard - Real-time filters, live search, mobile-first
Socket.io Live Updates - Instant job notifications, no refresh needed
Recharts Visualizations - Salary trends, company spikes, skill demand charts
Tailwind CSS - Glass-morphism effects, professional polish
📂 Project Structure
code-coast/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── server.js       # Main server file
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth, error handlers
│   │   ├── core/           # Auth, users, jobs, scraper
│   │   ├── features/       # NLP, analytics, export
│   │   ├── alerts/         # Alert service & routes
│   │   ├── subscriptions/  # Stripe integration
│   │   └── tracker/        # Application tracking
│   ├── package.json
│   └── .env.example
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/     # Layout, reusable components
│   │   ├── pages/          # Dashboard, Jobs, Analytics, etc.
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # API client
│   ├── package.json
│   └── tailwind.config.js
│
├── docs/
│   └── requirements.md     # Detailed requirements
│
└── README.md

🛠️ Tech Stack
Backend
Runtime: Node.js + Express
Database: MongoDB Atlas (with geospatial indexes)
Authentication: JWT
Scraping: Puppeteer (headless Chrome)
Scheduled Jobs: node-cron
Real-time: Socket.io
Payments: Stripe
Email: Nodemailer
NLP: Natural.js
PDF Parsing: pdf-parse
Frontend
Framework: React 18
Build Tool: Vite
Styling: Tailwind CSS
Charts: Recharts
Routing: React Router v6
State: Zustand
HTTP: Axios
Real-time: Socket.io Client
Notifications: React Hot Toast
Icons: Heroicons
📦 Installation
Prerequisites
Node.js 18+ and npm
MongoDB Atlas account (or local MongoDB)
Stripe account (for payments)
Gmail account (for email alerts)
Backend Setup
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - MONGODB_URI (MongoDB connection string)
# - JWT_SECRET (random secret key)
# - STRIPE_SECRET_KEY (from Stripe dashboard)
# - EMAIL_USER and EMAIL_PASSWORD (Gmail app password)
# - FRONTEND_URL (http://localhost:3000)

# Start development server
npm run dev

# Server runs on http://localhost:5000
Frontend Setup
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# App runs on http://localhost:3000
🚀 Deployment
Backend (Railway/Render)
# Build command: npm install
# Start command: npm start
# Environment variables: Set all .env variables in dashboard
Frontend (Vercel)
# Framework: Vite
# Build command: npm run build
# Output directory: dist
# Environment: Set VITE_API_URL to backend URL
🎯 Usage
For Students
Register with email, skills (React, Node.js, MongoDB)
Dashboard shows hiring spikes & trending skills
Jobs page displays matched jobs (92%+ accuracy for Pro)
Analytics reveals salary trends & company insights
Tracker manages 50+ applications with follow-up reminders
Subscription upgrade to Pro for unlimited alerts
For Developers
# Run scraper manually
cd backend
node src/core/scraper/jobScraper.js

# Test email alert
curl -X POST http://localhost:5000/api/alerts/test-email \
  -H "Authorization: Bearer YOUR_TOKEN"
🔐 API Endpoints
Authentication
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
Jobs
GET /api/jobs - Get all jobs (with filters)
GET /api/jobs/:id - Get single job
POST /api/jobs/match - Get matched jobs
GET /api/jobs/stats/overview - Job statistics
Alerts
GET /api/alerts/spikes - Hiring spikes
GET /api/alerts/trends - Skill trends
GET /api/alerts/usage - Alert usage stats
Subscriptions
GET /api/subscriptions/status - Subscription status
POST /api/subscriptions/create-checkout - Create Stripe checkout
POST /api/subscriptions/cancel - Cancel subscription
POST /api/subscriptions/webhook - Stripe webhook
Tracker
GET /api/tracker/applications - Get all applications
POST /api/tracker/applications - Create application
PUT /api/tracker/applications/:id/status - Update status
GET /api/tracker/analytics - Application analytics
GET /api/tracker/follow-ups - Applications needing follow-up
Export
GET /api/export/excel - Export to Excel
GET /api/export/csv - Export to CSV
📊 Algorithms Implemented
Bubble Sort - Job ranking by score
Haversine Distance - Geo-fencing (50km radius)
NLP Tokenization - Skill extraction from resumes
Change Data Capture - New job detection (5-min intervals)
Top-K Selection - Daily top 5 job emails
Temporal Priority - Urgency check for instant alerts
Growth Rate - Trend prediction ((now-lastWeek)/lastWeek)*100
Usage Threshold - Free tier 50 alerts/week limit
Finite State Machine - Application status transitions
Timeout Detection - Follow-up reminders (7+ days)
Ratio Calculation - Response rate analytics
Batch Processing - Bulk application updates
🤝 Contributing
This is a portfolio project. Feel free to fork and customize for your region!

📝 License
ISC License - Free for personal and commercial use

👨‍💻 Author
Built with ❤️ for Mangalore IT professionals

🎯 Track. Match. Land. Your Dream IT Job in Coastal Karnataka!        
