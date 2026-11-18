import { DashboardStats } from '../types';

export interface CoachContext {
  stats: DashboardStats;
  weakTopics: string[];
  activePlan?: {
    weekNumber: number;
    quantPlan: string;
    dilrPlan: string;
    varcPlan: string;
    hoursTarget: string;
  };
}

export interface CoachResponse {
  text: string;
  actionProposal?: {
    type: 'add_task' | 'revisit_mistake';
    title: string;
    details: string;
  };
}

/**
 * Intelligent CAT 2027 In-Browser Pedagogical Brain
 * Provides authentic, topic-specific concept explanations, CAT shortcuts,
 * heuristic strategies, and live context-aware study plans.
 */

export function generateCoachResponse(query: string, context: CoachContext): CoachResponse {
  const lower = query.toLowerCase().trim();
  const { stats, weakTopics, activePlan } = context;

  // -------------------------------------------------------------------------
  // 1. QUANTITATIVE APTITUDE: CONCEPTS, SHORTCUTS & FORMULAS
  // -------------------------------------------------------------------------

  // A. Number Systems & Remainders
  if (lower.includes('remainder') || lower.includes('euler') || lower.includes('wilson') || lower.includes('cyclicity') || lower.includes('unit digit') || lower.includes('totient') || lower.includes('factor')) {
    return {
      text: `### 🔢 Master Concept: Remainders & Number Theory

Here are the high-yield theorems tested every year in CAT Quant:

1. **Euler's Totient Theorem:**
   - If $\\gcd(a, n) = 1$, then:
     $$a^{\\phi(n)} \\equiv 1 \\pmod n$$
   - For a prime $p$, $\\phi(p) = p - 1$.
   - For $n = p_1^{a} p_2^{b}$, $\\phi(n) = n \\left(1 - \\frac{1}{p_1}\\right)\\left(1 - \\frac{1}{p_2}\\right)$.
   - *Example:* Find remainder of $3^{100} \\div 7$. Since $\\phi(7) = 6$, $3^6 \\equiv 1 \\pmod 7$. $100 = 6 \\times 16 + 4$. Remainder is $3^4 \\pmod 7 = 81 \\pmod 7 = 4$.

2. **Wilson's Theorem:**
   - For any prime $p$:
     $$(p - 1)! \\equiv -1 \\pmod p \\quad \\text{and} \\quad (p - 2)! \\equiv 1 \\pmod p$$

3. **Cyclicity for Unit Digits:**
   - Powers of numbers repeat in cycles of at most 4 (e.g., $2^1=2, 2^2=4, 2^3=8, 2^4=6, 2^5=2$).
   - Divide power by 4 and use the remainder as the effective power.

4. **Highest Power of Prime $p$ in $n!$ (Legendre's Formula):**
   $$E_p(n!) = \\left\\lfloor \\frac{n}{p} \\right\\rfloor + \\left\\lfloor \\frac{n}{p^2} \\right\\rfloor + \\left\\lfloor \\frac{n}{p^3} \\right\\rfloor + \\dots$$

*Coach Recommendation:* Never calculate large powers directly in CAT. Always find the base's cyclicity or use Euler's Totient to reduce the exponent.`,
      actionProposal: {
        type: 'add_task',
        title: 'Solve 15 Remainder & Number Theory Questions',
        details: 'Apply Euler Totient and Cyclicity rules on CAT PYQ sets.'
      }
    };
  }

  // B. Time, Speed & Distance
  if (lower.includes('speed') || lower.includes('distance') || lower.includes('tsd') || lower.includes('train') || lower.includes('escalator') || lower.includes('race') || lower.includes('boat')) {
    return {
      text: `### ⏱️ Time, Speed & Distance (TSD) Core Frameworks

TSD is one of the highest weighted topics in CAT Arithmetic. Master these core models:

1. **Proportionality Laws:**
   - When **Distance is Constant**: Speed is inversely proportional to Time ($S_1 T_1 = S_2 T_2$).
   - When **Time is Constant**: Distance is directly proportional to Speed ($D_1 / D_2 = S_1 / S_2$).

2. **Average Speed:**
   - $\\text{Average Speed} = \\frac{\\text{Total Distance}}{\\text{Total Time}}$.
   - If equal distances are traveled at speeds $u$ and $v$, $\\text{Avg Speed} = \\frac{2uv}{u + v}$ (Harmonic Mean).

3. **Relative Speed:**
   - Same direction: Relative speed $= |S_1 - S_2|$.
   - Opposite direction: Relative speed $= S_1 + S_2$.

4. **Escalators Problem Model:**
   - Total Steps $N = (S_{\\text{person}} \\pm S_{\\text{escalator}}) \\times \\text{Time}$.
   - Positive when moving in direction of escalator; negative when moving against.

5. **Linear & Circular Races:**
   - First meeting point on circular track of length $L$:
     - Opposite direction: $\\text{Time} = \\frac{L}{S_1 + S_2}$
     - Same direction: $\\text{Time} = \\frac{L}{|S_1 - S_2|}$
   - Number of distinct meeting points $= |a - b|$ (same dir) or $a + b$ (opposite dir), where $a:b$ is reduced ratio of speeds.`,
      actionProposal: {
        type: 'add_task',
        title: 'TSD Practice: Relative Speed & Escalators',
        details: 'Solve 10 CAT PYQs focusing on ratio of speeds and escalator equations.'
      }
    };
  }

  // C. Arithmetic: Percentages, Profit & Loss, Mixtures
  if (lower.includes('percent') || lower.includes('profit') || lower.includes('loss') || lower.includes('discount') || lower.includes('mixture') || lower.includes('alligation') || lower.includes('ratio')) {
    return {
      text: `### 📊 Arithmetic Fundamentals: Percentages, P&L & Alligations

Arithmetic constitutes **35–40%** of all Quant questions in CAT. Speed comes from multiplier thinking:

1. **Decimal Multipliers:**
   - $20\\% \\text{ increase} = \\times 1.2$
   - $16.66\\% \\text{ increase} = \\times 7/6$
   - $14.28\\% \\text{ decrease} = \\times 6/7$
   - Memorize fractional values up to $1/20$ to save 30–45 seconds per calculation.

2. **Successive Percentage Change:**
   - Net change for consecutive changes of $a\\%$ and $b\\%$:
     $$\\text{Net} = a + b + \\frac{ab}{100}$$

3. **Repeated Replacement (Mixtures):**
   - If a vessel contains $V$ units of pure liquid and $x$ units are withdrawn and replaced with water $n$ times:
     $$\\frac{\\text{Final Quantity of Liquid}}{\\text{Initial Quantity}} = \\left(1 - \\frac{x}{V}\\right)^n$$

4. **Rule of Alligation:**
   $$\\frac{Q_1}{Q_2} = \\frac{C_2 - C_{\\text{mean}}}{C_{\\text{mean}} - C_1}$$
   - Apply whenever two groups of known concentration/price are blended into an aggregate mixture.`,
      actionProposal: {
        type: 'add_task',
        title: 'Master Mixture Alligations & Multipliers',
        details: 'Practice replacement formula and successive percentages drill.'
      }
    };
  }

  // D. Algebra: Quadratics, Inequalities, Modulus & Logarithms
  if (lower.includes('algebra') || lower.includes('quadratic') || lower.includes('inequalit') || lower.includes('modulus') || lower.includes('log') || lower.includes('function') || lower.includes('maxima') || lower.includes('minima')) {
    return {
      text: `### 📈 Algebra Mastery: Quadratics, Functions & Inequalities

Algebra is the second pillar of CAT Quant (typically 7–9 questions out of 22):

1. **Quadratic Equations ($ax^2 + bx + c = 0$):**
   - Sum of roots: $\\alpha + \\beta = -b/a$
   - Product of roots: $\\alpha \\beta = c/a$
   - Extreme value of $y = ax^2 + bx + c$:
     - If $a > 0$, Minimum occurs at $x = -b/(2a)$, $\\text{Min} = -D/(4a)$
     - If $a < 0$, Maximum occurs at $x = -b/(2a)$, $\\text{Max} = -D/(4a)$

2. **AM-GM Inequality (Crucial for Maxima/Minima):**
   - For positive real numbers:
     $$\\frac{a + b}{2} \\ge \\sqrt{ab}$$
   - Equality holds if and only if $a = b$.
   - *Application:* If product is constant ($xy = k$), sum $x+y$ is minimized when $x = y$. If sum is constant, product is maximized when $x = y$.

3. **Modulus & Wavy Curve Method:**
   - $|x - a| + |x - b|$ has a constant minimum value of $|b - a|$ for all $x \\in [a, b]$.
   - Critical point method: Plot roots on real line and alternate signs from top-right $(+, -, +, -)$ for inequalities.

4. **Logarithms Essentials:**
   - $\\log_b a = \\frac{\\log_k a}{\\log_k b}$ (Change of base)
   - $a^{\\log_b c} = c^{\\log_b a}$
   - Domain check: In $\\log_b a$, $a > 0$, $b > 0$, and $b \\neq 1$.`,
      actionProposal: {
        type: 'add_task',
        title: 'Solve 10 Algebra & AM-GM Optimization Problems',
        details: 'Review quadratic vertex properties and modulus inequalities.'
      }
    };
  }

  // E. Geometry & Modern Math
  if (lower.includes('geometry') || lower.includes('triangle') || lower.includes('circle') || lower.includes('pnc') || lower.includes('permutation') || lower.includes('probability')) {
    return {
      text: `### 📐 Geometry & Modern Math Key Concepts

1. **Triangles:**
   - **Apollonius Theorem:** For median $AD$ to side $BC$:
     $$AB^2 + AC^2 = 2(AD^2 + BD^2)$$
   - **Area Formulas:** $\\Delta = \\frac{1}{2}ab \\sin C = \\sqrt{s(s-a)(s-b)(s-c)} = rs = \\frac{abc}{4R}$
   - Ratio of areas of similar triangles equals the square of the ratio of their corresponding linear dimensions.

2. **Circles & Tangents:**
   - **Tangent-Secant Theorem:** If secant $PAB$ and tangent $PT$ meet at external point $P$:
     $$PT^2 = PA \\times PB$$
   - Angle in an alternate segment is equal to the angle subtended by the chord in the opposite segment.

3. **Permutations & Combinations (PnC):**
   - Arranging $n$ objects with repetitions: $\\frac{n!}{p! q! r!}$
   - Circular arrangement of $n$ distinct people: $(n - 1)!$
   - Number of non-negative integer solutions to $x_1 + x_2 + \\dots + x_r = n$:
     $$\\binom{n + r - 1}{r - 1}$$`,
      actionProposal: {
        type: 'add_task',
        title: 'Geometry & PnC Practice Session',
        details: 'Solve 10 Geometry circles and combination distribution problems.'
      }
    };
  }

  // -------------------------------------------------------------------------
  // 2. DILR LOGIC, ARRANGEMENTS & SET SELECTION
  // -------------------------------------------------------------------------

  if (lower.includes('dilr') || lower.includes('arrangement') || lower.includes('puzzle') || lower.includes('matrix') || lower.includes('tournament') || lower.includes('venn') || lower.includes('caselet')) {
    return {
      text: `### 🧩 DILR Frameworks: How to Crack CAT Sets

In DILR, cracking **2 complete sets with 100% accuracy** (8 questions = 24 marks) consistently secures a **98+ percentile**.

1. **The 8-Minute Golden Selection Rule:**
   - Never start solving the first set you see.
   - Spend the initial **5 to 8 minutes scanning all 4 sets**.
   - Classify sets into:
     - 🟢 **Rank 1 (Structured):** Fixed variables, tables, clear numerical bounds.
     - 🟡 **Rank 2 (Deductive):** Grid distribution, seating with definite clues.
     - 🔴 **Rank 3 (Ambiguous):** Missing data DI, branching cases with multiple scenarios.

2. **Arrangements & Seating Heuristics:**
   - **Anchor Principle:** Place the person or element with the highest number of connective constraints first.
   - **Linear with Two Rows:** Explicitly note facing directions (North = Left is Left; South = Left is Right).
   - **Circular Facing In/Out:** Fix the first person facing Inside to establish reference frame.

3. **Tournaments & Round-Robin:**
   - Total matches among $N$ teams $= \\frac{N(N - 1)}{2}$.
   - In a 3-1-0 points system, total points in a decisive match $= 3$; in a draw $= 2$.
   - Track minimum points needed to guarantee qualification:
     $$\\text{Threshold} = \\frac{\\text{Total available points of remaining contenders}}{\\text{Slots}} + 1$$

4. **Venn Diagrams (3 & 4 Sets):**
   - Define regions systematically: Exactly 1, Exactly 2, Exactly 3.
   - Remember: $\\sum n(A) = \\text{Exactly } 1 + 2(\\text{Exactly } 2) + 3(\\text{Exactly } 3)$.`,
      actionProposal: {
        type: 'add_task',
        title: 'Timed DILR Sprint: 2 Full Caselets in 30 Mins',
        details: 'Execute 8-minute set selection rule before starting pencil work.'
      }
    };
  }

  // -------------------------------------------------------------------------
  // 3. VARC: READING COMPREHENSION, TONE, PARAJUMBLES & AEON
  // -------------------------------------------------------------------------

  if (lower.includes('varc') || lower.includes('reading') || lower.includes('rc') || lower.includes('tone') || lower.includes('summary') || lower.includes('jumble') || lower.includes('aeon') || lower.includes('passage')) {
    return {
      text: `### 📖 VARC Excellence: RC Decoding & Verbal Heuristics

VARC is 70% Reading Comprehension (4 passages, 16 questions) and 30% Verbal Ability (8 questions).

1. **The 3-Pass RC Reading Method:**
   - **Pass 1 (Macro Thesis):** Read at 250 wpm to identify **Why did the author write this?** Mentally formulate a 1-sentence summary of each paragraph.
   - **Pass 2 (Question Stem Inspection):** Read the question stem carefully. Is it an *Inference* (must be true based on text), *Tone* (author's emotional stance), or *Primary Purpose* (overall thesis)?
   - **Pass 3 (Option Elimination):** Look for wrong options first using the 4 red flags:
     - ❌ **Extreme Words:** "Always", "never", "only", "must", "entirely".
     - ❌ **Out of Scope:** Plausible real-world claim, but NOT stated in the passage.
     - ❌ **Distorted Relationship:** Inverts cause and effect.
     - ❌ **Half-True Trap:** First half is accurate, second half sneaks in an unfounded premise.

2. **Tone Spectrum Decoder:**
   - **Skeptical:** Demands rigorous evidence before accepting a claim.
   - **Cynical:** Believes people/institutions act solely out of selfish motives.
   - **Pragmatic:** Focused on practical solutions rather than abstract ideology.
   - **Acerbic / Sardonic:** Biting, sharp, sarcastic criticism.

3. **Para Jumbles (TITA) Heuristics:**
   - Find the **Introductory Sentence**: General noun introduction with zero unresolved pronouns.
   - Seek **Mandatory Pairs**: Look for demonstrative pronouns ("This approach", "Such algorithms" referring to previous mention).
   - Trace chronological and causal transitions ("Consequently", "However", "In contrast").

4. **Daily Aeon Reading Habit:**
   - Read 1 dense Aeon essay daily (2,500–4,000 words).
   - Focus on Philosophy, Cognitive Science, and Evolutionary Anthropology—the most frequent CAT genres.`,
      actionProposal: {
        type: 'add_task',
        title: 'Daily VARC Drill: 1 RC Passage + 1 Aeon Essay',
        details: 'Apply 3-pass reading method and extreme-word option elimination.'
      }
    };
  }

  // -------------------------------------------------------------------------
  // 4. MOCKS, CUTOFFS, PERCENTILE MAPPING & EXAM STRATEGY
  // -------------------------------------------------------------------------

  if (lower.includes('mock') || lower.includes('score') || lower.includes('percentile') || lower.includes('cutoff') || lower.includes('strategy') || lower.includes('iim') || lower.includes('marks')) {
    return {
      text: `### 🎯 CAT Score vs Percentile & Test-Taking Strategy

Understanding the scoring matrix prevents panic and helps set realistic sectional targets:

| Target Percentile | Overall Raw Score (out of 198) | VARC (out of 66) | DILR (out of 60) | QA (out of 66) |
|:---:|:---:|:---:|:---:|:---:|
| **99.5%ile** | **~85 – 90** | ~38 – 42 | ~28 – 30 | ~32 – 36 |
| **99.0%ile** | **~75 – 80** | ~33 – 36 | ~24 – 26 | ~27 – 30 |
| **95.0%ile** | **~55 – 60** | ~25 – 28 | ~16 – 18 | ~18 – 20 |
| **90.0%ile** | **~45 – 50** | ~20 – 22 | ~12 – 14 | ~14 – 16 |

*Key Insight:* To score **99th percentile**, you only need about **50% of total marks**! You do not need to attempt every question.

### The 3-Round Attempt Strategy (Per 40-Min Section):
1. **Round 1 (Minutes 0 – 15): The Low-Hanging Fruits**
   - Attempt only direct, calculation-light questions you can solve in under 90 seconds.
   - Mark medium questions for review; skip complex ones instantly.
2. **Round 2 (Minutes 15 – 32): The Solvable Core**
   - Solve the marked medium problems. Maintain composure and show working steps cleanly.
3. **Round 3 (Minutes 32 – 40): Sanity Check & Review**
   - Re-check answers to eliminate silly calculation errors or wrong option clicking. Never make blind guesses due to $-1$ negative marking!`,
      actionProposal: {
        type: 'add_task',
        title: 'Mock Analysis & Error Log Audit',
        details: 'Review root-causes of lost marks in last mock test.'
      }
    };
  }

  // -------------------------------------------------------------------------
  // 5. DAILY ROUTINE, WORKING PROFESSIONAL & STUDY HABITS
  // -------------------------------------------------------------------------

  if (lower.includes('routine') || lower.includes('working') || lower.includes('job') || lower.includes('time management') || lower.includes('hours') || lower.includes('college')) {
    return {
      text: `### ⏰ Optimal Daily Study Blueprint

Consistency beats intensity. The key is distributing preparation across manageable slots rather than marathon cramming.

1. **For Working Professionals (3.5 – 4 Hours/Day):**
   - **Morning Slot (6:30 AM – 8:00 AM, 90 mins):** High-cognitive load Quant or DILR before workplace fatigue sets in.
   - **Lunch / Commute (30 mins):** Read 1 Aeon Essay on phone + 10 vocabulary flashcards.
   - **Evening Slot (9:00 PM – 10:30 PM, 90 mins):** 1 RC set + review Mistake Log + 15 mins daily routine log.
   - **Weekend Sprint (Saturday & Sunday):** 6 hours each day for full mock exam and 3-hour deep diagnostic analysis.

2. **For Full-Time Students (5 – 6 Hours/Day):**
   - **Session 1 (Morning, 2 hrs):** Quant concept theory + 25 drill questions.
   - **Session 2 (Afternoon, 1.5 hrs):** 2 DILR caselets + analysis.
   - **Session 3 (Evening, 1.5 hrs):** 2 RC passages + Para Summary practice.
   - **Session 4 (Night, 45 mins):** Re-solving questions from the Spaced Repetition Mistake Queue.

3. **The Weekly Buffer Principle:**
   - Reserve Sunday afternoon as a **Buffer Slot** to catch up on any scheduled goals that spilled over during the week.`,
      actionProposal: {
        type: 'add_task',
        title: 'Establish 4-Block Daily Study Routine',
        details: 'Dedicate fixed morning Quant slot and evening review slot.'
      }
    };
  }

  // -------------------------------------------------------------------------
  // 6. LIVE CONTEXT / PROGRESS AUDIT (When explicitly asked)
  // -------------------------------------------------------------------------

  if (lower.includes('my progress') || lower.includes('my stats') || lower.includes('how am i doing') || lower.includes('what to study') || lower.includes('plan my week') || lower.includes('weak topics')) {
    const weakList = weakTopics.length > 0
      ? weakTopics.slice(0, 4).map((t, i) => `${i + 1}. **${t}**`).join('\n')
      : '✅ *All active topics currently rated at confidence > 2.*';

    return {
      text: `### 📊 Live Diagnostic Briefing for CAT 2027

Here is your real-time preparation standing:

- **Syllabus Completion:** **${stats.overallCompletionPct}%** of total curriculum
- **Current Stage:** Phase ${stats.currentPhase.phaseNumber} (${stats.currentPhase.name}) • Week ${stats.currentWeek} of 52
- **Countdown:** **${stats.daysRemaining} days** remaining until CAT 2027
- **Active Weekly Targets (Week ${stats.currentWeek}):**
  - **Quant:** ${activePlan?.quantPlan || 'Foundations & Arithmetic'}
  - **DILR:** ${activePlan?.dilrPlan || 'Caselet structures'}
  - **VARC:** ${activePlan?.varcPlan || 'Daily reading & inference drills'}
  - **Weekly Target Hours:** ${activePlan?.hoursTarget || '12–15 hours'}

### Identified Focus Areas:
${weakList}

- **Spaced Repetition Queue:** **${stats.pendingMistakesCount} errors** pending revisit (**${stats.overdueMistakesCount} overdue**).

**Coach Advice:** Dedicate the first 45 minutes of your next session to re-solving your overdue mistakes before starting new syllabus items.`,
      actionProposal: {
        type: 'add_task',
        title: `Week ${stats.currentWeek} Core Syllabus Sprint`,
        details: `Practice ${activePlan?.quantPlan?.slice(0, 35) || 'Quant'} and clear pending mistake queue.`
      }
    };
  }

  // -------------------------------------------------------------------------
  // 7. GREETINGS & CONVERSATIONAL
  // -------------------------------------------------------------------------

  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.includes('who are you') || lower.includes('help')) {
    return {
      text: `Hello! I am your **AI Study Coach** for CAT 2027.

I can guide you through every phase of your preparation. Here are some of the things you can ask me:

- 🔢 **Quant Concepts:** Ask me to explain *Euler's Totient*, *TSD Escalators*, *AM-GM Inequality*, *Apollonius Theorem*, or *Quadratic roots*.
- 🧩 **DILR Strategy:** Ask how to crack *Tournaments*, *Linear/Circular Arrangements*, *Venn Diagrams*, or how to apply the *8-minute set selection rule*.
- 📖 **VARC Techniques:** Ask how to detect *Author's Tone*, eliminate *extreme options in RC*, solve *Para Jumbles*, or build an *Aeon reading habit*.
- 🎯 **Exam Strategy:** Ask about *Score vs Percentile targets (99%ile)*, *3-round test taking technique*, or *mock test post-mortem analysis*.
- 📊 **Your Preparation:** Ask *"What are my weak areas?"* or *"Plan my study routine for today"*.

What topic or question would you like to explore?`
    };
  }

  // -------------------------------------------------------------------------
  // 8. DYNAMIC GENERAL INSTRUCTIONAL RESPONSE (Never repetitive stats!)
  // -------------------------------------------------------------------------

  return {
    text: `### 💡 Strategic Insight on "${query.length > 50 ? query.slice(0, 50) + '...' : query}"

In CAT preparation, every topic connects back to three core principles: **Conceptual Clarity**, **Speed of Identification**, and **Error Elimination**.

Here is how you should approach this:

1. **Deconstruct to First Principles:**
   - Before attempting speed drills, ensure you can derive the core formulas or understand the underlying logic from scratch without memorizing isolated tricks.
   - For word problems or caselets, translate textual conditions into an unambiguous mathematical or visual matrix immediately.

2. **The 3-Tier Drill Approach:**
   - Solve 15 foundational questions untimed to internalize the pattern.
   - Progress to 10 moderate questions timed at ~2 minutes each.
   - Finish with 5 authentic CAT Past Year Questions (2017–2024) under strict exam pressure.

3. **Root-Cause Error Capture:**
   - Whenever an attempt fails, log it immediately in your **Mistake Log**. Classify whether it was a *Concept Gap*, *Calculation Slip*, or *Question Misread*.
   - Our spaced repetition scheduler will automatically queue it for re-solving in 7 days to seal the gap.

Would you like me to generate a dedicated practice set on this topic, explain a specific sub-formula, or outline a 45-minute study sprint?`,
    actionProposal: {
      type: 'add_task',
      title: `Practice drill: ${query.slice(0, 30)}`,
      details: 'Solve 10 practice questions and log any incorrect answers.'
    }
  };
}
