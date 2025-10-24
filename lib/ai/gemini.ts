import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!apiKey) {
  console.warn('Gemini API key not found. AI features will be disabled.')
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Get the Gemini model (using gemini-2.5-flash which is fast and cost-efficient)
export function getGeminiModel() {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please add GEMINI_API_KEY to your environment variables.')
  }
  // Use gemini-2.5-flash - best price-performance ratio for high-volume tasks
  // Alternative models: gemini-2.5-pro (more complex reasoning), gemini-2.5-flash-lite (faster/cheaper)
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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
    category: 'strength' | 'growth'
    examples: string[]
  }[]
  trends: {
    description: string
    direction: 'improving' | 'declining' | 'stable'
  }[]
  recommendations: string[]
}
