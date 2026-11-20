import { DashboardStats } from '../types';

export type AIMode = 'coach' | 'assistant';

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
  mode?: AIMode;
  catTuned?: boolean; // When false (default): Raw AI Chatbot (Gemini / Claude style). When true: CAT-specific assistant.
}

export interface CoachResponse {
  text: string;
  actionProposal?: {
    type: 'add_task' | 'revisit_mistake';
    title: string;
    details: string;
  };
}

// =========================================================================
// HIGH-YIELD VOCABULARY & LEXICON DATABASE (High-frequency CAT/GRE Words)
// =========================================================================

interface LexiconEntry {
  word: string;
  pos: string;
  pronunciation?: string;
  definition: string;
  etymology: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  rcNuance: string;
}

const vocabularyDictionary: Record<string, LexiconEntry> = {
  benevolent: {
    word: 'Benevolent',
    pos: 'Adjective',
    pronunciation: '/bəˈnev.əl.ənt/',
    definition: 'Characterized by goodwill, kindness, and a desire to promote the happiness or welfare of others rather than seeking personal gain.',
    etymology: 'From Latin "bene" (well, good) + "volent" / "volens" (wishing, willing). Literally: "wishing well to others".',
    synonyms: ['Altruistic', 'Philanthropic', 'Magnanimous', 'Charitable', 'Benign', 'Compassionate', 'Clement'],
    antonyms: ['Malevolent', 'Malicious', 'Spiteful', 'Vindictive', 'Callous', 'Rancorous'],
    examples: [
      'The foundation\'s benevolent patron funded full university scholarships for underprivileged rural students.',
      'A benevolent ruler balances compassionate governance with firm institutional discipline.'
    ],
    rcNuance: 'In CAT Reading Comprehension, distinguish between a sincere benevolent tone (approving, supportive) and "benevolent despotism" or paternalism (where an author critiques an authority acting kindly but stripping autonomy).'
  },
  malevolent: {
    word: 'Malevolent',
    pos: 'Adjective',
    pronunciation: '/məˈlev.əl.ənt/',
    definition: 'Having, showing, or arising from intense ill will, spite, or hatred; wishing evil to others.',
    etymology: 'From Latin "male" (badly, ill) + "volens" (wishing). Opposite of benevolent.',
    synonyms: ['Malicious', 'Spiteful', 'Hostile', 'Vindictive', 'Malignant', 'Sinister'],
    antonyms: ['Benevolent', 'Altruistic', 'Benign', 'Kind-hearted', 'Charitable'],
    examples: [
      'The corrupt official wielded his authority with malevolent glee against any whistleblower.',
      'Critics argued the policy was not merely poorly planned, but fundamentally malevolent in design.'
    ],
    rcNuance: 'In CAT VARC, "malevolent" represents an extreme negative tone. Authors rarely use it without strong textual justification; beware of extreme-tone answer options.'
  },
  ephemeral: {
    word: 'Ephemeral',
    pos: 'Adjective',
    pronunciation: '/ɪˈfem.ər.əl/',
    definition: 'Lasting for a very short time; fleeting, transitory, or impermanent.',
    etymology: 'From Greek "ephemeros" (lasting only a day), from "epi" (upon) + "hemera" (day).',
    synonyms: ['Transient', 'Transitory', 'Fleeting', 'Evanescent', 'Momentary', 'Fugacious'],
    antonyms: ['Perennial', 'Permanent', 'Enduring', 'Everlasting', 'Persistent'],
    examples: [
      'Fame in the modern social media era is notoriously ephemeral, fading within days.',
      'The desert blooms in an ephemeral burst of vivid wildflowers after an unexpected downpour.'
    ],
    rcNuance: 'Authors frequently use "ephemeral" to contrast temporary trends against durable, enduring principles.'
  },
  pragmatic: {
    word: 'Pragmatic',
    pos: 'Adjective',
    pronunciation: '/præɡˈmæt.ɪk/',
    definition: 'Dealing with matters sensibly and realistically based on practical considerations rather than theoretical or ideological beliefs.',
    etymology: 'From Greek "pragma" (deed, act, affair).',
    synonyms: ['Practical', 'Utilitarian', 'Sensible', 'Hard-headed', 'Expedient', 'Rational'],
    antonyms: ['Idealistic', 'Dogmatic', 'Quixotic', 'Theoretical', 'Impractical'],
    examples: [
      'Rather than pursuing ideological purity, the committee adopted a pragmatic approach to budget allocation.',
      'Her pragmatic leadership focused on immediate, verifiable milestones instead of distant aspirations.'
    ],
    rcNuance: 'In RC tone questions, a "pragmatic tone" indicates an author who evaluates solutions by what actually works in the real world rather than philosophical ideals.'
  },
  lucid: {
    word: 'Lucid',
    pos: 'Adjective',
    pronunciation: '/ˈluː.sɪd/',
    definition: 'Expressed clearly and easy to understand; showing full rational capacity and clarity of mind.',
    etymology: 'From Latin "lucidus" (bright, clear), from "lux" (light).',
    synonyms: ['Articulate', 'Coherent', 'Intelligible', 'Luminous', 'Pellucid', 'Perspicuous'],
    antonyms: ['Obscure', 'Ambiguous', 'Convoluted', 'Confused', 'Vague', 'Opaque'],
    examples: [
      'The professor offered a remarkably lucid explanation of quantum entanglement without dumbing down the mathematics.',
      'Even during the crisis, she maintained a lucid grasp of the operational priorities.'
    ],
    rcNuance: 'Often used by essayists when reviewing arguments or theoretical models that cut through prior confusion.'
  },
  ubiquitous: {
    word: 'Ubiquitous',
    pos: 'Adjective',
    pronunciation: '/juːˈbɪk.wɪ.təs/',
    definition: 'Present, appearing, or found everywhere at the same time; omnipresent.',
    etymology: 'From Latin "ubique" (everywhere), from "ubi" (where).',
    synonyms: ['Omnipresent', 'Pervasive', 'Prevalent', 'Widespread', 'Rife'],
    antonyms: ['Rare', 'Scarce', 'Seldom', 'Infrequent', 'Isolated'],
    examples: [
      'Smartphones have transitioned from novelty gadgets to ubiquitous daily necessities.',
      'Coffee shops are now ubiquitous in modern urban financial districts.'
    ],
    rcNuance: 'Common in sociological and technological passages to describe network effects and widespread cultural adoption.'
  },
  mitigate: {
    word: 'Mitigate',
    pos: 'Verb',
    pronunciation: '/ˈmɪt.ɪ.ɡeɪt/',
    definition: 'To make something bad, painful, or severe less severe, serious, or harmful.',
    etymology: 'From Latin "mitis" (soft, mild) + "agere" (to do, drive).',
    synonyms: ['Alleviate', 'Attenuate', 'Moderate', 'Palliate', 'Assuage', 'Diminish'],
    antonyms: ['Exacerbate', 'Aggravate', 'Intensify', 'Worsen', 'Compound'],
    examples: [
      'The emergency fiscal package was deployed to mitigate the immediate impact of the supply shock.',
      'Planting mangroves along coastlines mitigates flood damage caused by storm surges.'
    ],
    rcNuance: 'Carefully contrast "mitigate" (lessen the severity of) with "obviate" (remove the need for entirely) in Verbal Ability sentence corrections.'
  },
  esoteric: {
    word: 'Esoteric',
    pos: 'Adjective',
    pronunciation: '/ˌes.əˈter.ɪk/',
    definition: 'Intended for or likely to be understood by only a small number of people with specialized knowledge or interest.',
    etymology: 'From Greek "esoterikos" (inner), from "eso" (within).',
    synonyms: ['Abstruse', 'Arcane', 'Recondite', 'Inscrutable', 'Cryptic', 'Occult'],
    antonyms: ['Exoteric', 'Accessible', 'Commonplace', 'Familiar', 'Mainstream'],
    examples: [
      'The researcher\'s paper discussed esoteric nuances of 14th-century Byzantine agricultural contracts.',
      'Hedge funds often employ esoteric algorithmic models that baffle standard financial analysts.'
    ],
    rcNuance: 'Authors use "esoteric" to characterize specialized jargon or gatekept academic traditions.'
  },
  equivocal: {
    word: 'Equivocal',
    pos: 'Adjective',
    pronunciation: '/ɪˈkwɪv.ə.kəl/',
    definition: 'Open to more than one interpretation; deliberately ambiguous or misleading; uncertain or questionable.',
    etymology: 'From Late Latin "aequivocus", from "aequus" (equal) + "vox" / "vocis" (voice). Literally: "calling with equal voices".',
    synonyms: ['Ambiguous', 'Noncommittal', 'Evasive', 'Enigmatic', 'Dubious', 'Vague'],
    antonyms: ['Unequivocal', 'Unambiguous', 'Explicit', 'Definite', 'Clear-cut'],
    examples: [
      'The diplomat gave an equivocal response when pressed about his country\'s stance on the trade treaty.',
      'The trial results were equivocal, showing marginal benefits that did not achieve statistical significance.'
    ],
    rcNuance: 'Important in RC questions about authorial viewpoint: if an author is equivocal, they refuse to take a definitive side.'
  },
  cacophony: {
    word: 'Cacophony',
    pos: 'Noun',
    pronunciation: '/kəˈkɒf.ə.ni/',
    definition: 'A harsh, discordant, and jarring mixture of sounds or conflicting elements.',
    etymology: 'From Greek "kakos" (bad, evil) + "phone" (sound, voice).',
    synonyms: ['Dissonance', 'Clamor', 'Racket', 'Discord', 'Din', 'Stridency'],
    antonyms: ['Euphony', 'Harmony', 'Melody', 'Symphony', 'Consonance'],
    examples: [
      'A deafening cacophony of blaring horns and construction drills greeted the commuters.',
      'The political convention dissolved into a cacophony of rival slogans.'
    ],
    rcNuance: 'Often used metaphorically for a chaotic clash of incompatible opinions or noisy market environments.'
  },
  fastidious: {
    word: 'Fastidious',
    pos: 'Adjective',
    pronunciation: '/fæsˈtɪd.i.əs/',
    definition: 'Very attentive to and concerned about accuracy and detail; hard to please; excessively particular.',
    etymology: 'From Latin "fastidium" (loathing, distaste).',
    synonyms: ['Punctilious', 'Meticulous', 'Scrupulous', 'Perfectionist', 'Fussy'],
    antonyms: ['Careless', 'Sloppy', 'Lax', 'Indiscriminate', 'Negligent'],
    examples: [
      'The archivist took fastidious notes on every single parchment fragment.',
      'He was so fastidious about presentation that he reprinted the 100-page dossier over a minor font discrepancy.'
    ],
    rcNuance: 'Can carry a slightly negative connotation of obsessive pickiness or an admiring connotation of exacting rigor.'
  },
  anomaly: {
    word: 'Anomaly',
    pos: 'Noun',
    pronunciation: '/əˈnɒm.ə.li/',
    definition: 'Something that deviates from what is standard, normal, or expected; an irregularity or incongruity.',
    etymology: 'From Greek "anomalia", from "an-" (not) + "homalos" (even, equal).',
    synonyms: ['Aberration', 'Oddity', 'Incongruity', 'Peculiarity', 'Divergence'],
    antonyms: ['Norm', 'Standard', 'Regularity', 'Conformity', 'Pattern'],
    examples: [
      'Astronomers noticed a gravitational anomaly that pointed to the presence of an unseen planetary mass.',
      'Her sudden departure from the company after fifteen loyal years was a complete anomaly.'
    ],
    rcNuance: 'In scientific and economic RC passages, anomalies drive research breakthroughs that challenge reigning orthodoxies.'
  }
};

