# Agile Self - Quick Start Guide

Get your Agile Self app running in **10 minutes**!

## ✅ Prerequisites Check

Before starting, make sure you have:
- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm or yarn installed (`npm -v`)
- [ ] Supabase account (free tier: https://supabase.com)
- [ ] Vercel account for deployment (optional, free: https://vercel.com)

---

## 🚀 5-Minute Local Setup

### Step 1: Install Dependencies (1 min)

```bash
cd /Users/tetsuya/Develop/agile-self-your-ai-growth-partner
npm install
```

### Step 2: Set Up Supabase Database (2 min)

1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - Name: `agile-self`
   - Password: (create strong password - **save it!**)
   - Region: (choose closest to you)
4. Wait ~2 minutes for provisioning

### Step 3: Run Database Schema (1 min)

1. In Supabase dashboard → **SQL Editor**
2. Click **"New Query"**
3. Open `supabase/schema.sql` in your code editor
4. Copy **ALL** contents (Cmd/Ctrl+A, Cmd/Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **Run** (or Cmd/Ctrl+Enter)
7. You should see: "Success. No rows returned" ✅

### Step 4: Get API Credentials (30 sec)

1. In Supabase → **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string under "Project API keys")

### Step 5: Configure Environment (30 sec)

```bash
# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your values:
nano .env.local
# or
code .env.local
```

Paste your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Save and close.

### Step 6: Run the App! (30 sec)

```bash
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

---

## 🧪 Test Your Setup (2 min)

1. **Sign Up**: Click "Get Started Free"
   - Enter email and password
   - Click "Sign Up"
   - You'll be redirected to dashboard

2. **Create Retrospective**: Click "New Retrospective"
   - Add some keeps, problems, tries
   - Add action items
   - Click "Complete Retrospective"

3. **View Dashboard**: You should see:
   - Your stats (1 retrospective, X actions)
   - Recent retrospectives list

4. **Check Actions**: Click "Actions" tab
   - See your action items
   - Click checkbox to mark as complete

5. **View History**: Click "History" tab
   - See your retrospective
   - Click "View" to see full details

If all 5 steps work → **Setup successful!** ✅

---

## 🌐 Deploy to Vercel (5 min)

### Option A: GitHub Integration (Recommended)

```bash
# 1. Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: Agile Self MVP"

# 2. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/agile-self.git
git branch -M main
git push -u origin main

# 3. Deploy on Vercel
# Go to: https://vercel.com/new
# Click "Import Git Repository"
# Select your repo
# Add environment variables (same as .env.local)
# Click "Deploy"
```

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? agile-self
# - Directory? ./
# - Override settings? No

# Add environment variables in Vercel dashboard
# Then deploy to production:
vercel --prod
```

### Post-Deployment Setup

1. **Copy your Vercel URL** (e.g., `https://agile-self.vercel.app`)

2. **Update Supabase URLs**:
   - Go to Supabase → **Authentication** → **URL Configuration**
   - Add to **Site URL**: `https://your-app.vercel.app`
   - Add to **Redirect URLs**:
     ```
     https://your-app.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

3. **Test production**: Visit your Vercel URL and sign up!

---

## 📁 Project Structure

```
agile-self-your-ai-growth-partner/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   └── signup/page.tsx         # Sign up
│   └── dashboard/
│       ├── layout.tsx              # Dashboard nav
│       ├── page.tsx                # Main dashboard
│       ├── new/page.tsx            # Create retrospective
│       ├── actions/page.tsx        # Action items
│       ├── history/page.tsx        # History list
│       └── retrospective/[id]/     # Individual view
├── components/
│   └── ProtectedRoute.tsx          # Auth guard
├── lib/
│   ├── supabase/client.ts          # Supabase client
│   └── auth/hooks.ts               # useUser hook
├── supabase/
│   └── schema.sql                  # Database schema
└── .env.local                      # Your credentials
```

---

## 🎯 What You Can Do Now

Your MVP includes:

✅ **Authentication**: Sign up, login, logout
✅ **Create Retrospectives**: Full KPTA interface with 4 steps
✅ **Action Management**: Add, complete, delete action items
✅ **History**: View all past retrospectives
✅ **Individual View**: See full KPTA details
✅ **Dashboard**: Stats and quick actions
✅ **Responsive Design**: Works on desktop and mobile
✅ **Secure**: Row-Level Security protects user data

---

## 🐛 Troubleshooting

### "Failed to fetch" or CORS errors
- ✅ Check `.env.local` has correct Supabase URL and key
- ✅ Restart dev server: `npm run dev`

### Can't sign up/login
- ✅ Verify SQL schema ran successfully in Supabase
- ✅ Check Supabase → Authentication → Providers → Email is enabled
- ✅ Check browser console (F12) for errors

### Database queries fail
- ✅ Verify you're logged in
- ✅ Check Supabase → Table Editor shows tables
- ✅ Test query in Supabase SQL Editor:
  ```sql
  SELECT * FROM users;
  ```

### Build fails on Vercel
- ✅ Check all environment variables are set
- ✅ Make sure TypeScript has no errors: `npm run type-check`
- ✅ Check Vercel build logs for specific error

---

## 📚 Next Steps

### Enhancements (Future)
- [ ] Add reminders (email/push notifications)
- [ ] Data export (PDF, CSV, JSON)
- [ ] User settings page
- [ ] Dark mode
- [ ] Search across all retrospectives
- [ ] Tags/categories for retrospectives

### Phase 2: AI Features
- [ ] Gemini API integration
- [ ] Recurring theme detection
- [ ] AI-suggested actions
- [ ] Sentiment analysis
- [ ] Premium tier implementation

---

## 🆘 Need Help?

- **Detailed Setup**: See [SETUP.md](./SETUP.md)
- **Full Documentation**: See [README.md](./README.md)
- **Specification**: See [specification.md](./specification.md)

---

**You're all set! Start your growth journey with Agile Self! 🚀**
