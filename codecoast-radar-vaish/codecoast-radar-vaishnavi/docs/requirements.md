**CodeCoast Radar**

CodeCoast Radar is a real-time IT job intelligence platform exclusively tracking Mangalore and coastal Karnataka's tech job market, built for IT professionals and developers at all career levels.

**Core Purpose**

Scans Naukri, Indeed, LinkedIn, and local company career pages to deliver:

*   **Live job alerts** for Mangalore IT roles (within 50km radius)
*   **92% accurate fit scoring** between your skills and local postings
*   **Hiring trend analytics** (23% fresher role growth this month)
*   **Excel export** of filtered opportunities

Modules:

*   **Core Module (/core/)**

├── JWT authentication & user profiles

├── MongoDB job storage (500+ weekly postings)

└── Puppeteer scraper for Naukri/Indeed APIs

| Component | What User Sees | Explanation | Algorithm |
| --- | --- | --- | --- |
| JWT Authentication | "Welcome Back" login success | Secure login system. User logs in → gets token → every API call sends token for verification. Stores user ID, email, preferences in token payload. | Token Validation Algorithm |
| User Profiles | "Your Skills: React, Node.js" profile dashboard | MongoDB stores IT professional details, saved searches, skillsets. JWT token contains userId to fetch profile. | Data Retrieval Algorithm |
| Puppeteer Scraper | "Scraped 127 new jobs" status update | Headless Chrome browser scrapes Naukri/Indeed. Gets 500+ IT jobs weekly (Wipro, Infosys, TCS). Stores: title, company, salary, skills, date posted. | Web Scraping Pipeline Algorithm |
| Job Ranking | "Wipro #1, TCS #2" sorted job list | Sorts 500+ scraped jobs by score (salary + recency + location). job.score = 0.4*salary + 0.3*recency + 0.2*skillsMatch + 0.1*companyRating | Bubble Sort Algorithm |

*   **Features Module (/features/)**

├── NLP resume-job matching (JS, MERN, Python, Java keywords)

├── Salary trend heatmaps & company analysis

├── Hiring spike detection (Wipro posted 8 IT roles yesterday)

├── Excel/CSV export engine

└── Geo-fencing (Mangalore + 50km)

**Purpose**:  Smart NLP-powered matching + analytics for IT professionals

| Component | What User Sees | What It Does | NLP Algorithm |
| --- | --- | --- | --- |
| NLP Resume-Job Matching | "CMS = 92% Wipro match" | Reads PDF resume → extracts "React, Node.js, Python" → matches jobs needing those skills. 89% accuracy. | NLP Tokenization + Skill Extraction"Fullstack with React exp" → ["React", "Fullstack"] |
| Salary Trend Heatmaps | "React: ₹8-12L Bangalore" charts | NLP parses 500+ job descriptions → color-coded salary charts by city demand. | NLP Keyword ExtractionExtracts salary ranges + locations from JDs |
| Hiring Spike Detection | "Wipro: 8 IT roles yesterday!" | NLP detects company + role spikes vs 7-day average. | NLP Entity Recognition"Wipro hiring Developers" → {company: "Wipro", role: "Developer"} |
| Excel/CSV Export | Download 127 matched jobs | Exports NLP-matched jobs with fit scores for spreadsheet analysis. | NLP + Weighted ScoringReact=3x + MERN=4x = 89% fit score |
| Geo-fencing | "Mangalore + 50km jobs only" | Filters out Delhi/Mumbai jobs → shows only local IT jobs within 50km radius. | Haversine Distance Algorithmdistance(Mangalore, job.location) < 50km |

App Module (/app/)

├── React dashboard with real-time filters

├── Socket.io live job updates

├── Recharts visualizations (D3.js level polish)

└── Tailwind CSS responsive design

**Purpose**: Beautiful React dashboard students love using

| Component | Explanation | Algorithm |
| --- | --- | --- |
| React Dashboard | Single-page app. Filter by: salary, company, skills, location. Real-time search. | None - Pure UI |
| Socket.io Live Updates | New Wipro job posted → instant notification. No page refresh needed. |  |
| Recharts Visualizations | Graphs: salary trends, company hiring spikes, skill demand charts. D3.js quality. |  |
| Tailwind CSS | Mobile-first design. Works on phone/laptop. Glass-morphism effects. | None - UI only |

*   **Alerts Module**

├── Instant Alert

├── Daily Email

├── Phone Push

└── Trend Prediction