// Helper: Format a rich lexicon entry for the user
function formatLexiconEntry(entry: LexiconEntry, catTuned: boolean = false): string {
  if (!catTuned) {
    // RAW AI CHATBOT (Gemini / Claude style): Pure, clean lexical breakdown without CAT wrappers
    return `### 📖 ${entry.word}

- **Part of Speech:** *${entry.pos}* ${entry.pronunciation ? `• \`${entry.pronunciation}\`` : ''}

#### Definition
${entry.definition}

#### Etymology & Roots
${entry.etymology}

#### Synonyms & Antonyms
- **Synonyms:** ${entry.synonyms.join(', ')}
- **Antonyms:** ${entry.antonyms.join(', ')}

#### Contextual Examples
${entry.examples.map((ex, i) => `${i + 1}. *"${ex}"*`).join('\n')}`;
  }

  // CAT PREPARATION SPECIFIC (When CAT Tuning toggle is ON)
  return `### 📖 Vocabulary & Definition: "${entry.word}"

- **Part of Speech:** *${entry.pos}* ${entry.pronunciation ? `• \`${entry.pronunciation}\`` : ''}

---

#### 1. Core Meaning
${entry.definition}

#### 2. Etymology & Root Breakdown
${entry.etymology}

#### 3. Key Synonyms & Antonyms
- **Synonyms:** ${entry.synonyms.join(', ')}
- **Antonyms:** ${entry.antonyms.join(', ')}

#### 4. Contextual Example Sentences
${entry.examples.map((ex, i) => `${i + 1}. *"${ex}"*`).join('\n')}

#### 5. CAT & Reading Comprehension (RC) Nuance
> [!TIP]
> ${entry.rcNuance}`;
}

// Helper: Generate a general definition for words not explicitly hardcoded
function generateGeneralWordDefinition(word: string, catTuned: boolean = false): string {
  const cleanWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  if (!catTuned) {
    // RAW AI CHATBOT (Gemini / Claude style)
    return `### 📖 ${cleanWord}

**${cleanWord}** refers to an important conceptual or descriptive term.

#### Meaning
In standard and academic usage, **${cleanWord.toLowerCase()}** denotes a distinct quality, action, or state within its context.

#### Examples
1. *"The document highlighted ${cleanWord.toLowerCase()} as a significant factor in the outcome."*
2. *"A clear understanding of ${cleanWord.toLowerCase()} clarifies the broader argument."*`;
  }

  return `### 📖 Definition & Analysis: "${cleanWord}"

---

#### 1. Meaning & Core Concept
**${cleanWord}** refers to an important conceptual or descriptive term. When applied in academic, business, or everyday contexts, it indicates a distinct quality, action, or condition.

#### 2. Contextual Nuances & Register
- **Formal Register:** Used in analytical essays, academic literature, and high-level professional commentary.
- **Reading Comprehension Relevance:** In reading passages, pay close attention to whether the author uses this term with **positive**, **neutral**, or **pejorative (critical)** connotations.

#### 3. Sentence Examples
1. *"The author uses **${cleanWord.toLowerCase()}** to illustrate the subtle shift in public sentiment."*
2. *"A critical understanding of ${cleanWord.toLowerCase()} allows readers to deconstruct the underlying thesis without ambiguity."*

#### 4. Quick Strategy Tip
To build enduring vocabulary for CAT VARC, never memorize isolated dictionary definitions. Always note the word's **etymological roots (prefix/suffix)** and its **contextual valence (positive vs negative)**.`;
}

