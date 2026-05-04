# Frontend Setup Guide

## Prerequisites

- Node.js 18+ installed
- Backend API running (see backend/README.md)

## Installation Steps

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

App will start on `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

Output will be in `dist/` directory

## Project Structure

```
client/
├── src/
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles + Tailwind
│   │
│   ├── components/
│   │   └── Layout.jsx       # Main layout with sidebar
│   │
│   ├── pages/
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx    # Main dashboard with stats
│   │   ├── Jobs.jsx         # Job listings with filters
│   │   ├── Analytics.jsx    # Trends & spikes visualizations
│   │   ├── Tracker.jsx      # Application tracker
│   │   ├── Subscription.jsx # Subscription management
│   │   └── Profile.jsx      # User profile settings
│   │
│   ├── store/
│   │   ├── authStore.js     # Authentication state
│   │   └── socketStore.js   # Socket.io connection & notifications
│   │
│   └── utils/
│       └── api.js           # Axios API client
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Features

### Authentication
- JWT-based auth with localStorage
- Protected routes
- Auto-redirect on auth errors

### Real-time Updates
- Socket.io connection for instant job alerts
- Live notification badges
- Toast notifications for new jobs

### Dashboard
- Job statistics overview
- Hiring spikes detection
- Trending skills charts
- Application analytics

### Job Search
- Real-time filters (skills, company, salary)
- Match score for personalized results
- Bulk select & export (Excel/CSV)
- One-click apply tracking

### Analytics
- Recharts visualizations
- Salary heatmaps
- Company hiring trends
- Growth rate predictions

### Application Tracker
- Status pipeline (Applied → Interview → Offer)
- Follow-up reminders (7+ days)
- Bulk status updates
- Response rate analytics

### Subscription
- Free vs Pro tier comparison
- Stripe checkout integration
- Usage tracking

### Profile
- Skills management
- Job preferences
- Account statistics

## Components

### Layout Component
- Persistent sidebar navigation
- User profile section
- Notification bell
- Logout functionality

### Protected Routes
- Automatic redirect to /login if not authenticated
- Token validation on each request

## State Management

### Auth Store (Zustand)
```javascript
const { user, token, login, logout, updateUser } = useAuthStore()
```

### Socket Store
```javascript
const { isConnected, notifications, connect, disconnect } = useSocketStore()
```

## API Integration

All API calls are centralized in `utils/api.js`:

```javascript
import { jobsAPI, authAPI, trackerAPI } from './utils/api'

// Example usage
const jobs = await jobsAPI.getJobs({ search: 'React' })
const matched = await jobsAPI.getMatched()
```

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom color palette (primary blue)
- Responsive breakpoints
- Glass-morphism effects

### Custom Classes
```css
.btn - Base button
.btn-primary - Primary button
.btn-secondary - Secondary button
.card - Card container
.glass - Glass-morphism effect
.input - Form input
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

Or connect GitHub repo to Vercel dashboard for auto-deploys.

### Configuration

Create `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.com/api/:path*"
    }
  ]
}
```

### Environment Variables

Set in Vercel dashboard:
- `VITE_API_URL` - Backend API URL (if different from /api)

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Redirects file (_redirects in public/)
/*    /index.html   200
```

## Troubleshooting

### Socket.io Connection Issues
- Check if backend is running
- Verify CORS settings in backend
- Check browser console for connection errors

### API Errors
- Verify backend URL in vite.config.js proxy
- Check network tab for failed requests
- Ensure JWT token is valid

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Development Tips

### Hot Reload
Vite provides instant hot module replacement (HMR)

### Browser DevTools
- React DevTools extension
- Redux DevTools (for debugging state)
- Network tab for API calls

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

## Performance

### Code Splitting
Pages are automatically code-split by React Router

### Asset Optimization
Vite automatically optimizes images and assets

### Caching
API responses can be cached with React Query (optional upgrade)

---

Happy coding! 🚀
