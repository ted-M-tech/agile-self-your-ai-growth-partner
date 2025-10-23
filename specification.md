# Agile Self: MVP Specification

## 1. Core Concept & Vision

**Agile Self** is a mobile application designed for personal self-retrospective. It adapts the agile KPTA framework into a simple, powerful tool for individuals to foster continuous self-improvement.

- **Name**: Agile Self
- **Tagline**: Your AI Growth Partner
- **Vision**: To create a private, intuitive space where users can reflect on their life weekly or monthly, identify patterns, and create concrete action plans for growth.
- **Motto**: Turn Reflection Into Action.

---

## 2. MVP: The KPTA Framework

The Minimum Viable Product (MVP) will focus exclusively on the KPTA (Keep, Problem, Try, Action) framework to ensure a lean and effective initial release.

### Framework Components

- **Keep**: What went well? What positive habits or events should I continue?
- **Problem**: What obstacles or challenges did I face? What's holding me back?
- **Try**: Based on the 'Problems' and 'Keeps', what is a new approach I can experiment with?
- **Action**: Convert each 'Try' into a specific, concrete to-do item. This is the critical step that distinguishes our app from passive journaling. For example, a 'Try' to "be more organized" becomes an 'Action' to "spend 15 minutes every Sunday planning the week."

---

## 3. MVP: Core Features

The MVP will be a fully functional, standalone application with the following core features:

1. **User Accounts**: Secure and simple user registration and login.
2. **KPTA Entry Interface**: A clean, three-column interface for users to fill out their 'Keep', 'Problem', and 'Try' sections for each retrospective session.
3. **Action Items List**: A simple, integrated to-do list where all 'Action' items are collected. Users can check off items as they are completed.
4. **Retrospective History**: A chronological view of all past KPTA sessions, allowing users to review their journey and track progress over time.
5. **Customizable Reminders**: Gentle, user-configurable notifications to prompt weekly or monthly retrospectives, helping to build a consistent habit.
6. **Data Export**: The ability for users to export their data at any time.

---

## 4. UI/UX Principles

The UI will be simple and cool. The design philosophy will be minimalist, creating a calm and focused environment for reflection.

- **Clean & Serene**: A minimalist interface with a calm color palette and elegant typography to create a "writing oasis".
- **Intuitive Flow**: The user journey from reflection ('Keep'/'Problem') to action ('Try'/'Action') will be visually guided and seamless.
- **Frictionless Onboarding**: A progressive onboarding experience that guides the user through their first KPTA session, demonstrating the app's value immediately without overwhelming them.

---

## 5. Phase 2: AI Suggestion Feature

Immediately following the successful launch and validation of the MVP, we will develop the AI suggestion feature. This will be the core differentiator and the primary driver for the premium version of the app.

### Technology
We will integrate with the Gemini API to power the suggestion engine.

### Functionality
The AI will act as a "Personal Growth Co-Pilot." It will analyze the user's text in the 'Keep' and 'Problem' sections to:

- **Identify Recurring Themes**: Use NLP techniques like topic modeling to find patterns over time (e.g., "I notice 'poor sleep' has been a recurring 'Problem' on weeks you also mention 'stressful meetings.'").
- **Generate Actionable 'Trys'**: Based on a user's 'Problem', the AI will suggest a specific, actionable 'Try'. For example, if a user writes, "I procrastinated on my project," the AI might suggest, "For your 'Try', consider the '5-Minute Rule': commit to working for just 5 minutes to build momentum."
- **Perform Sentiment Analysis**: The AI will analyze the emotional tone of entries to provide users with insights into their well-being over time.

---

## 6. High-Level Tech Stack

- **Mobile Framework**: A cross-platform framework like React Native or Flutter to build for both iOS and Android from a single codebase.
- **Backend**: Supabase (PostgreSQL + auto-generated REST APIs) or custom backend service (Python/Django, Node.js/Express).
- **Database**: PostgreSQL (via Supabase) for relational KPTA data with powerful querying capabilities for analytics.
- **Authentication**: Supabase Auth with email/password, social providers, and magic links.
- **AI Integration**: A dedicated microservice to handle all interactions with the Gemini API for generating suggestions.

---

## 7. Monetization Strategy

We will adopt a Freemium model to maximize user acquisition and create a clear upgrade path.

