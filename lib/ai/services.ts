import { getGeminiModel, RetrospectiveSummary, AISuggestion, PatternAnalysis } from './gemini'

// Summarize keeps and problems with actionable insights
export async function summarizeKeepsAndProblems(
  keeps: string[],
  problems: string[]
): Promise<{
  summary: string
  keyInsight: string
  suggestions: string[]
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
}> {
  const model = getGeminiModel()

  const prompt = `Analyze this weekly reflection and provide simple, clear feedback.

WHAT WENT WELL:
${keeps.length > 0 ? keeps.map((k, i) => `${i + 1}. ${k}`).join('\n') : 'None'}

CHALLENGES:
${problems.length > 0 ? problems.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'None'}

Give me:

1. SUMMARY (1-2 sentences): What's the overall picture? Be direct and clear.

2. KEY INSIGHT (1 sentence): The most important thing to focus on based on what you see.

3. SUGGESTED APPROACHES (2-3 specific things to try):
   - Must be concrete and actionable
   - Should address the challenges or build on wins
   - Keep it simple - one clear action per suggestion

Return ONLY this JSON format:
{
  "summary": "Clear 1-2 sentence overview",
  "keyInsight": "The one most important thing",
  "suggestions": ["Try this specific thing", "Try this other thing"],
  "overallSentiment": "positive|mixed|negative|neutral"
}`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  // Clean up markdown code blocks if present
  let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  // Parse JSON from response
  try {
    const parsed = JSON.parse(cleanedText)
    return {
      summary: parsed.summary || '',
      keyInsight: parsed.keyInsight || '',
      suggestions: parsed.suggestions || [],
      overallSentiment: parsed.overallSentiment || 'neutral'
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    console.log('Raw response:', text)

    // Simple fallback
    const hasMoreKeeps = keeps.length > problems.length
    return {
      summary: hasMoreKeeps
        ? `Good progress with ${keeps.length} wins and ${problems.length} challenges.`
        : `Focus needed: ${problems.length} challenges vs ${keeps.length} wins.`,
      keyInsight: problems.length > 0
        ? `Priority: ${problems[0]}`
        : `Keep building on current momentum`,
      suggestions: problems.slice(0, 2).map(p => `Address: ${p}`),
      overallSentiment: hasMoreKeeps ? 'positive' : 'mixed'
    }
  }
}

// Generate actionable items from a Try with deadline suggestions
export async function generateActionsFromTry(
  tryText: string,
  relatedProblems: string[]
): Promise<{
  text: string
  suggestedDeadlineDays: number // Number of days from now
  reasoning: string
}[]> {
  const model = getGeminiModel()

  const prompt = `You are a professional productivity coach specializing in breaking down goals into concrete, achievable actions.

CONTEXT:
A professional wants to try this new approach:
"${tryText}"

This is addressing these challenges:
${relatedProblems.length > 0 ? relatedProblems.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'General improvement'}

YOUR TASK:
Generate 2-3 specific, executable action items using the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound).

REQUIREMENTS for each action:
1. **Start with an action verb** (Schedule, Create, Review, Complete, Send, etc.)
2. **Be specific** - include what, where, when details
3. **Be measurable** - include concrete deliverables or outcomes
4. **Be realistic** - can be completed within the timeframe
5. **Directly support** the Try approach

For deadline suggestions:
- Quick wins or habit starters: 1-3 days
- Small projects or first steps: 3-7 days
- Moderate initiatives: 7-14 days
- Larger efforts: 14-30 days

Return ONLY valid JSON array:
[
  {
    "text": "Action starting with verb, with specific details",
    "suggestedDeadlineDays": number,
    "reasoning": "Brief explanation of impact"
  }
]`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  // Clean up markdown code blocks
  let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  // Parse JSON from response
  try {
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('Failed to parse action generation response:', error)
    console.log('Raw response:', text)

    // Enhanced fallback
    return [{
      text: `Implement: ${tryText}`,
      suggestedDeadlineDays: 7,
      reasoning: "Start putting your approach into practice"
    }]
  }
}

// Summarize a single retrospective
export async function summarizeRetrospective(
  keeps: string[],
  problems: string[],
  tries: string[]
): Promise<RetrospectiveSummary> {
  const model = getGeminiModel()

  const prompt = `
You are an AI coach helping users reflect on their personal growth through retrospectives.

Analyze this retrospective session:

KEEPS (What went well):
${keeps.map((k, i) => `${i + 1}. ${k}`).join('\n')}

PROBLEMS (Challenges faced):
${problems.map((p, i) => `${i + 1}. ${p}`).join('\n')}

TRIES (New approaches):
${tries.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Please provide:
1. A brief summary (2-3 sentences) of this retrospective
2. 3-5 key insights or patterns you notice
3. Overall sentiment (positive/neutral/negative/mixed)

Format your response as JSON:
{
  "summary": "...",
  "keyInsights": ["insight1", "insight2", ...],
  "sentiment": "positive|neutral|negative|mixed"
}
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  // Fallback if JSON parsing fails
  return {
    summary: text,
    keyInsights: [],
    sentiment: 'neutral'
  }
}

// Generate AI suggestions based on problems
export async function generateSuggestions(
  problems: { id: string; text: string }[],
  keeps: { id: string; text: string }[]
): Promise<AISuggestion[]> {
  const model = getGeminiModel()

  const prompt = `
You are an AI coach helping users turn challenges into actionable improvements.

Based on these problems:
${problems.map((p, i) => `${i + 1}. ${p.text}`).join('\n')}

And these successes:
${keeps.map((k, i) => `${i + 1}. ${k.text}`).join('\n')}

Generate 3-5 actionable "Try" suggestions that:
- Address the problems mentioned
- Build on the successes
- Are specific and concrete
- Can be realistically implemented

For each suggestion, provide:
1. The "Try" text (a new approach or experiment)
2. Brief reasoning (why this might help)

Format your response as JSON array:
[
  {
    "type": "try",
    "text": "suggestion text",
    "reasoning": "why this helps"
  }
]
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Parse JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  return []
}

// Analyze patterns across multiple retrospectives
export async function analyzePatterns(
  retrospectives: Array<{
    id: string
    title: string | null
    created_at: string
    keeps: string[]
    problems: string[]
    tries: string[]
  }>
): Promise<PatternAnalysis> {
  const model = getGeminiModel()

  const prompt = `
You are an AI coach analyzing personal growth patterns over time.

Here are ${retrospectives.length} retrospectives in chronological order:

${retrospectives.map((retro, i) => `
Retrospective ${i + 1} (${new Date(retro.created_at).toLocaleDateString()}):
Keeps: ${retro.keeps.join('; ')}
Problems: ${retro.problems.join('; ')}
Tries: ${retro.tries.join('; ')}
`).join('\n')}

Analyze these retrospectives and provide:

1. RECURRING THEMES: Identify 3-5 themes that appear multiple times
   - Theme name
   - How many times it appears (frequency)
   - Category (keep/problem/try)
   - Examples from the data

2. TRENDS: Identify 2-4 trends over time
   - What's improving, declining, or staying stable
   - Brief description

3. RECOMMENDATIONS: 3-5 personalized recommendations for continued growth

Format your response as JSON:
{
  "recurringThemes": [
    {
      "theme": "theme name",
      "frequency": number,
      "category": "keep|problem|try",
      "examples": ["example1", "example2"]
    }
  ],
  "trends": [
    {
      "description": "trend description",
      "direction": "improving|declining|stable"
    }
  ],
  "recommendations": ["rec1", "rec2", ...]
}
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  // Fallback
  return {
    recurringThemes: [],
    trends: [],
    recommendations: []
  }
}

// Generate sentiment analysis for well-being insights
export async function analyzeSentiment(
  retrospectives: Array<{
    created_at: string
    keeps: string[]
    problems: string[]
  }>
): Promise<{
  overallSentiment: string
  sentimentTrend: 'improving' | 'stable' | 'declining'
  wellbeingScore: number // 0-100
  insights: string[]
}> {
  const model = getGeminiModel()

  const prompt = `
Analyze the emotional tone and well-being across these retrospectives:

${retrospectives.map((retro, i) => `
Session ${i + 1} (${new Date(retro.created_at).toLocaleDateString()}):
Positives: ${retro.keeps.join('; ')}
Challenges: ${retro.problems.join('; ')}
`).join('\n')}

Provide:
1. Overall sentiment description
2. Sentiment trend (improving/stable/declining)
3. Well-being score (0-100, where 100 is excellent)
4. 2-3 insights about emotional patterns

Format as JSON:
{
  "overallSentiment": "description",
  "sentimentTrend": "improving|stable|declining",
  "wellbeingScore": number,
  "insights": ["insight1", "insight2"]
}
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  return {
    overallSentiment: 'Unable to analyze',
    sentimentTrend: 'stable',
    wellbeingScore: 50,
    insights: []
  }
}