| Component | What User Sees | What It Does | Best & Simple Algorithm |
| --- | --- | --- | --- |
| Instant Alert | "🚨 Wipro MERN - 94% - 2min ago" (Browser popup) | Checks every 5 mins for new jobs matching skills | NEW JOB CHECK(Change Data Capture (CDC))if(job.postedTime > lastCheck && subscription.canSend()) |
| Daily Email | "Good morning! 5 new React jobs yesterday" (9AM email) | Sends top 5 best matches from last 24hrs | TOP 5 PICKER(Top-K Selection Algorithm)sort(matchScore).slice(0,5) |
| Phone Push | Phone notification: "TCS Developer role just posted!" | Pro only - instant popup when perfect job appears | URGENCY CHECK(Temporal Priority Algorithm)if(score>92 && subscription.isPro() && age<5min) |
| Trend Prediction | "📈 Data analyst roles up 25% next month""React jobs +18% this week" | Compares this week vs last week job postings | TREND CALC(Growth Rate Algorithm)((now-lastWeek)/lastWeek)*100 |

*   **Subscription Module**

├── Free Tier

├── Pro Tier (₹199/month)

└── Upgrade Flow

| Component | What User Sees | What It Does | Best & Simple Algorithm |
| --- | --- | --- | --- |
| Free Tier | "Alerts: 47/50 used this week" | Limits: 50 alerts/week, 80% match minimum | COUNT CHECK(Usage Threshold Algorithm)if(usage < 50) ALLOW else UPGRADE |
| Pro Tier | "✅ PRO: Unlimited alerts + 92% matching" | Unlocks: Unlimited alerts, phone push, 92% accuracy | TIER CHECK(Access Control Algorithm)if(isPro) UNLOCK_FEATURES() |
| Upgrade Flow | "Upgrade Pro?" → Stripe → "✅ Pro activated!" | ₹199 → instant Pro access for 30 days | PAYMENT CHECK(Transaction Authorization Algorithm)if(stripe.success) setPro(true) |

*   **Application Tracker Module**

├── Status Tracker

├── Follow-up Reminders

├── Response Analytics

└── Bulk Actions

| Component | What User Sees | What It Does | Best & Simple Algorithm (Technical Name) |
| --- | --- | --- | --- |
| Status Tracker | "Wipro: Interview Round 2 ⏳"[Applied → Shortlist → Interview → Offer] | Tracks 50+ applications through hiring pipeline | Finite State Machine Algorithmstatus: 'applied' → 'shortlist' → 'interview' |
| Follow-up Reminders | "Follow up TCS (7d no reply) 📧" | Auto-notifies after 7/14 days silence | Timeout Detection Algorithmif(daysSinceApplied > 7 && noReply) REMIND |
| Response Analytics | "47% response rate (23/50 apps)""Avg reply: 5.2 days" | Shows personal hiring success stats | Ratio Calculation Algorithmresponses/applied * 100 = 47% |
| Bulk Actions | "Withdraw 5 old apps ✓""Reapply to 3 jobs" | Manages 50+ applications in bulk | Batch Processing AlgorithmselectedApps.forEach(updateStatus) |

**Overview**

**1\. Core Module (/core/)**

| Feature | What It Does (Simple English) |
| --- | --- |
| JWT Authentication | Secure login: Student enters email/password → gets secure token → every job search uses this token to prove "I'm a real user". Token remembers your skills, city, preferences. |
| User Profiles | Your info storage: Saves your resume, skills (React, Python, Java), saved searches ("Mangalore React jobs"), application history in MongoDB. Fast lookup using JWT token. |
| Puppeteer Scraper | Auto job collector: Headless Chrome browser visits Naukri/Indeed every hour → grabs 500+ IT jobs (Wipro, TCS) → extracts title, salary, skills, location → stores in database. |
| Job Ranking | Smart sorting: Takes 500 raw jobs → calculates score (40% salary + 30% recency + 20% skill match + 10% company rating) → sorts: Wipro #1 → TCS #2 → others using Bubble Sort. |

**2\. Features Module**

| Feature | What It Does (Simple English) |
| --- | --- |
| NLP Resume Matching | Resume scanner: Reads your PDF resume → finds "React, Node.js, Python" → compares with job description → scores "92% Wipro match" using NLP tokenization + weighted scoring. |
| Salary Trend Heatmaps | Salary insights: Analyzes 500+ jobs → creates charts: "React Developer: ₹8-12L Bangalore (red=hot)" → shows best paying cities/companies for your skills. |
| Hiring Spike Detection | Hot company alerts: Counts "Wipro MCA jobs: 8 today vs 2 avg" → " Wipro spike detected!" → tells you exactly which companies are hiring aggressively NOW. |
| Excel/CSV Export | Download results: Click button → 127 matched jobs → Excel file with fit scores, salaries, links → perfect for Excel analysis or sharing with friends. |
| Geo-fencing | Local jobs only: "Mangalore + 50km" filter → ignores Delhi/Mumbai jobs → uses Haversine formula to show only nearby IT jobs. |

**3\. App Module**