- **Free Tier (MVP)**: All core KPTA functionality will be free. This includes unlimited retrospectives, action tracking, and history. The goal is to get users to build the habit.
- **Premium Tier (Phase 2)**: The AI Co-Pilot features (thematic analysis, sentiment tracking, and personalized 'Try' suggestions) will be the core of the paid subscription plan.

---

## 8. Detailed Screen Flows & User Journeys

### 8.1 First-Time User Experience

1. **Splash Screen** → App logo with tagline "Your AI Growth Partner"
2. **Welcome Screen** → Brief intro with 3 slides explaining KPTA framework
3. **Sign Up/Login** → Email/password or social auth (Google, Apple)
4. **Onboarding Tutorial** → Interactive guide through first KPTA entry
5. **Reminder Setup** → Choose weekly or monthly cadence (skippable)
6. **Dashboard** → Land on home screen ready to create first retrospective

### 8.2 Core User Flow: Creating a KPTA Retrospective

1. **Dashboard** → "Start New Retrospective" button prominently displayed
2. **KPTA Entry Screen** (3-column layout):
   - **Keep Column** → Text input area with prompt: "What went well?"
   - **Problem Column** → Text input area with prompt: "What challenges did you face?"
   - **Try Column** → Text input area with prompt: "What will you experiment with?"
   - Save draft button (auto-save every 30 seconds)
   - Next button → Navigate to Action creation
3. **Action Items Creation**:
   - Display each "Try" entry
   - For each Try, add specific action items (checkboxes)
   - Example shown: "Try: Be more organized" → Action: "Spend 15 min every Sunday planning"
   - Complete button → Save retrospective
4. **Confirmation** → "Retrospective saved!" with option to view or return to dashboard

### 8.3 Action Items Management Flow

1. **Action Items Tab** → List of all pending actions
2. **Filters**: All / Pending / Completed / By retrospective date
3. **Check off action** → Mark as complete with timestamp
4. **Edit/Delete** → Swipe gestures for management
5. **Link to source** → Tap action to see original KPTA retrospective

### 8.4 History & Review Flow

1. **History Tab** → Chronological list of all retrospectives (card view)
2. **Calendar View Toggle** → See retrospectives by date
3. **Retrospective Detail** → Full KPTA entry with all action items and completion status
4. **Search** → Find entries by keyword
5. **Export** → Select date range, format (PDF, JSON, CSV)

### 8.5 Settings Flow

1. **Profile** → Account info, avatar, email
2. **Reminders** → Configure frequency, time, day of week
3. **Data & Privacy** → Export data, delete account
4. **About** → Version, terms, privacy policy

---

## 9. Data Models

### 9.1 User Model

**PostgreSQL Schema (Supabase)**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_frequency TEXT CHECK (reminder_frequency IN ('weekly', 'monthly')),
  reminder_day TEXT,
  reminder_time TIME,
  fcm_token TEXT, -- For push notifications
  timezone TEXT DEFAULT 'UTC',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**JSON Representation**:
```json
{
  "id": "uuid",
  "email": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "createdAt": "timestamp",
  "preferences": {
    "reminderEnabled": "boolean",
    "reminderFrequency": "weekly | monthly",
    "reminderDay": "string",
    "reminderTime": "string"
  },
  "isPremium": "boolean"
}
```

### 9.2 Retrospective Model

**PostgreSQL Schema (Supabase)**:
```sql
CREATE TABLE retrospectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT CHECK (period_type IN ('weekly', 'monthly')),
  period_start_date DATE,
  period_end_date DATE,
  status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE keeps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retrospective_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retrospective_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retrospective_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Link tries to specific problems/keeps
CREATE TABLE try_links (
  try_id UUID REFERENCES tries(id) ON DELETE CASCADE,
  linked_problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  linked_keep_id UUID REFERENCES keeps(id) ON DELETE CASCADE,
  PRIMARY KEY (try_id, linked_problem_id, linked_keep_id)
);
```

**JSON Representation**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "period": {
    "type": "weekly | monthly",
    "startDate": "date",
    "endDate": "date"
  },
  "keep": [
    {
      "id": "uuid",
      "text": "string",
      "order": "number"
    }
  ],
  "problems": [
    {
      "id": "uuid",
      "text": "string",
      "order": "number"
    }
  ],
  "tries": [
    {
      "id": "uuid",
      "text": "string",
      "order": "number"
    }
  ],
  "status": "draft | completed"
}
```

### 9.3 Action Item Model

**PostgreSQL Schema (Supabase)**:
```sql
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  retrospective_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  try_id UUID REFERENCES tries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  order_index INTEGER NOT NULL
);

