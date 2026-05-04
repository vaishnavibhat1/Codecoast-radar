# CodeCoast Radar - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```

### Step 1: Clone & Install

```bash
# Navigate to project
cd code-coast

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Setup MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster
3. Create database user (username + password)
4. Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)
5. Connect → Connect your application → Copy connection string

**Option B: Local MongoDB**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Connection string: mongodb://localhost:27017/codecoast
```

### Step 3: Setup Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with minimal config:

```env
PORT=5000
NODE_ENV=development

# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecoast

# JWT (REQUIRED - use any random string)
JWT_SECRET=my_super_secret_key_minimum_32_characters_long_for_production

# Frontend
FRONTEND_URL=http://localhost:3000

# Optional for now (can add later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

STRIPE_SECRET_KEY=sk_test_xxxxx
```

### Step 4: Start Backend

```bash
cd backend
npm run dev

# You should see:
# ✅ MongoDB Connected
# 🚀 Server running on port 5000
# ⏰ Job scraper scheduled
```

### Step 5: Start Frontend

```bash
# Open new terminal
cd client
npm run dev

# You should see:
# VITE ready in XXX ms
# ➜ Local: http://localhost:3000
```

### Step 6: Create Account

1. Open http://localhost:3000
2. Click "Sign up"
3. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
   - Skills: React, Node.js, MongoDB, JavaScript
   - Qualification: B.Tech/MCA/BCA

4. Click "Create Account"
5. You'll be redirected to Dashboard!

## 🎯 First Steps

### 1. Explore Dashboard
- View job statistics
- See trending skills
- Check application analytics

### 2. Browse Jobs
- Click "Jobs" in sidebar
- Try filters (search, skills, company)
- Click "Show Matched Jobs" for personalized results
- Export to Excel/CSV

### 3. View Analytics
- Click "Analytics" in sidebar
- See hiring spikes
- View skill trends

### 4. Track Applications
- Click "Tracker" in sidebar
- Add a job application (manual or from job listing)
- Update status as you progress

### 5. Upgrade to Pro (Optional)
- Click "Subscription" in sidebar
- View Free vs Pro comparison
- Upgrade for unlimited alerts & 92% matching

## 🔧 Common Issues

### Backend won't start

**Issue:** MongoDB connection error
```bash
# Check MongoDB URI format:
mongodb+srv://username:password@cluster.mongodb.net/codecoast

# Common mistakes:
- Missing password
- Special characters not URL-encoded
- Wrong database name
- IP not whitelisted
```

**Issue:** Port 5000 already in use
```bash
# Change PORT in backend/.env
PORT=5001

# Update frontend proxy in client/vite.config.js
proxy: {
  '/api': 'http://localhost:5001'
}
```

### Frontend won't connect to backend

**Issue:** API calls failing
```bash
# Check backend is running on port 5000
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}

# Check CORS in backend/src/server.js
# Make sure FRONTEND_URL=http://localhost:3000
```

### No jobs showing up

**Issue:** Database empty
```bash
# Run scraper manually (takes 2-3 minutes)
cd backend
node src/core/scraper/jobScraper.js

# Check scraper output:
# 🔍 Starting Naukri scraper...
# 📊 Scraped X jobs from Naukri
# ✅ Saved Y new jobs
```

## 📱 Features to Try

### Real-time Alerts
1. Keep both backend & frontend running
2. Open browser console (F12)
3. Run scraper: `node src/core/scraper/jobScraper.js`
4. Watch for toast notifications!

### Job Matching
1. Update your skills in Profile
2. Go to Jobs → Click "Show Matched Jobs"
3. See match scores (75%+)

### Export Jobs
1. Browse jobs
2. Select multiple jobs (checkboxes)
3. Click "Excel" or "CSV" button
4. Open file in Excel/Google Sheets

### Application Tracking
1. Add application (from jobs or manual)
2. Update status: Applied → Interview → Offer
3. View analytics (response rate, avg time)
4. Set follow-up reminders

## 🚀 Production Deployment

### Backend (Railway)
```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push

# 2. Go to railway.app
# 3. New Project → Deploy from GitHub
# 4. Add MongoDB plugin (or use Atlas)
# 5. Set environment variables (copy from .env)
# 6. Deploy!
```

### Frontend (Vercel)
```bash
# 1. Go to vercel.com
# 2. Import Git Repository
# 3. Framework: Vite
# 4. Root directory: client
# 5. Build command: npm run build
# 6. Output directory: dist
# 7. Deploy!
```

## 📚 Next Steps

1. **Add Email Alerts**
   - Get Gmail app password
   - Add to backend/.env
   - Test: `POST /api/alerts/test-email`

2. **Setup Stripe**
   - Create Stripe account
   - Get API keys
   - Create product (₹199/month)
   - Add webhook endpoint

3. **Customize Scraper**
   - Edit `backend/src/core/scraper/jobScraper.js`
   - Add more job sites
   - Adjust location filters

4. **Enhance Matching**
   - Improve NLP algorithm in `backend/src/features/matching/nlpMatcher.js`
   - Add more skills keywords
   - Adjust match scoring

## 🆘 Need Help?

- Backend API Docs: See main README.md
- Frontend Components: See client/README.md
- Full Requirements: See docs/requirements.md

## 🎉 You're All Set!

Your CodeCoast Radar is now running. Start tracking Mangalore IT jobs!

**What's happening behind the scenes:**
- ✅ Backend API running on :5000
- ✅ React app running on :3000  
- ✅ MongoDB storing jobs & users
- ✅ Job scraper scheduled every 6 hours
- ✅ Alert system checking every 5 minutes
- ✅ Socket.io pushing real-time updates

**Happy job hunting! 🎯**
