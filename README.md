# Agile Self - Your AI Growth Partner

**Turn Reflection Into Action**

A modern web application for personal self-retrospection using the KPTA (Keep, Problem, Try, Action) framework, powered by AI insights.

![Version](https://img.shields.io/badge/version-2.0.0_MVP-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## 🌟 Features

### Core KPTA Framework
- **Keep**: Document what went well and what to continue
- **Problem**: Identify obstacles and challenges faced
- **Try**: Experiment with new approaches based on insights
- **Action**: Convert reflections into concrete, actionable tasks

### AI-Powered Insights
- **Sentiment Analysis**: Track your wellbeing score over time
- **Pattern Detection**: Identify recurring themes in your retrospectives
- **Smart Suggestions**: Get AI-generated recommendations
- **Achievement Recognition**: Celebrate your growth milestones
- **Trend Visualization**: Interactive charts showing your progress

### Authentication & Cloud Sync 🔐
- **Google OAuth**: Secure one-click sign-in with Google account
- **Cloud Sync**: Access your retrospectives from any device
- **Row-Level Security**: Your data is isolated and protected
- **Dual Mode**: Use with authentication (cloud) or locally (offline)

### Complete Feature Set
- ✅ Interactive KPTA entry interface with weekly/monthly retrospectives
- ✅ AI-powered wellbeing tracking and trend visualization
- ✅ Action items management with deadlines and completion tracking
- ✅ Full retrospective history with search and filtering
- ✅ Configurable reminders (weekly/monthly)
- ✅ Data export to JSON
- ✅ Responsive design with modern gradient UI
- ✅ Google Authentication with Supabase
- ✅ Cloud data persistence with PostgreSQL
- ✅ Optimistic UI updates with error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Supabase account for cloud sync and authentication

### Quick Start (Local Mode)

Run without authentication for local-only usage:

1. Clone the repository
```bash
git clone <your-repo-url>
cd agile-self-your-ai-growth-partner
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

Data will be stored in browser localStorage (no cloud sync).

### Full Setup (With Supabase & Google Auth)

For cloud sync and multi-device access:

1. **Complete steps 1-2 from Quick Start above**

2. **Set up Supabase** (detailed guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   - Create Supabase project
   - Configure Google OAuth in Google Cloud Console
   - Run database schema from `supabase/schema.sql`
   - Get API credentials

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Sign in with Google** at [http://localhost:3000/login](http://localhost:3000/login)

📚 **Full setup guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step instructions with screenshots.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
agile-self-your-ai-growth-partner/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Main application (with auth integration)
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── globals.css               # Global styles with shadcn/ui colors
│   ├── login/                    # Authentication pages
│   │   └── page.tsx              # Google OAuth login page
│   └── auth/callback/            # OAuth callback handler
│       └── route.ts              # Supabase auth callback
├── components/                   # React components
│   ├── LandingPage.tsx          # Landing page with gradient hero
│   ├── Dashboard.tsx            # Main dashboard with AI insights
│   ├── KPTAEntry.tsx            # New retrospective creation form
│   ├── ActionsList.tsx          # Action items (Supabase-enabled)
│   ├── RetrospectiveHistory.tsx # Past retrospectives (Supabase-enabled)
│   ├── Settings.tsx             # User preferences and data management
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── ... (17+ components)
├── lib/                         # Utilities and types
│   ├── auth/                    # Authentication
│   │   └── AuthContext.tsx      # Auth state management
│   ├── supabase/                # Supabase integration
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   ├── types.ts             # Database types
│   │   └── data-service.ts      # Data operations
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions (cn helper)
├── supabase/                    # Database schema
│   └── schema.sql               # PostgreSQL schema with RLS
├── public/                      # Static assets
├── specification.md             # Product specification (v2.0)
├── CLAUDE.md                    # AI assistant development guidelines
├── SUPABASE_SETUP.md            # Step-by-step Supabase setup guide
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🎨 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Database
- **BaaS**: [Supabase](https://supabase.com/) - PostgreSQL + Auth + Real-time
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth with Google OAuth 2.0
- **Storage**: Cloud (Supabase) + Local fallback (localStorage)
- **API Client**: `@supabase/supabase-js` + `@supabase/ssr`

### AI Features
- **Current**: Client-side sentiment analysis and pattern detection
- **Planned**: Google Gemini API integration for advanced insights

### Data Architecture
- **Dual Mode**:
  - Authenticated: Cloud sync via Supabase PostgreSQL
  - Local-only: Browser localStorage (no account required)
- **Security**: Row-Level Security policies, JWT tokens, HTTPS only
- **Sync Strategy**: Optimistic UI updates with error rollback

## 📱 Application Flow

### 1. Landing Page
- Gradient hero section with tagline
- Feature showcase (KPTA framework, AI insights, action tracking)
- "How It Works" section
- "Get Started Free" CTA

### 2. Dashboard (Home Tab)
- **Stats Cards**: Wellbeing score, average score, action completion rate, total sessions
- **Trend Chart**: Interactive line chart showing wellbeing over time (30d/90d/All)
- **AI Insights**: Personalized cards showing:
  - Pattern detection (recurring sleep issues, procrastination)
  - Achievement recognition (completion streaks, consistency)
  - Smart suggestions (2-Minute Rule, Pomodoro technique)
  - Warnings (low completion rate, wellbeing trends)
- **Recent Retrospectives**: Summary cards with scores

### 3. New Retrospective (New Tab)
- **Type Selection**: Weekly (7-day) or Monthly (full month)
- **Date Range**: Auto-populated, manually adjustable
- **Auto Title**: Generated from dates, editable
- **Keep Section**: What went well (green theme)
- **Problem Section**: What challenges faced (red theme)
- **Try & Actions Section**: Experiments with inline action creation
  - Add Try items
  - Check "Create action item" to convert to trackable action
  - Set optional deadlines
  - Badge indicates "From Try"

### 4. Actions List (Actions Tab)
- **Stats Cards**: Total actions, pending count, completion rate
- **Filters**: All / Pending / Completed
- **Action Cards**:
  - Checkbox for completion
  - Action text
  - Badges: source retrospective, deadline, "From Try"
  - Delete button with confirmation
  - Overdue highlighting (red deadline badge)
- **Empty States**: Contextual messages based on filter

### 5. Retrospective History (History Tab)
- **Stats Cards**: Total retrospectives, weekly count, monthly count
- **Search Bar**: Full-text search across titles and KPTA content
- **Filters**: All / Weekly / Monthly
- **Retrospective Cards**:
  - Header: Title, type badge, date range, wellbeing score
  - Stats: Keep/Problem/Try/Action counts
  - Progress bar (wellbeing score)
  - Expandable: Click to show full KPTA details
  - Delete with confirmation
- **Expanded View**: Full Keep/Problem/Try lists, action completion status

### 6. Settings (Settings Tab)
- **Reminders**:
  - Enable/disable toggle
  - Frequency: Weekly or Monthly
  - Day selection (Sunday-Saturday for weekly, Day 1-31 for monthly)
- **Appearance**:
  - Theme: Light/Dark (UI prepared, dark mode coming soon)
- **Data Management**:
  - Export to JSON (includes all retrospectives, settings, metadata)
  - Clear all data with double confirmation
- **About**: Version, framework, statistics

## 🔑 Authentication Flow

### Sign In with Google

1. **Click "Get Started Free"** on landing page → Redirects to `/login`
2. **Click "Continue with Google"** → OAuth flow begins
3. **Authorize with Google** → Select Google account
4. **Auto-redirect** → Returns to app via `/auth/callback`
5. **Instant access** → Dashboard loads with synced data

### User Experience

**First Time User:**
```
Landing Page → Login → Google OAuth → Dashboard (empty state)
                                    → Create first retrospective
                                    → Data saves to Supabase automatically
```

**Returning User:**
```
Landing Page → Auto-detected session → Dashboard (with data)
                                     → All retrospectives loaded from Supabase
```

**Sign Out:**
```
Header → Sign Out button → Confirmation toast
                        → Data remains in Supabase (safe)
                        → Redirected to landing page
```

### Session Management
- **Auto-refresh**: Sessions automatically refresh, no re-login needed
- **Persistent**: Stay signed in across browser sessions
- **Secure**: JWT tokens stored securely in httpOnly cookies
- **User Info**: Avatar and name displayed in header
- **Multi-tab**: Works seamlessly across browser tabs

### Data Sync Behavior

**When Authenticated:**
- ✅ All CRUD operations sync to Supabase instantly
- ✅ Optimistic UI updates (instant feedback)
- ✅ Error handling with rollback on failure
- ✅ Data persists across devices
- ✅ Automatic conflict resolution

**When Local-Only:**
- ✅ All data stays in browser localStorage
- ✅ No network requests
- ✅ Works offline
- ✅ Can export to JSON
- ⚠️ Data limited to current browser

## 🎯 KPTA Framework Guide

### Keep 🟢
**Ask yourself:** "What went well this week/month?"
- Positive habits you maintained
- Achievements and wins
- Things that brought you joy
- Effective strategies that worked

**Examples:**
- "Exercised 4 times this week"
- "Finished the project ahead of deadline"
- "Had meaningful conversations with friends"

### Problem 🔴
**Ask yourself:** "What obstacles did I face?"
- Challenges and frustrations
- Things that didn't go as planned
- Areas where you struggled
- Patterns you want to change

**Examples:**
- "Struggled with sleep quality"
- "Procrastinated on important tasks"
- "Felt overwhelmed by email volume"

### Try 🟣
**Ask yourself:** "What experiments should I try?"
- New approaches based on your Problems
- Ways to sustain your Keeps
- Small changes to test
- Growth opportunities

**Examples:**
- "Try the Pomodoro technique for focus"
- "Experiment with earlier bedtime routine"
- "Test time-blocking for deep work"

### Action 🔵
**Convert Tries into concrete tasks:**
- ❌ **Vague**: "Be more organized"
- ✅ **Specific**: "Spend 15 minutes every Sunday planning the week"

**Action Item Best Practices:**
- Make it measurable
- Add a deadline
- Keep it small and achievable
- Track completion

## 🤖 AI Features Explained

### Wellbeing Score Calculation
The AI analyzes each retrospective to generate a 0-100 wellbeing score:

1. **Sentiment Balance**: Ratio of Keeps to Problems (base score)
2. **Action Orientation**: Bonus for creating Tries and Actions (+5 each)
3. **Reflection Depth**: Bonus for detailed entries (+5)
4. **Capped at 100**: Ensures consistent scale

**Color Coding:**
- 🟢 70-100: Excellent
- 🟡 50-69: Good
- 🔴 0-49: Needs attention

### Pattern Detection
The AI scans your retrospectives for:
- **Recurring keywords** in Problems (sleep, procrastination, stress)
- **Behavioral patterns** across multiple sessions
- **Sentiment trends** over time

### Insight Types

1. **Pattern** (🔔 Amber): Recurring themes identified
   - "Sleep issues appear frequently"

2. **Suggestion** (💡 Blue): Research-backed techniques
   - "Try the 2-Minute Rule for procrastination"

3. **Achievement** (✨ Green/Purple): Milestones and wins
   - "Wellbeing improved by 15 points!"
   - "70% action completion rate - you're crushing it!"

4. **Warning** (⚠️ Red): Areas needing attention
   - "Many action items remain incomplete"

### Consistency Recognition
If you complete 4+ retrospectives with ~weekly intervals, AI recognizes:
- "Consistent Reflection Habit - you're building a great routine!"

## 🔐 Data & Privacy

### Dual-Mode Architecture

**Authenticated Mode** (with Supabase):
- **Google OAuth**: Secure sign-in with Google account
- **Cloud Sync**: Data stored in PostgreSQL, accessible from any device
- **Row-Level Security**: RLS policies ensure you can only access your own data
- **Encryption**: Data encrypted in transit (HTTPS) and at rest
- **Multi-Device**: Access your retrospectives from phone, tablet, desktop
- **Automatic Backups**: Supabase handles database backups

**Local-Only Mode** (without authentication):
- **No Account Required**: Use immediately, no signup
- **Browser Storage**: All data stored in localStorage
- **Privacy**: Data never leaves your device
- **Export Anytime**: Download complete data as JSON
- **Single Device**: Data only available on current browser

### Security Features
- ✅ **JWT Authentication**: Secure token-based sessions
- ✅ **OAuth 2.0**: Industry-standard Google sign-in
- ✅ **HTTPS Only**: All connections encrypted
- ✅ **No Password Storage**: Google handles credentials
- ✅ **RLS Policies**: Database-level data isolation
- ✅ **Session Auto-Refresh**: Seamless authentication experience
- ✅ **Open Source Backend**: Supabase is fully open-source, self-hostable

## 🗺️ Development Roadmap

### ✅ v2.0 MVP (Current - Complete!)
- [x] Core KPTA functionality
- [x] AI insights (client-side pattern detection)
- [x] Local data storage (localStorage)
- [x] Complete UI implementation
- [x] Action items with deadlines
- [x] Search and filtering
- [x] Data export to JSON
- [x] **Supabase authentication (Google OAuth)**
- [x] **PostgreSQL database with RLS**
- [x] **Cloud data sync across devices**
- [x] **Dual-mode support (authenticated + local-only)**

### 🔜 Phase 2: Enhanced Features
- [ ] Additional OAuth providers (Apple, GitHub, email/password)
- [ ] Real-time sync using Supabase Realtime
- [ ] Gemini API integration for advanced AI insights
- [ ] Push notifications for reminders (Supabase Edge Functions)
- [ ] Data migration tool (localStorage → Supabase)

### 🚀 Phase 3: Premium Features
- [ ] Advanced AI analysis (topic modeling, semantic search)
- [ ] Recurring action templates
- [ ] Custom KPTA fields
- [ ] Team retrospectives
- [ ] Enhanced data visualization
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Habit tracking integration

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server at localhost:3000
npm run build            # Create production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Type Checking
tsc --noEmit             # TypeScript type check
```

### Adding New UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
```

### Project Commands Used
```bash
npx shadcn@latest init           # Initial setup
npx shadcn@latest add button     # Core components
npx shadcn@latest add card
npx shadcn@latest add input
# ... and more
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects Next.js

3. **Configure**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto)

