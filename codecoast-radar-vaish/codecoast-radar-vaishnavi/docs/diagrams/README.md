# CodeCoast Radar - Mermaid Diagrams

37 Mermaid diagrams ready for export to images.

## System & Architecture (3 diagrams)
- `01-system-architecture.mmd` - Full system architecture (Frontend, Backend, Database, External Services)
- `02-database-er-diagram.mmd` - Graph-style database schema with 10 entities: User, Job, Application, Subscription, Alert, Saved Search, Company Watchlist, Follow-up, Skill, Location shown as an interactive network graph with color-coded nodes and relationship types
- `03-api-routes-overview.mmd` - API routes structure

## User Flows (8 diagrams)
- `04-user-registration-flow.mmd` - Registration and onboarding process
- `05-job-search-discovery-flow.mmd` - Job browsing and filtering
- `06-application-tracking-fsm.mmd` - FSM state diagram for application status
- `07-application-tracker-flow.mmd` - Detailed application tracking workflow
- `08-alert-system-flow.mmd` - Alert notification system
- `09-subscription-upgrade-flow.mmd` - Stripe payment and upgrade process
- `10-daily-email-alert-flow.mmd` - Daily email digest workflow
- `11-analytics-dashboard-flow.mmd` - Analytics data loading and display

## Data Flows (7 diagrams)
- `12-scraping-to-alert-pipeline.mmd` - Complete scraping to alert pipeline
- `13-detailed-scraping-process.mmd` - Puppeteer scraping workflow
- `14-nlp-matching-algorithm.mmd` - NLP job matching process
- `15-alert-system-data-flow.mmd` - Alert system data processing
- `16-application-tracker-data-flow.mmd` - Application CRUD data flow
- `17-analytics-data-aggregation.mmd` - MongoDB aggregation for analytics
- `18-export-data-flow.mmd` - Excel/CSV export process

## Frontend Components (7 diagrams)
- `19-react-component-hierarchy.mmd` - Complete React component tree
- `20-dashboard-page-structure.mmd` - Dashboard page components
- `21-jobs-page-structure.mmd` - Jobs page with filters and cards
- `22-tracker-page-structure.mmd` - Application tracker page layout
- `23-analytics-page-structure.mmd` - Analytics page with charts
- `24-state-management-flow.mmd` - Zustand state management
- `25-shared-components-library.mmd` - Reusable component library

## Sequence Diagrams (8 diagrams)
- `26-authentication-sequence.mmd` - User registration, login, and JWT authentication flow
- `27-job-scraping-sequence.mmd` - Automated job scraping with Puppeteer from LinkedIn & Indeed
- `28-job-search-sequence.mmd` - Job search, filtering, and NLP-based matching
- `29-application-tracking-sequence.mmd` - Application CRUD operations and status updates
- `30-realtime-alert-sequence.mmd` - WebSocket-based real-time job alerts with Socket.io
- `31-subscription-payment-sequence.mmd` - Stripe checkout and subscription management
- `32-analytics-sequence.mmd` - Analytics dashboard data aggregation and visualization
- `33-export-data-sequence.mmd` - Data export to Excel, CSV, and PDF formats

## Data Flow Diagrams (4 diagrams)
- `34-context-diagram-level0.mmd` - Context diagram showing CodeCoast Radar system with external entities (Users, Job Portals, Stripe, Email)
- `35-level1-dfd.mmd` - Level 1 DFD with 7 major processes: Authentication, Scraping, Matching, Alerts, Tracking, Subscription, Analytics
- `36-level2-dfd-job-matching.mmd` - Level 2 DFD detailing Job Matching process with NLP tokenization, scoring, and geo-fencing
- `37-level2-dfd-alert-generation.mmd` - Level 2 DFD for Alert Generation with cron jobs, subscription limits, and multi-channel delivery

## Export to Images

### Using Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i 01-system-architecture.mmd -o 01-system-architecture.png
```

### Using Online Tools
- [Mermaid Live Editor](https://mermaid.live) - Copy/paste diagram content
- [VS Code Mermaid Extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) - Preview and export
33
### Batch Export (PowerShell)
```powershell
Get-ChildItem *.mmd | ForEach-Object { 
    mmdc -i $_.Name -o ($_.BaseName + ".png") 
}
```

## Syntax Validation

All 37 diagrams have been validated and fixed for Mermaid syntax compatibility. The following issues were resolved:

### Fixed Issues
1. **Pipe characters in labels** - Replaced `|` with `/` in node text (3 instances)
   - Example: `[Save | Track | View]` → `[Save / Track / View]`
2. **Curly braces in text** - Removed curly braces that conflict with decision node syntax (1 instance)
   - Example: `Hi {name}!` → `Hi name`
3. **Parentheses in formulas** - Removed or simplified mathematical expressions (3 instances)
   - Example: `avg(x - y)` → `avg x - y`
4. **Square brackets in arrays** - Simplified array notation (1 instance)
   - Example: `[applied]` → `applied`

### Syntax Rules to Follow
- **Avoid** pipe characters `|` in node labels (reserved for connections)
- **Avoid** curly braces `{}` in text (reserved for decision nodes)
- **Avoid** parentheses `()` in node labels (can cause parse errors)
- **Avoid** nested square brackets `[]` within node definitions
- **Use** HTML entities or alternative symbols when needed
- **Use** `<br/>` for line breaks within nodes
- **Use** emojis freely - they are supported ✅

All diagrams are now ready for export to PNG, SVG, or PDF using Mermaid CLI or online tools.
