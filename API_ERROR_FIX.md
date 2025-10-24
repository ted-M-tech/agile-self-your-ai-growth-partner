# Fixed: 400 Bad Request on /api/ai/insights

## The Problem

You were getting a `400 Bad Request` error when the dashboard tried to load AI insights on your Vercel deployment.

## Root Cause

The dashboard was only counting the **5 most recent retrospectives** (limited by the query), not the **total number of completed retrospectives**.

The AI insights API requires **at least 2 completed retrospectives**, but it was receiving a count that didn't reflect the actual total.

### Before the Fix:
```javascript
// Only fetched 5 most recent retros
const { data: retros } = await supabase
  .from('retrospectives')
  .select('*')
  .eq('user_id', user!.id)
  .limit(5)  // ❌ Only 5!

// Passed the length of this limited array
<DashboardAIInsights retroCount={retrospectives.length} />
```

### After the Fix:
```javascript
// Now fetches ACTUAL total count
const { count: completedRetroCount } = await supabase
  .from('retrospectives')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user!.id)
  .eq('status', 'completed')  // ✅ Only completed ones

// Passes the real count
<DashboardAIInsights retroCount={stats.completedRetrospectives} />
```

---

## What Was Fixed

### 1. Dashboard Query (`app/dashboard/page.tsx`)

**Added two new queries to get accurate counts:**

```javascript
// Get total retrospectives count
const { count: totalRetroCount } = await supabase
  .from('retrospectives')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user!.id)

// Get completed retrospectives count (for AI)
const { count: completedRetroCount } = await supabase
  .from('retrospectives')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user!.id)
  .eq('status', 'completed')
```

**Updated stats to use these counts:**
```javascript
setStats({
  totalRetrospectives: totalRetroCount || 0,      // ✅ Real count
  completedRetrospectives: completedRetroCount || 0,  // ✅ Real count
  totalActions: totalActions || 0,
  completedActions: completedActions || 0,
})
```

**Updated AI Insights component call:**
```javascript
// Before: retrospectives.length (max 5)
// After: stats.completedRetrospectives (actual count)
<DashboardAIInsights userId={user!.id} retroCount={stats.completedRetrospectives} />
```

### 2. Better Error Logging (`components/DashboardAIInsights.tsx`)

Added emoji-based logging for easier debugging:

```javascript
// Success messages
console.log('✅ Loaded insights from cache')
console.log('✨ Generated fresh insights')

// Error messages
console.log('⚠️ AI Insights not available:', data.error)
console.error('❌ Error loading AI insights:', err.message)
```

---

## How to Verify the Fix

After deploying this update:

### 1. Check Browser Console

Visit your dashboard and open DevTools (F12) → Console tab.

**If you have 2+ completed retrospectives:**
```
✅ Loaded insights from cache (last updated: ...)
```
or
```
✨ Generated fresh insights
```

**If you have less than 2 completed retrospectives:**
```
⚠️ AI Insights not available: Need at least 2 retrospectives for insights (found 1)
```

This is **expected behavior** - AI insights only work with 2+ completed retrospectives!

### 2. Create More Retrospectives

If you don't have 2 completed retrospectives yet:

1. Go to `/dashboard/new`
2. Create a complete retrospective (Keep → Problem → Try → Action)
3. Complete it (don't leave as draft)
4. Repeat one more time
5. Go back to dashboard → AI insights should now load

### 3. Check Stats Card

The "Retrospectives" card on the dashboard should now show the **total count**, not just the 5 most recent.

---

## API Behavior Reference

The `/api/ai/insights` endpoint returns different status codes:

| Status | Reason | Message |
|--------|--------|---------|
| 200 | Success | Returns AI insights (cached or fresh) |
| 400 | Missing userId | "Missing userId" |
| 400 | Not enough data | "Need at least 2 retrospectives for insights (found X)" |
| 500 | Database error | "Failed to count retrospectives" or other errors |

---

## Testing Checklist

After deploying:

- [ ] Dashboard loads without errors
- [ ] Console shows clear log messages (with emojis)
- [ ] Stats card shows correct total retrospectives count
- [ ] If you have 2+ completed retros: AI insights appear
- [ ] If you have <2 completed retros: No AI insights (expected)
- [ ] Creating a new retrospective updates the count
- [ ] AI insights cache working (check console logs)

---

## Related Files Changed

1. `app/dashboard/page.tsx` - Fixed retrospective counting
2. `components/DashboardAIInsights.tsx` - Better error handling

Build Status: ✅ **Successful**

---

## Next Steps

1. **Deploy** the updated code to Vercel
2. **Create 2 completed retrospectives** if you don't have them yet
3. **Check console logs** to verify AI insights are working
4. **Enjoy 90% token savings** with the caching system! 🎉

---

## Still Getting 400 Error?

If you still see the 400 error after deploying:

**Check the console message:**
```
⚠️ AI Insights not available: Need at least 2 retrospectives for insights (found X)
```

This tells you exactly how many completed retrospectives were found.

**Possible reasons:**
- You don't have 2 completed retrospectives yet ✅ **This is OK!**
- Your retrospectives are in "draft" status (need to complete them)
- Database migration for cache table didn't run (check `QUICK_START.md`)

**To verify retrospectives:**
1. Go to Supabase Dashboard
2. Table Editor → `retrospectives`
3. Filter: `status = 'completed'`
4. Count should be 2 or more for AI insights to work
