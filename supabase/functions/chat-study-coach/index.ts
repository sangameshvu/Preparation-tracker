// =====================================================================
// CAT 2027 HQ: AI Study Coach Supabase Edge Function
// Location: supabase/functions/chat-study-coach/index.ts
// Runtime: Deno / Supabase Edge Functions
// =====================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequestBody {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    stats?: {
      overallCompletionPct?: number;
      currentWeek?: number;
      daysRemaining?: number;
      completedTopics?: number;
      weakTopicsCount?: number;
      totalMocksAttempted?: number;
      latestMockScore?: number | null;
      bestMockScore?: number | null;
      averageMockScore?: number | null;
      overdueMistakesCount?: number;
    };
    currentPhase?: {
      name?: string;
      phaseNumber?: number;
    };
    quantConfidence?: number;
    dilrConfidence?: number;
    varcConfidence?: number;
    weakestTopics?: string[];
    recentMistakesSummary?: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history = [], context = {} }: ChatRequestBody = await req.json();

    if (!message || message.trim() === '') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    let reply = '';
    let actionProposals: Array<{ type: string; title: string; payload: any }> = [];

    // System prompt synthesizing context and pedagogical strategy
    const systemPrompt = `You are the dedicated CAT 2027 AI Preparation Coach & Strategy Mentor for a serious CAT 2027 aspirant.
Your job is to provide sharp, empathetic, data-backed guidance, rigorous syllabus tracking, and strategic problem-solving advice.

Aspirant's Current Preparation Status:
- Week: ${context.stats?.currentWeek || 1} of 52 (Phase ${context.currentPhase?.phaseNumber || 1}: ${context.currentPhase?.name || 'Foundation'})
- Target Days Remaining: ${context.stats?.daysRemaining || 370}
- Overall Syllabus Completion: ${context.stats?.overallCompletionPct || 0}%
- Mastered Topics: ${context.stats?.completedTopics || 0} / 53
- Weak Topics Alert: ${context.stats?.weakTopicsCount || 0} topics flagged
- Mocks Attempted: ${context.stats?.totalMocksAttempted || 0} (Avg Score: ${context.stats?.averageMockScore ?? 'N/A'}, Best: ${context.stats?.bestMockScore ?? 'N/A'})
- Overdue Mistakes Queue: ${context.stats?.overdueMistakesCount || 0} items needing spaced revision
- Identified Weak Areas: ${(context.weakestTopics || []).join(', ') || 'None identified yet'}

Pedagogical Core Principles:
1. Ground advice strictly in the CAT 2027 blueprint:
   - 3 sections (VARC: 40 min, DILR: 40 min, QA: 40 min). Total: 120 min, 68 questions (+3/-1/0).
   - Target for 90%ile benchmark: VARC: 15-20, DILR: 10, QA: 5+.
   - Weekly distribution: Mon Arithmetic+DILR+RC, Tue Algebra+DILR+VA, Wed Arithmetic+DILR+RC, Thu Geometry+DILR+VA, Fri Number Systems+DILR+RC, Sat Mixed+Sectionals, Sun Mock+Analysis.
2. Emphasize active recall, error logging (7 mistake categories), and set selection over blind question volume.
3. Be direct, motivating, structured with markdown bullet points, and actionable.`;

    // 1. Try Gemini API if key is present
    if (geminiApiKey) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood. I am loaded with the aspirant's complete preparation metrics, syllabus roadmap, and CAT 2027 blueprint. Ready to mentor." }] },
          ...history.map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (err) {
        console.error('Gemini API call failed, falling back to rule-based engine:', err);
      }
    }

    // 2. Try OpenAI API if reply still empty and key is present
    if (!reply && openAiApiKey) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message },
        ];

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          reply = openAiData.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.error('OpenAI API call failed, falling back to rule-based engine:', err);
      }
    }

    // 3. Fallback: Intelligent Deterministic Coaching Engine
    if (!reply) {
      const lower = message.toLowerCase();
      const currentWeek = context.stats?.currentWeek || 1;
      const overdueMistakes = context.stats?.overdueMistakesCount || 0;
      const weakCount = context.stats?.weakTopicsCount || 0;

      if (lower.includes('schedule') || lower.includes('routine') || lower.includes('time')) {
        reply = `### Recommended Daily Blueprint for Week ${currentWeek}

Based on the official CAT blueprint and your current phase (**Phase ${context.currentPhase?.phaseNumber || 1}**):

1. **Morning Prime (60-90 mins):**
   - 2 Reading Comprehension passages (untimed, focusing on argument structure and tone).
   - 1 DILR puzzle set (spend 15 mins attempting before checking solutions).
2. **Evening Core (90-120 mins):**
   - Quant core topic focus for Week ${currentWeek}.
   - Work through 25-30 quality questions with active error logging.
3. **Night Review (20 mins):**
   - Review pending cards in your Mistake Log (${overdueMistakes} items currently due for spaced repetition).

*Tip:* Consistency beats marathon weekend sprints every single time.`;
      } else if (lower.includes('mock') || lower.includes('test') || lower.includes('percentile') || lower.includes('score')) {
        reply = `### Strategic Mock Philosophy for CAT 2027

Here is how you should calibrate your mock strategy:

- **Benchmark Targets for ~90%ile:**
  - **VARC:** 15–20 correct questions (Net Score: 40-50)
  - **DILR:** 10 correct questions / 2 complete sets (Net Score: 28-32)
  - **QA:** 5+ net correct questions (Net Score: 18-24)
- **The Golden Rule:** Spend at least **2x the test duration** analyzing each mock.
- **Immediate Action:** Categorize every missed question into one of the 7 workbook mistake types in your Mistake Log.`;
      } else if (lower.includes('weak') || lower.includes('struggl') || lower.includes('stuck')) {
        reply = `### Overcoming Weak Areas (Diagnostic Framework)

You currently have **${weakCount} topic(s)** marked at confidence level 1 or 2.

**Step-by-Step Remediation:**
1. **Deconstruct the Gap:** Is it a *Concept gap* (unfamiliar with formulas/properties) or a *Set selection* error?
2. **Untimed PYQ Practice:** Solve 15 past CAT questions without a timer to build mental representations.
3. **Spaced Re-solve:** Revisit logged mistakes 7 days after the first attempt.`;
      } else {
        reply = `### Strategy Check-in: Week ${currentWeek} / 52

Here is your current status overview:
- **Overall Syllabus Progress:** ${context.stats?.overallCompletionPct || 0}%
- **Mastered Topics:** ${context.stats?.completedTopics || 0} of 53
- **Pending Mistake Re-visits:** ${overdueMistakes} items

**Recommended Next Step:**
Focus on executing this week's plan cleanly. Keep your accuracy above 80% before speeding up, and log every non-trivial mistake into the Mistake Log.`;
      }

      actionProposals = [
        {
          type: 'NAVIGATE',
          title: 'Review Overdue Mistakes',
          payload: { path: '/mistakes' },
        },
        {
          type: 'NAVIGATE',
          title: 'Check Weekly Targets',
          payload: { path: '/planner' },
        },
      ];
    }

    return new Response(
      JSON.stringify({
        reply,
        actionProposals,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
