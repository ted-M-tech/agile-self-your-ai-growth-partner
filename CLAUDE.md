# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agile Self** is a web application for personal self-retrospection using the KPTA (Keep, Problem, Try, Action) framework. The tagline is "Your AI Growth Partner" with the motto "Turn Reflection Into Action."

## Product Architecture

### Development Strategy

**MVP with AI Integration**: Core KPTA functionality with AI-powered insights from the start
- User authentication and account management
- KPTA entry interface (Keep, Problem, Try columns)
- Action items list with completion tracking
- Retrospective history view
- **AI-powered wellbeing scoring** using Gemini API
- **Sentiment analysis and pattern detection** for personalized insights
- **Actionable suggestions** based on retrospective data
- Customizable reminders for weekly/monthly retrospectives
- Data export capability
- Freemium model: Core features free, advanced AI features premium

### Tech Stack

The application uses modern web technologies:

**Frontend**: React 18+ with TypeScript and Vite for fast development
**UI Framework**: Tailwind CSS with shadcn/ui component library
**Backend**: Supabase (BaaS - Backend as a Service) with auto-generated REST APIs
**Database**: PostgreSQL (via Supabase) - relational database perfect for KPTA relationships
**Authentication**: Supabase Auth with email/password, social providers, magic links
**AI Service**: Gemini API for wellbeing analysis, sentiment detection, and personalized insights
**Deployment**: Vercel or Netlify for web hosting with automatic deployments

### Why Supabase?
- **Relational data model**: KPTA structure (Keeps → Tries → Actions) is inherently relational
- **Powerful queries**: PostgreSQL enables complex analytics for AI features
- **Row-Level Security (RLS)**: Database-level user data isolation
- **Real-time subscriptions**: Live updates without polling
- **Full-text search**: Built-in search for retrospective history
- **Open source**: No vendor lock-in, can self-host if needed
- **Cost-effective**: Free tier covers 500MB database and 50K MAU
- **Perfect for web apps**: Excellent TypeScript SDK, instant REST APIs

## Key Product Principles

### KPTA Framework Flow
1. **Keep**: What went well, what to continue
2. **Problem**: Obstacles and challenges faced
3. **Try**: New approaches to experiment with (based on Problems and Keeps)
4. **Action**: Specific, concrete to-dos derived from each Try

The critical differentiator is the Action step - converting reflection into concrete actionable items (e.g., "be more organized" → "spend 15 minutes every Sunday planning the week").

### UI/UX Philosophy
- Modern gradient design with backdrop blur effects
- Visual guidance from reflection (Keep/Problem) to action (Try/Action)
- Progressive onboarding through interactive landing page
- Clean, responsive interface optimized for web browsers
- Smooth animations and transitions for enhanced user experience

### Monetization Model
- Freemium: Core KPTA features are free to build habit
- Premium: AI Co-Pilot features (thematic analysis, sentiment tracking, personalized suggestions)

## Development Notes

### Database Schema (Supabase PostgreSQL)

The app uses a relational database with the following key tables:
- `users` - User accounts and profile
- `user_preferences` - Settings, reminder config
- `retrospectives` - Main KPTA sessions
- `keeps`, `problems`, `tries` - Individual KPTA entries (normalized)
- `actions` - Actionable items derived from tries
- `try_links` - Optional relationships between tries and problems/keeps

**Important**: Always implement Row-Level Security (RLS) policies to ensure users can only access their own data.

### When implementing the KPTA interface:
- Use a two-column grid layout (Keep/Problem) followed by Try & Actions section
- Ensure the flow from Try → Action is seamless with inline action creation checkboxes
- Action items can be created directly from Try entries with optional deadlines
- Use Supabase real-time subscriptions for live updates (optional)
- Store entries in separate tables (`keeps`, `problems`, `tries`) with foreign keys to `retrospectives`
- Implement with React components using Tailwind CSS and shadcn/ui

### When implementing reminders:
- Must be user-configurable (weekly or monthly)
- For web: Use browser notifications API or email reminders
- Goal is habit-building, not pressure
- Use Supabase Edge Functions or cron jobs to trigger reminder checks
- Respect user timezone (stored in preferences)
- Consider integrating with calendar APIs for advanced users

### When implementing data queries:
- Use Supabase client with TypeScript for type safety
- Leverage PostgreSQL joins for complex queries (e.g., retrospectives with all related data)
- Example: `.select('*, keeps(*), problems(*), tries(*), actions(*)')`
- Use indexes on frequently queried columns (user_id, created_at, is_completed)
- Full-text search is available via PostgreSQL `tsvector` for search features

### When implementing AI features with Gemini API:
- PostgreSQL enables powerful temporal analysis queries (date ranges, aggregations)
- Store full text of entries (not summaries) for NLP processing
- Use window functions and CTEs for pattern detection
- Example: Find recurring problems with `GROUP BY text HAVING COUNT(*) > 1`
- Consider adding `embeddings` column for vector similarity search (pgvector extension)
- Use Supabase Edge Functions to securely call Gemini API
- Implement rate limiting and cost management for Gemini API calls
- Cache AI insights to reduce API calls and improve performance

### Authentication Implementation:
- Use Supabase Auth SDK: `@supabase/supabase-js`
- Social auth providers: Google, GitHub, and other OAuth providers
- Magic links for passwordless login (optional enhancement)
- JWT tokens are handled automatically by Supabase
- Session persistence with secure token refresh
- Implement protected routes using React Router or similar

### Data Export:
- Use Supabase query builder with nested selects for complete data export
- PostgreSQL supports JSON aggregation for easy export formatting
- Example: `json_agg()` function to create nested JSON structures

### UI/UX Implementation Guidelines:

**Color Palette** (Figma design):
- Gradients: `from-blue-600 via-indigo-600 to-purple-700` for hero sections
- Primary: Blue-600 (`#2563eb`), Indigo-600 (`#4f46e5`), Purple-600 (`#9333ea`)
- Background: `from-slate-50 via-blue-50 to-slate-50` gradient
- Cards: White with backdrop blur (`bg-white/60 backdrop-blur-sm`)
- Text: Slate-900 for headings, Slate-600 for body, Slate-500 for metadata
- Status Colors: Green for keeps, Red for problems, Purple for tries, Blue for actions

**Typography**:
- Font: Inter (web) with fallback to system fonts
- Use Tailwind's built-in text sizing (text-xl, text-2xl, etc.)
- Typography defined in globals.css with CSS variables

**Component Patterns**:
- Two-column grid for Keep/Problem sections
- Single column for Try & Actions with inline action creation
- Backdrop blur effects on cards for modern glass-morphism look
- Smooth 300ms transitions with framer-motion animations
- shadcn/ui components for consistent design

**Navigation**:
- Tab-based navigation: Home, New, Actions, History, Settings
- Badge indicators for pending action counts
- Responsive design for mobile and desktop browsers