-- Index for fast queries on user actions
CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_completed ON actions(is_completed, user_id);
```

**JSON Representation**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "retrospectiveId": "uuid",
  "tryId": "uuid",
  "text": "string",
  "isCompleted": "boolean",
  "createdAt": "timestamp",
  "completedAt": "timestamp | null",
  "dueDate": "date | null",
  "order": "number"
}
```

**Key Benefits of PostgreSQL Schema**:
- Foreign key constraints ensure data integrity
- Cascade deletes clean up related data automatically
- Indexes optimize queries for user actions
- Native date/time support for temporal queries (Phase 2 AI)
- Full-text search on retrospective text

---

## 10. User Stories (MVP)

### Epic 1: User Authentication

- As a new user, I want to sign up with email/password so I can create my account
- As a returning user, I want to log in quickly so I can access my retrospectives
- As a user, I want to reset my password if I forget it

### Epic 2: KPTA Entry

- As a user, I want to create a new retrospective so I can reflect on my week/month
- As a user, I want to write multiple Keep items so I can note everything positive
- As a user, I want to write multiple Problem items so I can identify challenges
- As a user, I want to write Try items so I can plan experiments
- As a user, I want my entries auto-saved so I don't lose my work
- As a user, I want to save drafts so I can return to incomplete retrospectives

### Epic 3: Action Management

- As a user, I want to create specific action items from each Try so I have concrete tasks
- As a user, I want to see all my action items in one place so I can track my commitments
- As a user, I want to check off completed actions so I can track my progress
- As a user, I want to see which retrospective an action came from so I have context

### Epic 4: History & Review

- As a user, I want to view all my past retrospectives so I can review my journey
- As a user, I want to search my retrospectives by keyword so I can find specific entries
- As a user, I want to see completion rates of my actions so I can measure my follow-through

### Epic 5: Reminders

- As a user, I want to set weekly or monthly reminders so I build a consistent habit
- As a user, I want to customize reminder time/day so it fits my schedule
- As a user, I want to turn off reminders if needed so I control notifications

### Epic 6: Data Control

- As a user, I want to export my data so I own my retrospective history
- As a user, I want to delete my account so I can remove my data if needed

---

## 11. Technical Requirements

### 11.1 Mobile Framework

**Recommended: React Native**

- Rationale: Large community, hot reload, reusable web skills, expo for rapid prototyping
- Alternative: Flutter (better performance, growing ecosystem)
- Target: iOS 14+, Android 10+ (API 29+)

### 11.2 Frontend Architecture

- **State Management**: Redux Toolkit or Zustand
- **Navigation**: React Navigation
- **UI Components**: React Native Paper or NativeBase (minimal, clean aesthetic)
- **Forms**: React Hook Form with validation
- **Backend Client**: @supabase/supabase-js for API integration
- **Local Storage**: AsyncStorage or MMKV for offline capability
- **Date Handling**: date-fns or Day.js
- **Real-time**: Supabase Realtime for live updates (optional)

### 11.3 Backend Architecture

**Recommended: Supabase (BaaS - Backend as a Service)**

```
Supabase Stack:
├── PostgreSQL Database (relational data)
├── Auto-generated REST API
├── Realtime subscriptions (WebSocket)
├── Authentication (built-in)
├── Row-Level Security (RLS)
└── Edge Functions (serverless)
```

**Alternative: Custom Backend (Node.js + Express or Python + FastAPI)**

```
Custom Backend Services:
├── API Gateway (Express/FastAPI)
├── Authentication Service (JWT)
├── Retrospective Service
├── Action Service
├── Notification Service (for reminders)
└── User Service
```

- Advantage for custom: Full control, better for complex business logic
- Trade-off: More infrastructure management, slower development

### 11.4 Database

**Recommended: Supabase PostgreSQL**

- **Relational structure**: Perfect for KPTA → Action relationships
- **Real-time subscriptions**: Live updates like Firebase
- **Powerful queries**: Complex joins, aggregations for AI analytics
- **Full-text search**: Built-in search for retrospective history
- **Row-Level Security**: Secure user data isolation
- **Free tier**: 500MB database, 50,000 monthly active users
- **Open source**: No vendor lock-in, can self-host if needed

