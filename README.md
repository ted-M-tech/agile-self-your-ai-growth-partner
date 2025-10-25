# Agile Self - Your AI Growth Partner

**Turn Reflection Into Action**

A modern web application for personal self-retrospection using the KPTA (Keep, Problem, Try, Action) framework, powered by AI insights.

![Version](https://img.shields.io/badge/version-2.0.0_MVP-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

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

### Complete Feature Set
- ✅ Interactive KPTA entry interface with weekly/monthly retrospectives
- ✅ AI-powered wellbeing tracking and trend visualization
- ✅ Action items management with deadlines and completion tracking
- ✅ Full retrospective history with search and filtering
- ✅ Configurable reminders (weekly/monthly)
- ✅ Data export to JSON
- ✅ Responsive design with modern gradient UI
- ✅ Local-first data storage (no account required)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd /Users/tetsuya/Develop/agile-self-your-ai-growth-partner
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up environment variables:
```bash
cp .env.example .env.local
```

For future Gemini API integration, add to `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
agile-self-your-ai-growth-partner/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Main application entry point
│   ├── layout.tsx                # Root layout with metadata
│   ├── globals.css               # Global styles with shadcn/ui colors
│   └── api/                      # API routes (ready for Gemini integration)
│       └── ai/                   # AI endpoint stubs
├── components/                   # React components
│   ├── LandingPage.tsx          # Landing page with gradient hero
│   ├── Dashboard.tsx            # Main dashboard with AI insights
│   ├── KPTAEntry.tsx            # New retrospective creation form
│   ├── ActionsList.tsx          # Action items management
│   ├── RetrospectiveHistory.tsx # Past retrospectives browser
│   ├── Settings.tsx             # User preferences and data management
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── ... (more UI components)
├── lib/                         # Utilities and types
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions (cn helper)
├── public/                      # Static assets
├── specification.md             # Product specification (v2.0)
├── CLAUDE.md                    # AI assistant development guidelines
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

### Backend (Planned)
- **BaaS**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Storage**: PostgreSQL with Row-Level Security

### Current Implementation
- **Data Storage**: Browser localStorage (local-first)
- **AI Features**: Client-side sentiment analysis and pattern detection

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

### Current (MVP)
- **Local-First**: All data stored in browser localStorage
- **No Account**: Use immediately, no signup required
- **Export Anytime**: Download complete data as JSON
- **Privacy**: Data never leaves your device

### Future (Phase 2 - Supabase)
- **Optional Sync**: Cloud backup for multi-device access
- **Row-Level Security**: PostgreSQL RLS ensures data isolation
- **Open Source Backend**: Supabase is open-source, self-hostable
- **Encryption**: Data encrypted in transit and at rest

## 🗺️ Development Roadmap

### ✅ v2.0 MVP (Current)
- [x] Core KPTA functionality
- [x] AI insights (client-side)
- [x] Local data storage
- [x] Complete UI implementation
- [x] Action items with deadlines
- [x] Search and filtering
- [x] Data export

### 🔜 Phase 2: Backend Integration
- [ ] Supabase authentication
- [ ] PostgreSQL database with RLS
- [ ] Cloud data sync across devices
- [ ] Gemini API integration for advanced AI
- [ ] Push notifications for reminders
- [ ] Social auth (Google, Apple)

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
