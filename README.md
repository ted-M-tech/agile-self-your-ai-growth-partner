# Agile Self - Your AI Growth Partner

Turn Reflection Into Action with the KPTA framework for personal retrospectives.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## 📋 Overview

Agile Self is a web application for personal self-retrospection using the **KPTA framework** (Keep, Problem, Try, Action). It helps you:

- 📝 Reflect on your week/month with structured prompts
- 🎯 Convert insights into concrete action items
- ✅ Track completion of your commitments
- 📊 Review your growth journey over time

### KPTA Framework

1. **Keep**: What went well? What should I continue?
2. **Problem**: What challenges did I face?
3. **Try**: What new approaches will I experiment with?
4. **Action**: Specific, concrete to-dos from each Try

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier)
- Vercel account (for deployment, optional)

### Installation

```bash
# 1. Clone the repository
cd /Users/tetsuya/Develop/agile-self-your-ai-growth-partner

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your database password

### 2. Run Database Schema

1. Open Supabase dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and run the query

This will create:
- All required tables (users, retrospectives, keeps, problems, tries, actions)
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic triggers (user creation, updated_at)

### 3. Get API Credentials

In Supabase dashboard → Project Settings → API:
- Copy Project URL
- Copy `anon public` key

Add these to your `.env.local` file.

## 📦 Project Structure

```
agile-self-your-ai-growth-partner/
├── app/                      # Next.js 14 app directory
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── layout.tsx        # Dashboard layout with nav
│   │   ├── page.tsx          # Main dashboard
│   │   ├── new/              # Create retrospective
│   │   ├── actions/          # Action items view
│   │   └── history/          # Retrospective history
│   ├── globals.css           # Global styles + Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/               # Reusable React components
│   └── ProtectedRoute.tsx    # Auth guard component
├── lib/                      # Utilities and helpers
│   ├── auth/
│   │   └── hooks.ts          # useUser hook
│   └── supabase/
│       ├── client.ts         # Supabase client
│       └── database.types.ts # TypeScript types
├── supabase/
│   └── schema.sql            # Database schema
├── SETUP.md                  # Detailed setup guide
├── specification.md          # Product specification
└── package.json
```

## 🎨 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth (email/password)

### Color Palette

```css
Primary:    #2C3E50 (Deep Blue)
Secondary:  #16A085 (Soft Teal)
Accent:     #95A5A6 (Sage Green)
Background: #F9F9F9 (Off-White)
Success:    #27AE60
Warning:    #F39C12
Error:      #E74C3C
```

## 🚢 Deployment to Vercel

### Option 1: GitHub Integration (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to vercel.com/new
# 3. Import your GitHub repository
# 4. Add environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - NEXT_PUBLIC_APP_URL (your vercel URL)
# 5. Deploy!
```

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Redeploy with production vars
vercel --prod
```

### Post-Deployment

1. Update Supabase redirect URLs:
   - Go to Supabase → Authentication → URL Configuration
   - Add: `https://your-app.vercel.app`
   - Add: `https://your-app.vercel.app/auth/callback`

## 📚 Features

### MVP (Current)

- [x] User authentication (email/password)
- [x] KPTA entry interface
- [x] Action items tracking
- [x] Retrospective history
- [x] Dashboard with stats
- [ ] Reminders (coming soon)
- [ ] Data export (coming soon)

### Phase 2 (Future)

- [ ] AI-powered suggestions (Gemini API)
- [ ] Recurring theme identification
- [ ] Sentiment analysis
- [ ] Premium tier features

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Database Queries

Example: Fetch user's retrospectives with all related data

```typescript
const { data, error } = await supabase
  .from('retrospectives')
  .select(`
    *,
    keeps(*),
    problems(*),
    tries(*),
    actions(*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Automatic user data isolation
- ✅ Environment variables for sensitive data
- ✅ Secure session management
- ✅ HTTPS enforced on production

## 📖 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and deployment guide
- [specification.md](./specification.md) - Complete product specification
- [CLAUDE.md](./CLAUDE.md) - AI assistant development guidelines

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- KPTA framework adapted from Agile retrospectives
- UI/UX inspired by minimalist design principles
- Built with Next.js, Supabase, and Tailwind CSS

---

**Made with ❤️ for personal growth and continuous improvement**

For questions or support, please check [SETUP.md](./SETUP.md) for troubleshooting.