**Alternative: Firebase Firestore**

- Better mobile SDK maturity
- Excellent offline support
- Simpler for basic CRUD operations
- Trade-off: Harder to query for AI pattern analysis

### 11.5 Cloud Infrastructure

**Recommended: Supabase Cloud**

- **Database**: PostgreSQL (500MB free tier)
- **Authentication**: Built-in auth with social providers
- **Storage**: File storage for user avatars
- **Edge Functions**: Serverless functions for custom logic
- **Realtime**: WebSocket connections for live updates
- **API**: Auto-generated REST and GraphQL APIs

**Cost Estimate**:
- Free tier: Up to 500MB database, 50K MAU, 2GB file storage
- Pro tier: $25/month for 8GB database, 100K MAU (scales with usage)
- Estimated cost for 1000+ users: $25-50/month

**Additional Services Needed:**
- Push Notifications: Firebase Cloud Messaging (FCM) - free
- Analytics: PostHog, Mixpanel, or Google Analytics
- Error Tracking: Sentry (free tier available)

**Alternative: Firebase Suite (Google Cloud)**

- All-in-one solution with mature mobile SDKs
- Better offline support out of the box
- Trade-off: Higher costs at scale, harder to migrate

### 11.6 Authentication

**Recommended: Supabase Auth**

- **Providers**: Email/Password, Google, Apple, GitHub, Magic Links
- **JWT tokens**: Automatic token generation and refresh
- **Row-Level Security**: Database-level user isolation
- **Session management**: Built-in session handling
- **Password recovery**: Email-based reset flow
- **Social auth**: Easy OAuth integration

**Implementation**:
```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### 11.7 Push Notifications

**Firebase Cloud Messaging (FCM)** - Still the best choice for push notifications

- **Free tier**: Unlimited notifications
- **Cross-platform**: iOS and Android support
- **Reliable delivery**: Industry-standard reliability
- **Rich notifications**: Images, actions, deep links

**Implementation with Supabase**:
1. Use FCM for device token management and push delivery
2. Store FCM tokens in Supabase user preferences table
3. Use Supabase Edge Functions or cron jobs to trigger notifications
4. Schedule reminders based on user timezone (stored in Supabase)

**Reminder Flow**:
```
Supabase Cron Job (daily check)
  → Query users with reminders due today
  → Retrieve FCM tokens from database
  → Call FCM API to send notifications
  → Log delivery status
```

### 11.8 Data Export

**Export Formats**:

1. **JSON Export**:
   - Query all user data from Supabase using SQL
   - Include retrospectives, actions, and metadata
   - Generate downloadable JSON file

2. **CSV Export**:
   - Flatten relational data (retrospectives + actions)
   - Excel-compatible format
   - Include timestamps, completion status

3. **PDF Export**:
   - Use react-native-pdf or backend PDF generation
   - Formatted retrospective history with styling
   - Optional: Include completion statistics

**Implementation**:
```javascript
// Supabase query for all user data
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

**Advantages with PostgreSQL**:
- Complex joins for complete data export
- SQL dumps available for power users
- Easy data portability

---

## 12. Success Metrics (MVP)

### 12.1 User Acquisition

- **Target**: 100 active users in first month
- **Measurement**: Sign-ups, DAU/MAU ratio
- **Goal**: 30% weekly retention after 4 weeks

### 12.2 Engagement Metrics

- **Primary**: Retrospectives created per user per month
- **Target**: Average 2+ retrospectives per user in first month
- **Secondary**: Action completion rate (target: 40%+)
- **Time in app**: Average session 8-12 minutes (healthy reflection time)

### 12.3 Quality Metrics

- **Crash-free sessions**: 99%+
- **App load time**: <2 seconds
- **KPTA save success**: 99.9%+

### 12.4 Retention Metrics

- **Week 1 retention**: 50%+
- **Week 4 retention**: 30%+
- **Churn triggers**: Track when users stop creating retrospectives

### 12.5 Qualitative Metrics

- User interviews (5-10 users per sprint)
- NPS score (target: 40+)
- App store ratings (target: 4.2+)
- Feature request themes

---

## 13. MVP Development Timeline

### Phase 1: Foundation (Weeks 1-2)