| Feature | What It Does (Simple English) |
| --- | --- |
| React Dashboard | Main screen: Single page with job filters (salary, React, Bangalore), live search, charts → type "React" → instant results, mobile-friendly. |
| Socket.io Live Updates | Real-time magic: New Wipro job posted → popup appears instantly → no page refresh needed → feels alive and urgent. |
| Recharts Visualizations | Fancy charts: Salary trends, company spikes, skill demand graphs → "React jobs exploding!" → D3.js quality, recruiter-impressing polish. |
| Tailwind CSS | Beautiful design: Glass effects, mobile-first, works on phone/laptop → professional polish = "This guy can build production UIs". |

**4\. Alerts Module**

| Feature | What It Does (Simple English) |
| --- | --- |
| Instant Alert | 5-min check: Scans new scraped jobs → "🚨 Wipro MERN 94% match - 2min ago!" → browser popup → first to know = first to apply. |
| Daily Email | Morning summary: 9AM email: "Top 5 perfect jobs yesterday + why they match you" → "Wipro needs React (you have it)" → 1-click apply links. |
| Phone Push | Pro-only instant: Perfect job (92%+) posted <5min ago → phone notification + sound → wake up to job offers. |
| Trend Prediction | Future jobs: Compares this week vs last week → "📈 Data analyst roles +25% next month!" → apply BEFORE companies post. |

**5\. Subscription Module** 

| Feature | What It Does (Simple English) |
| --- | --- |
| Free Tier | Basic access: 50 alerts/week, 80% match minimum, 3 filters → "47/50 used → upgrade nudge" → creates FOMO. |
| Pro Tier | Unlimited everything: No alert limits, 92% matching, phone push, 10 filters → "Pro active - 27 days left" → premium feel. |
| Upgrade Flow | 1-click ₹199: Stripe checkout → instant Pro activation → "Welcome Pro user! Unlimited alerts unlocked" → 30-day subscription. |

**6\. Application Tracker Module**

| Feature | What It Does (Simple English) |
| --- | --- |
| Status Tracker | Progress bar: "Wipro: Interview Round 2 ⏳" → tracks Applied → Shortlist → Interview → Offer → Rejected → visual pipeline. |
| Follow-up Reminders | Never forget: "TCS: Follow up (8d no reply) 📧" → auto-reminds after 7/14 days silence → 6x more interview calls. |
| Response Analytics | Your stats: "47% response rate (23/50 apps)" → "Avg reply time: 5.2 days" → know exactly how good you are. |
| Bulk Actions | Power user: Select 5 old apps → "Withdraw all" or "Reapply" → manage 50+ apps in 1 click. |

**Key Features Recruiters Love**

1.  **Geo-fenced Intelligence**: Only Mangalore + 50km IT jobs
2.  **Fit Score Algorithm**: "Your Certification Management System = 92% Wipro match"
3.  **Trend Prediction**: "Data analyst roles up 25% next month"
4.  **Company Watchlists**: Track Infosys, Cognizant, Mphasis local hiring
5.  **Application Tracker**: Never lose track of 50+ weekly applications

**Technical Implementation**

Frontend: React 18 + Tailwind + Recharts

Backend: Node/Express + Socket.io + Puppeteer

Database: MongoDB Atlas + geospatial queries

Deployment: Vercel (FE) + Railway (BE)

Scheduler: Cron jobs (daily scraping)

APIs: SerpAPI + Resume parser

| Module | Your Features | Perfect Tech Match | How It Works |
| --- | --- | --- | --- |
| CoreJWT + Profiles + Scraper + Ranking | ✅ Puppeteer scraper✅ MongoDB storage✅ JWT auth | Puppeteer + MongoDB Atlas + Express | Puppeteer scrapes Naukri → MongoDB stores 500+ jobs → JWT secures APIs |
| FeaturesNLP + Heatmaps + Spikes + Export + Geo-fencing | ✅ Resume parser (NLP)✅ MongoDB geospatial✅ Salary aggregation | Resume parser API + MongoDB geospatial | pdf-parse extracts skills → MongoDB $geoWithin for Mangalore+50km → aggregation pipeline |
| AppReact + Socket.io + Charts + Tailwind | ✅ React dashboard✅ Live updates✅ Recharts graphs | React 18 + Tailwind + Recharts + Socket.io | React renders dashboard → Socket.io live updates → Recharts salary heatmaps |
| AlertsInstant + Email + Push + Trends | ✅ Socket.io real-time✅ Cron scheduling | Socket.io + Cron jobs | Cron runs every 5min → Socket.io pushes "🚨 Wipro 94%!" |
| SubscriptionFree/Pro + Stripe | ✅ Stripe ₹199/mo | Stripe + Express | Stripe webhook → update user tier → RBAC unlocks Pro features |
| TrackerStatus + Follow-ups + Analytics | ✅ MongoDB tracking✅ Cron reminders | MongoDB + Cron | MongoDB stores app status → Cron detects 7d silence → email follow-up |