4. **Environment Variables** (if using Gemini API):
   ```
   GEMINI_API_KEY=your_key_here
   ```

5. **Deploy**: Click "Deploy"

### Other Platforms

- **Netlify**: Works with Next.js adapter
- **Cloudflare Pages**: Supports Next.js
- **Self-hosted**: Use `npm run build && npm start`

## 📖 Documentation

- [specification.md](./specification.md) - Complete product specification v2.0
- [CLAUDE.md](./CLAUDE.md) - AI assistant development guidelines and architecture

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Maintain the gradient color scheme
- Write clear commit messages
- Test locally before PR

## 🐛 Troubleshooting

### Build Errors

**Issue**: `border-border class does not exist`
- **Fix**: Ensure `globals.css` has shadcn/ui CSS variables and `tailwind.config.ts` maps them

**Issue**: `Cannot find module 'class-variance-authority'`
- **Fix**: `npm install class-variance-authority clsx tailwind-merge`

**Issue**: `Maximum update depth exceeded`
- **Fix**: Avoid Radix Tabs in certain contexts, use Button-based navigation

### Data Issues

**Lost Data After Refresh**
- Data is in localStorage - check browser settings allow localStorage
- Don't use Incognito/Private mode (localStorage is session-only)

**Export Not Working**
- Check browser allows downloads
- Try different browser if blocked

## 📄 License

This project is open source under the MIT License.

## 🙏 Acknowledgments

- **KPTA Framework**: Adapted from Agile retrospectives methodology
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- **Design**: Modern gradient aesthetic inspired by Figma prototype
- **AI Inspiration**: Research-backed personal growth techniques

## 📧 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check [specification.md](./specification.md) for detailed feature documentation

---

**Made with ❤️ for personal growth and continuous improvement**

*"Turn Reflection Into Action"*