- Project setup (React Native + Expo)
- Supabase project creation and configuration
- Database schema implementation (PostgreSQL tables)
- Row-Level Security (RLS) policies
- Authentication flow (Supabase Auth)
- Basic navigation structure
- **Deliverable**: Users can sign up and log in

### Phase 2: Core KPTA Entry (Weeks 3-4)

- KPTA entry screen (3-column layout)
- Draft saving and auto-save
- Action item creation flow
- **Deliverable**: Users can create complete KPTA retrospectives

### Phase 3: Action Management (Week 5)

- Action items list view
- Check-off functionality
- Edit/delete actions
- **Deliverable**: Users can manage their action items

### Phase 4: History & Review (Week 6)

- Retrospective history list
- Detail view for past retrospectives
- Search functionality
- **Deliverable**: Users can review their retrospective journey

### Phase 5: Reminders & Settings (Week 7)

- Push notification setup
- Reminder configuration UI
- User settings/preferences
- **Deliverable**: Users receive timely reminders

### Phase 6: Polish & Testing (Week 8)

- Data export functionality
- UI/UX refinements
- Comprehensive testing (unit, integration, E2E)
- Performance optimization
- **Deliverable**: Production-ready MVP

### Phase 7: Beta & Launch (Weeks 9-10)

- TestFlight/Internal testing (week 9)
- Bug fixes and final polish
- App Store/Play Store submission
- **Deliverable**: Public launch

**Total Timeline**: 10 weeks from start to public launch

---

## 14. UI/UX Design Specifications

### 14.1 Color Palette (Calm & Cool)

#### Primary Colors
- **Deep Blue**: `#2C3E50` (headers, primary buttons)
- **Soft Teal**: `#16A085` (accents, active states)
- **Sage Green**: `#95A5A6` (secondary elements)

#### Background
- **Off-White**: `#F9F9F9` (main background)
- **Pure White**: `#FFFFFF` (cards, input areas)
- **Light Gray**: `#ECF0F1` (dividers, borders)

#### Text
- **Primary**: `#2C3E50` (headings)
- **Secondary**: `#7F8C8D` (body text)
- **Placeholder**: `#BDC3C7` (hints)

#### Status Colors
- **Success**: `#27AE60` (completed actions)
- **Warning**: `#F39C12` (pending items)
- **Error**: `#E74C3C` (validation errors)

### 14.2 Typography

**Font Family**: Inter or SF Pro (iOS) / Roboto (Android)

#### Headings
- **H1**: 28px, Bold (screen titles)
- **H2**: 22px, Semi-bold (section headers)
- **H3**: 18px, Medium (card titles)

#### Body
- **Regular**: 16px, Regular (main content)
- **Small**: 14px, Regular (metadata, timestamps)
- **Caption**: 12px, Regular (hints, labels)

#### Spacing
- **Line Height**: 1.5x font size
- **Letter Spacing**: -0.02em for headings

### 14.3 Component Specifications

#### KPTA Entry Screen

- **Layout**: Horizontal scrollable 3-column (swipe between Keep/Problem/Try)
- **Each column**: Full screen width, white background
- **Input area**: Multiline text field, min 5 lines visible
- **Add button**: Floating action button (+ icon) to add multiple entries per column
- **Progress indicator**: 3 dots at top showing which column (Keep/Problem/Try)
- **Navigation**: Swipe or "Next" button, "Back" button to previous

#### Action Items Card

- **Each action**: Checkbox + text + source indicator
- **Swipe left**: Delete (red)
- **Swipe right**: Edit (blue)
- **Tap**: View source retrospective
- **Completed items**: Strike-through text, gray checkbox

#### Retrospective History Card

- **Date range badge** (top right)
- **Summary**: X keeps, Y problems, Z tries, W actions
- **Completion bar**: Visual % of actions completed
- **Tap**: Open full detail view

#### Reminder Notification

- **Title**: "Time to Reflect"
- **Body**: "Your weekly retrospective is waiting"
- **Icon**: App logo with calm color
- **Deep link**: Opens to new KPTA entry screen

### 14.4 Interaction Patterns

- **Loading states**: Subtle shimmer effect, not spinners
- **Empty states**: Friendly illustrations + helpful text
- **Success feedback**: Subtle haptic + checkmark animation
- **Gestures**: Swipe to delete/edit, pull-to-refresh on lists
- **Transitions**: Smooth 300ms ease-in-out animations