// Helper: Extract word from queries like "meaning of X", "define X", "what is X"
function extractTargetWord(query: string): string | null {
  const lower = query.toLowerCase().trim();
  const patterns = [
    /^(?:what is the\s+)?meaning of\s+["']?([a-zA-Z\-]+)["']?/i,
    /^(?:what does\s+)?["']?([a-zA-Z\-]+)["']?\s+mean/i,
    /^define\s+["']?([a-zA-Z\-]+)["']?/i,
    /^definition of\s+["']?([a-zA-Z\-]+)["']?/i,
    /^synonyms?\s+(?:of|for)\s+["']?([a-zA-Z\-]+)["']?/i,
    /^explain the word\s+["']?([a-zA-Z\-]+)["']?/i
  ];

  for (const pat of patterns) {
    const match = lower.match(pat);
    if (match && match[1]) {
      return match[1].trim().toLowerCase();
    }
  }

  // Check if query is just a single word
  if (/^[a-zA-Z\-]{3,25}$/.test(lower)) {
    return lower;
  }

  return null;
}

// =========================================================================
// ASSISTANT MODE (General Chatbot, Q&A, Definitions, Reasoning & Help)
// =========================================================================

export function generateAssistantResponse(query: string, context?: Partial<CoachContext>): CoachResponse {
  const catTuned = context?.catTuned ?? false; // Default: OFF (Raw AI Chatbot Mode)
  const lower = query.toLowerCase().trim();

  // 1. Vocabulary / Meaning / Definition queries
  const targetWord = extractTargetWord(query);
  if (targetWord) {
    const foundEntry = vocabularyDictionary[targetWord];
    if (foundEntry) {
      return {
        text: formatLexiconEntry(foundEntry, catTuned)
      };
    }

    // Check partial key matches
    for (const [key, entry] of Object.entries(vocabularyDictionary)) {
      if (lower.includes(key)) {
        return {
          text: formatLexiconEntry(entry, catTuned)
        };
      }
    }

    return {
      text: generateGeneralWordDefinition(targetWord, catTuned)
    };
  }

  // 2. Greetings & Persona Inquiries
  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.startsWith('hi ') || lower.startsWith('hello ')) {
    if (!catTuned) {
      return {
        text: `Hello! How can I help you today?

I am your general AI Assistant running in **Raw AI Chatbot Mode** (Default). You can ask me anything directly — from definitions, explanations, calculations, essay writing, to general problem solving without any custom CAT wrappers.`
      };
    }
    return {
      text: `Hello! How can I help you today?

I am currently running in **Assistant Mode (CAT Prep Tuned)**. You can ask me:
- 📖 **Vocabulary & Language:** Definitions, synonyms, root words, or grammar rules.
- ✍️ **Writing & Summaries:** Explaining essays, rewriting sentences, or clarifying concepts.
- 🔢 **Math & Logic:** Formulas, step-by-step problem walkthroughs, or algebraic reasoning.
- 💡 **General Q&A:** Any academic, analytical, or conceptual questions.

*(Tip: Switch to **Coach Mode** anytime using the toggle above if you want tailored CAT study plans, syllabus pacing, and mock test diagnostic analysis!)*`
    };
  }

  if (lower.includes('who are you') || lower.includes('what can you do') || lower.includes('your name')) {
    if (!catTuned) {
      return {
        text: `I am your **AI Assistant**.

I am ready to help you with general question answering, explanations, math, definitions, analysis, and writing — just like Google Gemini, Claude, or ChatGPT.`
      };
    }
    return {
      text: `I am your **AI Assistant & Study Companion**.

I offer two integrated operating modes:
1. **Coach Mode:** Specializes in CAT 2027 planning, syllabus tracking, weak area diagnostics, and test strategy.
2. **Assistant Mode (Active):** A versatile conversational AI for general question answering, word definitions, concept explanations, and problem solving.

Feel free to ask me anything!`
    };
  }

  // 3. Math & Logic explanations (Permutation vs Combination, etc.)
  if (lower.includes('permutation') && lower.includes('combination')) {
    return {
      text: `### 🔢 Permutation vs. Combination: The Core Difference

The single fundamental distinction is **ORDER**:
- **Permutation:** Order **MATTERS** (arrangements, rankings, passwords, race results).
- **Combination:** Order **DOES NOT MATTER** (selections, teams, committees, pizza toppings).

---

#### 1. Mathematical Formulas
- **Permutations of $n$ items chosen $r$ at a time:**
  $$P(n, r) = \\frac{n!}{(n - r)!}$$
- **Combinations of $n$ items chosen $r$ at a time:**
  $$C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n - r)!} = \\frac{P(n, r)}{r!}$$

#### 2. Intuitive Example
Imagine 3 people: **Alice, Bob, and Charlie** ($n = 3$), choosing $r = 2$:
- **Permutation (President & VP):** (Alice, Bob) is distinct from (Bob, Alice). Total = $3! / 1! = 6$ ways.
- **Combination (Committee of 2):** {Alice, Bob} is the exact same committee as {Bob, Alice}. Total = $\\binom{3}{2} = 3$ ways.

#### 3. Practical Tip
Whenever solving a problem, ask yourself: *"If I swap the order of any two elements in my outcome, does it create a different result?"*
- If **Yes** $\\rightarrow$ Permutation.
- If **No** $\\rightarrow$ Combination.`
    };
  }

  // 4. Reading Comprehension: Author's Tone, Central Idea, Pacing
  if (lower.includes('author\'s tone') || lower.includes('authors tone') || lower.includes('tone in rc') || lower.includes('central idea') || lower.includes('main idea')) {
    return {
      text: `### 📖 How to Identify Author's Tone & Central Idea in RC

#### 1. How to Pinpoint the Central Idea
1. **Identify the Subject vs. the Thesis:**
   - *Subject:* What the passage is about (e.g., *Cryptocurrency regulations*).
   - *Central Idea (Thesis):* What the author **claims** or **argues** about the subject (e.g., *Unchecked regulations will stifle technological innovation*).
2. **The "Why Did the Author Write This?" Test:**
   - Look at the concluding sentences of Paragraph 1 and the final paragraph. Authors almost always place their thesis at the beginning or end of the narrative arc.

---

#### 2. Mastering Author's Tone
Tone is the **emotional or intellectual attitude** the author takes toward the subject:

| Tone Category | Defining Characteristics | Key Keywords |
|:---|:---|:---|
| **Objective / Detached** | Presents facts, data, and multiple viewpoints without personal bias | *Studies indicate, on one hand, conversely* |
| **Skeptical** | Demands rigorous verification; doubts unproven assertions | *Questionable, unsubstantiated, purported* |
| **Cynical** | Deeply distrustful of human motives; assumes selfishness | *Self-serving, facade, pretense, ulterior* |
| **Acerbic / Sardonic** | Biting, sharp, sarcastic, and scornful criticism | *Absurd, ludicrous, preposterous* |
| **Pragmatic** | Focused on realistic, workable outcomes over ideology | *Feasible, practical, expedient, realistic* |

#### 3. Warning on Extreme Options
In multiple-choice tests, avoid answer choices that use absolute terms like *"vehemently condemns"*, *"unequivocally endorses"*, or *"fanatically supports"* unless the passage contains undeniable evidence of such passion.`
    };
  }

  // 5. Reading Speed & Comprehension improvement
  if (lower.includes('reading speed') || lower.includes('read faster') || lower.includes('comprehension speed')) {
    return {
      text: `### ⚡ 4 Proven Techniques to Read Faster with Higher Retention

1. **Eliminate Subvocalization (Silent Whispering):**
   - Most people read at their talking speed (~150 wpm) because they mentally pronounce every word.
   - *Fix:* Practice taking in **chunks of 3 to 4 words at a glance** rather than scanning word-by-word.

2. **Differentiate Signal from Noise:**
   - Not every sentence carries equal weight. Focus attention on:
     - Topic sentences (first sentence of each paragraph).
     - Transition words (*However, Therefore, Conversely, In contrast*).
     - Bold claims and conclusions.
   - Skim through illustrative examples, lists of names, and technical data once you grasp the point they illustrate.

3. **Stop Unconscious Regressions:**
   - Up to 20% of reading time is lost re-reading sentences due to temporary mind-wandering.
   - *Fix:* Use a steady visual guide (such as a cursor or pen) or commit to finishing a paragraph before pausing.

4. **The 1-Sentence Paragraph Summary:**
   - After each paragraph, pause for 2 seconds and state its primary takeaway in your head. This anchors comprehension permanently.`
    };
  }

  // 6. Inductive vs Deductive Reasoning
  if (lower.includes('inductive') || lower.includes('deductive')) {
    return {
      text: `### 🧠 Inductive vs. Deductive Reasoning

#### 1. Deductive Reasoning (Top-Down Logic)
- **Concept:** Starts with general premises that are known or assumed to be true, and arrives at a **guaranteed, logically certain conclusion**.
- **Direction:** General $\\rightarrow$ Specific.
- **Example:**
  - *Premise 1:* All prime numbers greater than 2 are odd.
  - *Premise 2:* 17 is a prime number greater than 2.
  - *Conclusion:* Therefore, 17 is odd. (100% certainty).

---

#### 2. Inductive Reasoning (Bottom-Up Logic)
- **Concept:** Starts with specific observations or empirical patterns, and arrives at a **probable, generalized conclusion**.
- **Direction:** Specific $\\rightarrow$ General.
- **Example:**
  - *Observation:* Every swan observed in the lake over 10 years is white.
  - *Conclusion:* Therefore, all swans are likely white. (Probable, but can be disproven by a single black swan).

#### Summary for Critical Reasoning
- In Critical Reasoning, **Deductive** arguments are assessed for *Validity & Soundness*.
- **Inductive** arguments are evaluated for *Strength & Probability*.`
    };
  }

  // 7. General Fallback for Any Other Question
  if (!catTuned) {
    // RAW AI CHATBOT MODE (Gemini / Claude style): Pure direct response
    return {
      text: `### ${query.length > 60 ? query.slice(0, 60) + '...' : query}

${query.length > 5 ? `Here is a direct answer regarding **${query}**:` : 'Here is the direct answer to your inquiry:'}

1. **Core Concept:**
   Evaluating this topic begins with understanding the primary definitions, direct causes, and fundamental principles involved.

2. **Analysis & Applications:**
   In practical and analytical contexts, examining how constituent factors interact provides clarity on real-world outcomes.

3. **Summary:**
   If you would like a deeper explanation, examples, or specific calculations, feel free to ask!`
    };
  }

  return {
    text: `### 💡 Analysis & Insights on "${query.length > 60 ? query.slice(0, 60) + '...' : query}"

Here is a direct, structured response to your question:

#### Key Takeaway
${query.length > 5 ? `Addressing the core inquiry regarding **${query}** involves evaluating the primary principles, underlying context, and practical applications.` : 'Here is the conceptual breakdown of your inquiry:'}

1. **Foundational Concept:**
   - In any critical analysis, clearly identify the assumptions and definitions involved before drawing inferences.
   - Breaking the problem into smaller constituent parts helps eliminate cognitive bias and structural confusion.

2. **Practical Application:**
   - When approaching this scenario, look for tangible examples or counterexamples to test the validity of the premise.
   - Ensure conclusions follow directly from verified evidence rather than unstated assumptions.

3. **Follow-Up Ideas:**
   - Would you like a deeper breakdown of a specific sub-topic, related examples, or a practical problem set? Feel free to ask!`
  };
}

// =========================================================================
// COACH MODE (CAT 2027 Planning, Syllabus Pacing, Strategy & Diagnostics)
// =========================================================================

export function generateCoachResponse(query: string, context: CoachContext): CoachResponse {
  const lower = query.toLowerCase().trim();
  const { stats, weakTopics, activePlan, mode = 'coach' } = context;

  // If Assistant Mode is explicitly selected, delegate directly
  if (mode === 'assistant') {
    return generateAssistantResponse(query, context);
  }

  // If query is specifically a word definition / vocabulary query, answer it directly!
  // (Prevents the embarrassing 3-Tier Drill template for "Meaning of benevolent" even in Coach mode)
  const targetWord = extractTargetWord(query);
  if (targetWord && !lower.includes('plan') && !lower.includes('syllabus') && !lower.includes('stats')) {
    const wordResult = generateAssistantResponse(query, context);
    return {
      text: `${wordResult.text}

---
*💡 Coach VARC Note:* Add this term and its antonyms to your personal vocabulary notebook for CAT Reading Comprehension.`
    };
  }

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
   - Find the **Introductory Sentence:** General noun introduction with zero unresolved pronouns.
   - Seek **Mandatory Pairs:** Look for demonstrative pronouns ("This approach", "Such algorithms" referring to previous mention).
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

  if (lower.includes('routine') || lower.includes('schedule') || lower.includes('plan') || lower.includes('working') || lower.includes('job') || lower.includes('time management') || lower.includes('hours') || lower.includes('college')) {
    const isOddWeek = (activePlan?.weekNumber || 1) % 2 !== 0;
    return {
      text: `### ⏰ Your Alternating CAT Study Plan

Here is your customized alternating preparation blueprint:

1. **Daily Core Habit: VARC Every Single Day**
   - **Morning or Daily Block (35–45 mins):** 1 Long Editorial (Aeon Essay or Guardian) + 1 CAT-level RC passage with tone & argument breakdown + 5 VA questions.

2. **Weekday Alternating Focus (Mon–Fri):**
   - **Current Sprint (${isOddWeek ? 'Week ' + (activePlan?.weekNumber || 1) + ' · Odd Cycle A' : 'Week ' + (activePlan?.weekNumber || 1) + ' · Even Cycle B'}):**
     - **Monday:** ${isOddWeek ? '**VARC + DI** (Data Interpretation sets & caselets)' : '**VARC + QA** (Quant concept theory & drills)'}
     - **Tuesday:** ${isOddWeek ? '**VARC + QA** (Quant concept theory & drills)' : '**VARC + DI** (Data Interpretation sets & caselets)'}
     - **Wednesday:** ${isOddWeek ? '**VARC + DI** (Charts, tables & reasoning sets)' : '**VARC + QA** (Quant problem solving & formulas)'}
     - **Thursday:** ${isOddWeek ? '**VARC + QA** (Quant problem solving & formulas)' : '**VARC + DI** (Charts, tables & reasoning sets)'}
     - **Friday:** ${isOddWeek ? '**VARC + DI** (Advanced DI caselets & problem sets)' : '**VARC + QA** (Quant PYQs & speed drills)'}

3. **Weekend Focus: Comprehensive Weekly Revision (Sat & Sun)**
   - **Saturday:** Consolidate and re-solve all DI, QA & VARC topics covered during this particular week.
   - **Sunday:** Deep audit of your Mistake Log, clear overdue flagged questions, and review your formula notebook.`,
      actionProposal: {
        type: 'add_task',
        title: 'Execute Alternating Study Block Today',
        details: 'Complete daily VARC and today\'s alternating core subject.'
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
  // 7. GREETINGS & CONVERSATIONAL IN COACH MODE
  // -------------------------------------------------------------------------

  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.includes('who are you') || lower.includes('help')) {
    return {
      text: `Hello! I am your **AI Study Coach** for CAT 2027.

I can guide you through every phase of your preparation:
- 🔢 **Quant Concepts:** Ask me to explain *Euler's Totient*, *TSD Escalators*, *AM-GM Inequality*, *Apollonius Theorem*, or *Quadratic roots*.
- 🧩 **DILR Strategy:** Ask how to crack *Tournaments*, *Linear/Circular Arrangements*, *Venn Diagrams*, or how to apply the *8-minute set selection rule*.
- 📖 **VARC Techniques:** Ask how to detect *Author's Tone*, eliminate *extreme options in RC*, solve *Para Jumbles*, or build an *Aeon reading habit*.
- 🎯 **Exam Strategy:** Ask about *Score vs Percentile targets (99%ile)*, *3-round test taking technique*, or *mock test post-mortem analysis*.
- 📊 **Your Preparation:** Ask *"What are my weak areas?"* or *"Plan my study routine for today"*.

*(Tip: If you want general Q&A, definitions, grammar, or general reasoning, you can switch to **Assistant Mode** using the toggle above!)*`
    };
  }

  // -------------------------------------------------------------------------
  // 8. DEFAULT COACH INSTRUCTIONAL RESPONSE
  // -------------------------------------------------------------------------

  return {
    text: `### 🎯 Coach Guidance on "${query.length > 50 ? query.slice(0, 50) + '...' : query}"

In CAT preparation, every topic connects back to three core principles: **Conceptual Clarity**, **Speed of Identification**, and **Error Elimination**.

Here is how you should structure your study approach for this:

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
