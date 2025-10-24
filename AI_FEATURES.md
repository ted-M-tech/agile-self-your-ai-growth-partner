# AI Features Documentation

This document explains the AI-powered features in Agile Self using Google's Gemini API.

## Overview

Agile Self uses **Gemini 1.5 Flash** (free tier) to provide intelligent insights:

1. **Retrospective Summaries** - AI-generated summaries of your KPTA sessions
2. **Smart Suggestions** - Actionable "Try" suggestions based on your Problems and Keeps
3. **Pattern Detection** - Identify recurring themes across multiple retrospectives
4. **Sentiment Analysis** - Track your well-being and emotional trends over time

## Setup Instructions

### 1. Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### 2. Add the API Key to Your Project

Add this line to your `.env.local` file:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

**Important**: Never commit your `.env.local` file to git!

### 3. Restart Your Development Server

```bash
npm run dev
```

## Free Tier Limits

Gemini 1.5 Flash is completely free with these generous limits:

- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per day**

This is more than enough for personal use!

## Features Breakdown

### 1. Retrospective Summary

**Location**: Individual retrospective view

**What it does**:
- Analyzes your Keeps, Problems, and Tries
- Generates a concise 2-3 sentence summary
- Identifies 3-5 key insights
- Determines overall sentiment (positive/neutral/negative/mixed)

**How to use**:
1. Open any completed retrospective
2. Find the "AI Assistant" card
3. Click "Summary"

### 2. Smart Suggestions

**Location**: Individual retrospective view

**What it does**:
- Analyzes your Problems and successes (Keeps)
- Generates 3-5 actionable "Try" suggestions
- Provides reasoning for each suggestion
- Helps you think of new approaches

**How to use**:
1. Open any retrospective
2. Find the "AI Assistant" card
3. Click "Suggestions"

### 3. Pattern Analysis

**Location**: Dashboard (shows when you have 2+ retrospectives)

**What it does**:
- Identifies recurring themes across your retrospectives
- Detects trends (improving/declining/stable)
- Provides personalized recommendations for growth
- Analyzes Keeps, Problems, and Tries separately

**How to use**:
1. Go to Dashboard
2. Find the "AI Insights" card
3. Select "Patterns" tab
4. Click "Analyze"

**Requirements**: At least 2 completed retrospectives

### 4. Sentiment & Well-being Analysis

**Location**: Dashboard

**What it does**:
- Analyzes emotional tone across retrospectives
- Calculates a well-being score (0-100)
- Identifies sentiment trends over time
- Provides insights about emotional patterns

**How to use**:
1. Go to Dashboard
2. Find the "AI Insights" card
3. Select "Well-being" tab
4. Click "Analyze"

**Requirements**: At least 2 completed retrospectives

## API Endpoints

If you want to integrate these features elsewhere:

### POST `/api/ai/summarize`
```json
{
  "retrospectiveId": "uuid",
  "userId": "uuid"
}
```

### POST `/api/ai/suggestions`
```json
{
  "retrospectiveId": "uuid",
  "userId": "uuid"
}
```

### POST `/api/ai/patterns`
```json
{
  "userId": "uuid",
  "limit": 10
}
```

### POST `/api/ai/sentiment`
```json
{
  "userId": "uuid",
  "limit": 10
}
```

## Privacy & Data

- All AI processing happens through Google's Gemini API
- Your retrospective data is sent to Gemini API for analysis
- No data is stored by Google (per Gemini API terms)
- Your API key is kept secret on the server side
- See [Google's Gemini API Terms](https://ai.google.dev/terms) for details

## Troubleshooting

### "Gemini API is not configured" Error

**Solution**: Make sure you added `GEMINI_API_KEY` to your `.env.local` file and restarted the dev server.

### "Need at least 2 retrospectives" Error

**Solution**: The pattern and sentiment analysis features require at least 2 completed retrospectives to work properly.

### Rate Limit Errors

**Solution**: If you hit the rate limit (15 requests/minute or 1,500/day), wait a bit before trying again. For personal use, this should rarely happen.

### API Key Not Working

**Solution**:
1. Verify your API key is correct in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Try generating a new API key from Google AI Studio

## Cost

All features use the **Gemini 1.5 Flash** model which is:
- ✅ **100% FREE**
- ✅ No credit card required
- ✅ Generous rate limits
- ✅ Fast response times

Perfect for personal use!

## Roadmap

Future AI features planned:
- Action item priority suggestions
- Time estimation for actions
- Personalized reminder timing
- Voice-to-text for retrospectives
- Automated progress reports

---

**Note**: These are Phase 2 features in the product roadmap. In the future, some advanced AI features may become premium features to support development costs.
