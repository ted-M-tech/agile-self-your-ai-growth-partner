# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agile Self** is a mobile application for personal self-retrospection using the KPTA (Keep, Problem, Try, Action) framework. The tagline is "Your AI Growth Partner" with the motto "Turn Reflection Into Action."

## Product Architecture

### Two-Phase Development Strategy

**MVP (Phase 1)**: Core KPTA functionality without AI features
- User authentication and account management
- KPTA entry interface (Keep, Problem, Try columns)
- Action items list with completion tracking
- Retrospective history view
- Customizable reminders for weekly/monthly retrospectives
- Data export capability
- All features are free in this phase

**Phase 2**: AI-powered suggestions using Gemini API
- Recurring theme identification using topic modeling
- Actionable "Try" suggestions based on Problems
- Sentiment analysis for well-being insights
- This becomes the premium tier feature

### Tech Stack Considerations

The specification outlines these technology choices:

**Mobile**: React Native (with Expo) for cross-platform development
**Backend**: Supabase (BaaS - Backend as a Service) with auto-generated REST APIs
**Database**: PostgreSQL (via Supabase) - relational database perfect for KPTA relationships
**Authentication**: Supabase Auth with email/password, social providers, magic links
**Push Notifications**: Firebase Cloud Messaging (FCM) for reminders
**AI Service**: Separate microservice for Gemini API integration (Phase 2)

### Why Supabase?
- **Relational data model**: KPTA structure (Keeps → Tries → Actions) is inherently relational
- **Powerful queries**: PostgreSQL enables complex analytics for Phase 2 AI features
- **Row-Level Security (RLS)**: Database-level user data isolation
- **Real-time subscriptions**: Live updates without polling
- **Full-text search**: Built-in search for retrospective history
- **Open source**: No vendor lock-in, can self-host if needed
- **Cost-effective**: Free tier covers 500MB database and 50K MAU

## Key Product Principles

### KPTA Framework Flow
1. **Keep**: What went well, what to continue
2. **Problem**: Obstacles and challenges faced
3. **Try**: New approaches to experiment with (based on Problems and Keeps)
4. **Action**: Specific, concrete to-dos derived from each Try

The critical differentiator is the Action step - converting reflection into concrete actionable items (e.g., "be more organized" → "spend 15 minutes every Sunday planning the week").

### UI/UX Philosophy
- Minimalist "writing oasis" design with calm color palette
- Visual guidance from reflection (Keep/Problem) to action (Try/Action)
- Progressive onboarding through first KPTA session
- Clean, serene interface focused on reducing friction

### Monetization Model
- Freemium: Core KPTA features are free to build habit
- Premium: AI Co-Pilot features (thematic analysis, sentiment tracking, personalized suggestions)

## Development Notes

### Database Schema (Supabase PostgreSQL)

The app uses a relational database with the following key tables:
- `users` - User accounts and profile
- `user_preferences` - Settings, reminder config, FCM tokens
- `retrospectives` - Main KPTA sessions
- `keeps`, `problems`, `tries` - Individual KPTA entries (normalized)
- `actions` - Actionable items derived from tries
- `try_links` - Optional relationships between tries and problems/keeps

**Important**: Always implement Row-Level Security (RLS) policies to ensure users can only access their own data.

### When implementing the KPTA interface:
- Use a three-column layout for Keep/Problem/Try entry
- Ensure the flow from Try → Action is seamless and intuitive
- Action items should automatically populate from Try entries
- Use Supabase real-time subscriptions for live updates (optional)
- Store entries in separate tables (`keeps`, `problems`, `tries`) with foreign keys to `retrospectives`

### When implementing reminders:
- Must be user-configurable (weekly or monthly)
- Should be gentle, non-intrusive notifications
- Goal is habit-building, not pressure
- Store FCM tokens in `user_preferences` table
- Use Supabase Edge Functions or cron jobs to trigger reminder checks
- Respect user timezone (stored in preferences)

### When implementing data queries:
- Use Supabase client with TypeScript for type safety
- Leverage PostgreSQL joins for complex queries (e.g., retrospectives with all related data)
- Example: `.select('*, keeps(*), problems(*), tries(*), actions(*)')`
- Use indexes on frequently queried columns (user_id, created_at, is_completed)
- Full-text search is available via PostgreSQL `tsvector` for search features

### When preparing for Phase 2 AI integration:
- PostgreSQL enables powerful temporal analysis queries (date ranges, aggregations)
- Store full text of entries (not summaries) for NLP processing
- Use window functions and CTEs for pattern detection
- Example: Find recurring problems with `GROUP BY text HAVING COUNT(*) > 1`
- Consider adding `embeddings` column for vector similarity search (pgvector extension)
- Plan for microservice architecture to isolate Gemini API processing
- Rate limiting and cost management for Gemini API calls

### Authentication Implementation:
- Use Supabase Auth SDK: `@supabase/supabase-js`
- Social auth providers: Google, Apple (required for iOS)
- Magic links for passwordless login (optional enhancement)
- JWT tokens are handled automatically by Supabase
- Session persistence with secure token refresh

### Data Export:
- Use Supabase query builder with nested selects for complete data export
- PostgreSQL supports JSON aggregation for easy export formatting
- Example: `json_agg()` function to create nested JSON structures

### UI/UX Implementation Guidelines:

**Color Palette** (from specification):
- Primary: Deep Blue `#2C3E50`, Soft Teal `#16A085`
- Background: Off-White `#F9F9F9`, Pure White `#FFFFFF`
- Text: Primary `#2C3E50`, Secondary `#7F8C8D`
- Status: Success `#27AE60`, Warning `#F39C12`, Error `#E74C3C`

**Typography**:
- Font: Inter or SF Pro (iOS) / Roboto (Android)
- H1: 28px Bold, H2: 22px Semi-bold, Body: 16px Regular

**Component Patterns**:
- Use horizontal scrollable 3-column layout for KPTA entry
- Swipe gestures for delete/edit on action items
- Subtle shimmer effects for loading (not spinners)
- 300ms ease-in-out transitions
- Haptic feedback on action completion

**Navigation**:
- Bottom tab navigation: Dashboard, Actions, History, Settings
- Gesture-based navigation between KPTA columns
- Deep linking for push notifications → new retrospective screen
