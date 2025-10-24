import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!apiKey) {
  console.warn('Gemini API key not found. AI features will be disabled.')
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Get the Gemini model (using gemini-2.0-flash which is free and fast)
export function getGeminiModel() {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please add GEMINI_API_KEY to your environment variables.')
  }
  // Use gemini-2.0-flash - free, fast, and widely available
  // Note: Model name must include "models/" prefix
  return genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })
}

// Type definitions for AI responses
export type RetrospectiveSummary = {
  summary: string
  keyInsights: string[]
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
}

export type AISuggestion = {
  type: 'try' | 'action'
  text: string
  reasoning: string
  relatedTo?: string // Problem ID or Keep ID
}

export type PatternAnalysis = {
  recurringThemes: {
    theme: string
    frequency: number
    category: 'keep' | 'problem' | 'try'
    examples: string[]
  }[]
  trends: {
    description: string
    direction: 'improving' | 'declining' | 'stable'
  }[]
  recommendations: string[]
}