---

## 15. Phase 2 Preparation (AI Integration)

### 15.1 Data Collection Strategy (for future AI)

- Store full text of all KPTA entries (not just summaries)
- Tag entries with timestamps for temporal analysis
- Preserve edit history for pattern detection
- Collect action completion rates per user

### 15.2 API Architecture (Phase 2)

```
AI Microservice:
├── Gemini API Client
├── Pattern Analysis Module (topic modeling)
├── Suggestion Generator
├── Sentiment Analyzer
└── Rate Limiter & Cost Control
```

### 15.3 Premium Feature Placeholders

- In MVP settings: "AI Features (Coming Soon)" section
- Dashboard: Small banner "Get AI insights" (non-intrusive)
- Build email list for Phase 2 early access

### 15.4 Cost Management

- Rate limit: 10 AI requests per user per month (premium)
- Batch processing: Analyze retrospectives in bulk, not real-time
- Caching: Store AI suggestions to avoid redundant API calls
- Budget alert: Monitor Gemini API costs weekly

---

## 16. Risk Mitigation

### Technical Risks

- **Firebase costs scaling** → Monitor usage, set budget alerts
- **Offline sync conflicts** → Implement last-write-wins with timestamp
- **Push notification delivery** → Track delivery rate, fallback to in-app

### Product Risks

- **Low engagement** → Weekly user interviews to refine UX
- **Poor retention** → A/B test reminder timing and copy
- **Complex UI** → User testing sessions before each release

### Business Risks

- **Slow growth** → Referral program, social sharing of milestones
- **Monetization** → Validate premium willingness-to-pay early (surveys)

---

## 17. Launch Checklist

### Pre-Launch

- [ ] Privacy policy and terms of service published
- [ ] App Store screenshots and description (ASO optimized)
- [ ] Crash reporting (Sentry or Firebase Crashlytics)
- [ ] Analytics tracking (Firebase Analytics)
- [ ] Beta testing with 20+ users for 2 weeks
- [ ] Performance testing (handle 1000 retrospectives per user)

### Launch

- [ ] Submit to App Store (iOS review ~7 days)
- [ ] Submit to Play Store (Android review ~3 days)
- [ ] Landing page with email signup
- [ ] Social media accounts (Twitter, Product Hunt)
- [ ] Press kit and launch announcement

### Post-Launch

- [ ] Monitor crash rate daily (first week)
- [ ] Respond to user reviews within 24 hours
- [ ] Weekly metrics review (retention, engagement)
- [ ] User interview schedule (2 per week)
- [ ] Iterate based on feedback (bi-weekly releases)

---

## 18. Why Supabase for KPTA?

### Perfect Fit for KPTA Framework

**1. Relational Data Model**
- KPTA is inherently relational (Keeps → Tries → Actions)
- PostgreSQL enforces data integrity with foreign keys
- Easy to query relationships for analytics

**2. Powerful Querying for AI (Phase 2)**
```sql
-- Example: Find recurring problems across retrospectives
SELECT text, COUNT(*) as frequency
FROM problems
WHERE user_id = $1
GROUP BY text
HAVING COUNT(*) > 1
ORDER BY frequency DESC;
```

**3. Full-Text Search**
- Built-in search across all retrospectives
- No additional service needed
- Fast and accurate

**4. Real-time Subscriptions (Optional)**
```javascript
// Listen for new action completions
supabase
  .from('actions')
  .on('UPDATE', payload => {
    console.log('Action completed!', payload)
  })
  .subscribe()
```

**5. Row-Level Security (RLS)**
- Database-level user isolation
- No user can access another user's data
- Enforced at PostgreSQL level, not just app level

**6. Developer Experience**
- Auto-generated TypeScript types from schema
- Instant REST API from table definitions
- Built-in auth with social providers
- Local development with Docker

**7. Cost & Scalability**
- Free tier: 500MB database, 50K MAU
- Predictable pricing as you scale
- No surprises like Firebase's document read costs

### Migration Path from Firebase (if needed)
If you later need Firebase features:
- Use both: Supabase for data, FCM for notifications
- Easy to add Firebase SDK alongside Supabase
- Not locked into either platform

---

**Document Version**: 1.3
**Last Updated**: 2025-10-23
**Status**: MVP Specification - Ready for Development (Updated to Supabase)
