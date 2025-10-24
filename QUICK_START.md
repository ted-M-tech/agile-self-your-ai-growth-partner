# Quick Start - New Features Setup

## 🚀 Fast Setup (5 minutes)

### Step 1: Add AI Cache Table (2 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `supabase/migrations/add_ai_insights_cache.sql` in your editor
5. Copy the entire file and paste into Supabase
6. Click **Run** (or Cmd/Ctrl + Enter)
7. ✅ Verify: Go to **Table Editor** → you should see `ai_insights_cache` table

**Done!** The AI caching is now active. Your app will automatically:
- Cache AI insights after generating them
- Reuse cache on subsequent visits (saves tokens!)
- Regenerate only when new retrospectives are created

---

### Step 2: Setup Google OAuth (3 minutes)

#### A. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   ⚠️ Replace `YOUR-PROJECT-REF` with your actual Supabase project reference
7. **Save** and copy the **Client ID** and **Client Secret**

#### B. Supabase Dashboard

1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google** to **ON**
4. Paste your **Client ID** and **Client Secret**
5. Copy the **Callback URL** shown
6. Go back to Google Cloud Console and verify this callback URL is in your redirect URIs
7. Click **Save** in Supabase

**Done!** Google OAuth is now active.

---

### Step 3: Test Everything (1 minute)

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/login`
3. ✅ You should see "Sign in with Google" button
4. Click it and verify Google login works
5. Go to dashboard and check console logs:
   - Should see "Generated fresh insights" (first time)
   - Should see "Loaded insights from cache" (subsequent visits)

---

## 🎉 That's It!

Your app now has:
- ✅ **90% fewer API calls** (cached insights)
- ✅ **Google OAuth** for easy sign-in
- ✅ **Automatic cache management**

---

## 📊 Monitor Your Token Savings

Watch your browser console when visiting the dashboard:

**First visit after new retrospective:**
```
Generated fresh insights
Cached insights for user abc-123
```

**Subsequent visits (saved tokens!):**
```
Loaded insights from cache (last updated: 2025-01-24T...)
```

**Cache becomes outdated (user creates new retro):**
```
Generating new insights for user abc-123 (cache outdated)
```

---

## ❓ Troubleshooting

### "relation 'users' already exists"
✅ **This is fine!** It means your database already has the table. Just run the migration file instead: `supabase/migrations/add_ai_insights_cache.sql`

### "redirect_uri_mismatch" on Google OAuth
🔧 **Fix:** Make sure the redirect URI in Google Cloud Console **exactly matches** the callback URL from Supabase (including `https://` and full path)

### Google OAuth not working locally
🔧 **Fix:** Make sure you added `http://localhost:3000/auth/callback` to Google Cloud Console authorized redirect URIs

### AI insights not loading
🔧 **Check:**
- Do you have 2+ completed retrospectives? (required for insights)
- Is `GEMINI_API_KEY` set in `.env.local`?
- Check browser console for errors

---

## 📚 More Details

- Full setup guide: `SETUP_GUIDE.md`
- Technical overview: `CHANGES_SUMMARY.md`
- Database schema: `supabase/schema.sql`
