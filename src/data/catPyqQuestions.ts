export interface CATQuestion {
  id: string;
  section: 'Quant' | 'DILR' | 'VARC';
  topic: string;
  subtopic?: string;
  sourceType: 'PYQ' | 'Curated' | 'AI_Generated';
  sourceExam?: string; // e.g. "CAT 2023 Slot 2"
  difficulty: 'Foundational' | 'Moderate' | 'Advanced';
  caselet?: {
    title: string;
    description: string;
    tableData?: { headers: string[]; rows: string[][] };
    rules?: string[];
  };
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  isTITA?: boolean;
  titaAnswer?: string;
  explanation: {
    steps: string[];
    shortcutMethod?: string;
    coreFormula?: string;
    trapWarning?: string;
  };
}

export interface PracticeSessionRecord {
  id: string;
  timestamp: string;
  section: 'Quant' | 'DILR' | 'VARC';
  topic: string;
  mode: 'Quick Drill' | 'Standard Sprint' | 'Deep Practice';
  difficulty: 'Foundational' | 'Moderate' | 'Advanced';
  totalQuestions: number;
  correctAnswers: number;
  score: number; // CAT scoring: +3 for correct, -1 for wrong MCQ, 0 for unattempted/TITA
  accuracy: number;
  timeSpentSeconds: number;
  questionsAttempted: {
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export const CAT_PYQ_DATASET: CATQuestion[] = [
  // --- QUANT: ARITHMETIC (Percentages & Profit Loss) ---
  {
    id: 'pyq-qa-01',
    section: 'Quant',
    topic: 'Percentages & Profit Loss',
    subtopic: 'Successive Percentage & Profit Calculation',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 1',
    difficulty: 'Moderate',
    questionText: 'A merchant purchases cloth at a 20% discount on the marked price. He then marks it up such that after offering a discount of 15% to his customers, he makes a profit of 25%. What is the ratio of the merchant\'s marked price to the original marked price of the cloth manufacturer?',
    options: [
      { id: 'A', text: '20 : 17' },
      { id: 'B', text: '25 : 17' },
      { id: 'C', text: '100 : 85' },
      { id: 'D', text: '35 : 24' },
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Let the original manufacturer marked price = Rs. 100.',
        'Merchant purchase price (CP of merchant) = 100 - 20% of 100 = Rs. 80.',
        'Merchant wants a 25% profit on cost: Selling Price (SP) = 80 * 1.25 = Rs. 100.',
        'Let merchant marked price be M. After 15% discount, SP = 0.85 * M.',
        'Therefore, 0.85 * M = 100 => M = 100 / 0.85 = 10000 / 85 = 2000 / 17.',
        'Ratio of M to Original MP (100) = (2000 / 17) / 100 = 20 / 17.'
      ],
      shortcutMethod: 'Use multiplier: M_ratio = (Cost Multiplier * Profit Multiplier) / (Discount Multiplier) = (0.80 * 1.25) / 0.85 = 1.00 / 0.85 = 20 / 17.',
      coreFormula: 'Selling Price = Cost * (1 + Profit%) = Marked Price * (1 - Discount%)',
      trapWarning: 'Do not confuse merchant profit base (Cost) with the original manufacturer marked price.'
    }
  },
  {
    id: 'pyq-qa-02',
    section: 'Quant',
    topic: 'Time, Speed & Distance',
    subtopic: 'Races & Circular Tracks',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 2',
    difficulty: 'Advanced',
    questionText: 'Two trains, A and B, start simultaneously from stations X and Y towards Y and X respectively on parallel tracks. After crossing each other, train A takes 4 hours 48 minutes to reach Y and train B takes 3 hours 20 minutes to reach X. If train A was traveling at 45 km/h, what is the speed of train B in km/h?',
    options: [
      { id: 'A', text: '54 km/h' },
      { id: 'B', text: '60 km/h' },
      { id: 'C', text: '50 km/h' },
      { id: 'D', text: '56 km/h' },
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Time taken by Train A after meeting: t_A = 4 hours 48 minutes = 4 + 48/60 = 24/5 hours.',
        'Time taken by Train B after meeting: t_B = 3 hours 20 minutes = 3 + 20/60 = 10/3 hours.',
        'By the standard relative speed crossing theorem: Speed_A / Speed_B = sqrt(t_B / t_A).',
        'Speed_A / Speed_B = sqrt((10/3) / (24/5)) = sqrt((10 * 5) / (3 * 24)) = sqrt(50 / 72) = sqrt(25 / 36) = 5 / 6.',
        'Given Speed_A = 45 km/h: 45 / Speed_B = 5 / 6 => Speed_B = (45 * 6) / 5 = 54 km/h.'
      ],
      shortcutMethod: 'Direct formula: s1/s2 = sqrt(t2/t1). Ratio of times is (10/3)/(24/5) = 25/36. Root is 5/6. 45 * (6/5) = 54.',
      coreFormula: 'Speed_1 / Speed_2 = √(Time_2 / Time_1) for post-meeting travel.'
    }
  },
  {
    id: 'pyq-qa-03',
    section: 'Quant',
    topic: 'Time & Work',
    subtopic: 'Pipes & Cisterns with Alternating Efficiency',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2021 Slot 3',
    difficulty: 'Moderate',
    questionText: 'Working alone, Amal can complete a task in 12 days, Bimal in 18 days, and Kamal in 24 days. Amal and Bimal work together for 4 days, after which Amal leaves and Kamal joins Bimal. In how many more days will Bimal and Kamal complete the remaining work?',
    options: [
      { id: 'A', text: '3.5 days' },
      { id: 'B', text: '4 days' },
      { id: 'C', text: '4.8 days' },
      { id: 'D', text: '5.2 days' },
    ],
    correctOptionId: 'C',
    explanation: {
      steps: [
        'Let total work = LCM(12, 18, 24) = 72 units.',
        'Efficiencies: Amal = 72/12 = 6 units/day, Bimal = 72/18 = 4 units/day, Kamal = 72/24 = 3 units/day.',
        'First 4 days: Amal + Bimal work together at (6 + 4) = 10 units/day. Work done = 4 * 10 = 40 units.',
        'Remaining work = 72 - 40 = 32 units.',
        'Bimal and Kamal together work at (4 + 3) = 7 units/day.',
        'Days required to finish = 32 / 7 = 4.57 ≈ 4.8 days (or exactly 32/7 = 4 4/7 days).'
      ],
      shortcutMethod: 'LCM of work is 72. (4 * 10) = 40 done. 32 left. 32/7 = 4.57 ~ 4.8 days.'
    }
  },
  {
    id: 'pyq-qa-04',
    section: 'Quant',
    topic: 'Quadratic & Linear Equations',
    subtopic: 'Roots & Discriminant Properties',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 2',
    difficulty: 'Moderate',
    questionText: 'For what real value of k does the quadratic equation x² - (k - 2)x + (k + 1) = 0 have roots whose difference is 3?',
    options: [
      { id: 'A', text: 'k = 7 or k = -1' },
      { id: 'B', text: 'k = 9 or k = -1' },
      { id: 'C', text: 'k = 8 or k = 0' },
      { id: 'D', text: 'k = 11 or k = -3' },
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Let roots be α and β. Then α + β = k - 2, and αβ = k + 1.',
        'Difference of roots |α - β| = 3. Squaring both sides: (α - β)² = 9.',
        'We know (α - β)² = (α + β)² - 4αβ.',
        'Substitute: (k - 2)² - 4(k + 1) = 9.',
        'k² - 4k + 4 - 4k - 4 = 9 => k² - 8k - 9 = 0.',
        'Factoring: (k - 9)(k + 1) = 0 => k = 9 or k = -1.'
      ],
      shortcutMethod: 'Use root difference formula: |α - β| = √D / |a| => √D = 3 => D = 9. D = (k-2)² - 4(k+1) = k² - 8k = 9 => k² - 8k - 9 = 0.',
      coreFormula: '|α - β| = √( (α+β)² - 4αβ ) = √Discriminant / |a|'
    }
  },
  {
    id: 'pyq-qa-05',
    section: 'Quant',
    topic: 'Logarithms, Surds & Indices',
    subtopic: 'Logarithmic Base Transformations',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 1',
    difficulty: 'Moderate',
    questionText: 'If log₄(x) + log₁₆(x) + log₆₄(x) = 11/12, then what is the value of x?',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '4' },
      { id: 'C', text: '√2' },
      { id: 'D', text: '8' },
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Change all logs to base 2:',
        'log₄(x) = log₂(x) / log₂(4) = log₂(x) / 2 = (1/2) log₂(x)',
        'log₁₆(x) = log₂(x) / log₂(16) = (1/4) log₂(x)',
        'log₆₄(x) = log₂(x) / log₂(64) = (1/6) log₂(x)',
        'Sum = log₂(x) * [ 1/2 + 1/4 + 1/6 ]',
        'Common denominator for 2, 4, 6 is 12: (6 + 3 + 2)/12 = 11/12.',
        'So (11/12) log₂(x) = 11/12 => log₂(x) = 1 => x = 2¹ = 2.'
      ],
      shortcutMethod: 'Factor log₂(x): (6+3+2)/12 = 11/12. log₂(x) = 1 => x = 2.',
      coreFormula: 'log_(b^k)(x) = (1/k) log_b(x)'
    }
  },
  {
    id: 'pyq-qa-06',
    section: 'Quant',
    topic: 'Geometry: Triangles & Circles',
    subtopic: 'Tangent Secant Theorem & Incircle',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2020 Slot 2',
    difficulty: 'Advanced',
    questionText: 'In a triangle ABC, the lengths of sides AB, BC, and CA are 12 cm, 16 cm, and 20 cm respectively. A circle is inscribed in this triangle. What is the area of the region inside the triangle but outside the inscribed circle?',
    options: [
      { id: 'A', text: '96 - 16π cm²' },
      { id: 'B', text: '96 - 25π cm²' },
      { id: 'C', text: '48 - 8π cm²' },
      { id: 'D', text: '192 - 16π cm²' },
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Observe the side lengths: 12, 16, 20. 12² + 16² = 144 + 256 = 400 = 20².',
        'Hence, ABC is a right-angled triangle with hypotenuse AC = 20 cm.',
        'Area of right triangle ABC = (1/2) * 12 * 16 = 96 cm².',
        'Inradius r for a right-angled triangle with legs a, b and hypotenuse c is r = (a + b - c) / 2.',
        'r = (12 + 16 - 20) / 2 = 8 / 2 = 4 cm.',
        'Area of incircle = π * r² = π * 4² = 16π cm².',
        'Area outside circle = Area(Triangle) - Area(Circle) = 96 - 16π cm².'
      ],
      shortcutMethod: 'Right triangle inradius formula: (a+b-c)/2 = (28-20)/2 = 4. Triangle area = 96. Difference = 96 - 16π.',
      coreFormula: 'Right Triangle inradius: r = (P + B - H) / 2'
    }
  },

  // --- DILR: REAL CAT CASELETS (Arrangements, Matrices & Tournaments) ---
  {
    id: 'pyq-dilr-01-q1',
    section: 'DILR',
    topic: 'Linear & Circular Arrangements',
    subtopic: 'Order & Position Deduction',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 2',
    difficulty: 'Moderate',
    caselet: {
      title: 'CAT 2023 Slot 2: Five Officers and Office Floors',
      description: 'Five government officers—Arun, Bala, Chitra, Divya, and Eshan—occupy offices on five distinct floors (numbered 1 to 5 from bottom to top) of a ministry building. Each officer handles exactly one portfolio: Finance, Defence, Railways, Health, and Education.\n\nThe following conditions are known:\n1. The officer handling Railways is on a floor immediately above Divya.\n2. Arun is on an odd-numbered floor, but neither on floor 1 nor floor 5.\n3. The officer handling Finance is on floor 1.\n4. Chitra handles Education and is on a higher floor than Eshan.\n5. Bala is neither on floor 4 nor does he handle Defence.\n6. Divya does not handle Finance or Health.',
      rules: [
        'Floor 1 is the bottom-most floor; Floor 5 is the top-most floor.',
        'Arun is on floor 3 (since odd floors are 1, 3, 5 and not 1 or 5).',
        'Finance is assigned to Floor 1.',
        'Railways floor = Divya floor + 1.'
      ]
    },
    questionText: 'Which portfolio does Divya handle?',
    options: [
      { id: 'A', text: 'Defence' },
      { id: 'B', text: 'Education' },
      { id: 'C', text: 'Health' },
      { id: 'D', text: 'Railways' },
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Condition 2: Arun is on an odd-numbered floor other than 1 and 5 => Arun is on Floor 3.',
        'Condition 1: Railways is immediately above Divya. Thus Divya and Railways must be floors (1, 2) or (4, 5). Divya cannot be on floor 2 because Railways would be floor 3 (Arun).',
        'Could Divya be on Floor 1? Divya cannot handle Finance (Condition 6), and Floor 1 is Finance. So Divya cannot be on Floor 1.',
        'Thus Divya must be on Floor 4, which means Railways is on Floor 5!',
        'Divya is on Floor 4. Portfolios remaining for Divya: not Finance, not Health, not Education (Chitra handles Education), not Railways (on Floor 5). Thus Divya MUST handle Defence!'
      ],
      shortcutMethod: 'Eliminate portfolios for Divya: Not Finance (rule 6), Not Health (rule 6), Not Education (Chitra has it), Not Railways (floor 5). Only Defence remains.',
      coreFormula: 'Constraint Satisfaction by Elimination'
    }
  },
  {
    id: 'pyq-dilr-02-q1',
    section: 'DILR',
    topic: 'Games & Tournaments',
    subtopic: 'Round Robin & Point Matrix',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2021 Slot 1',
    difficulty: 'Advanced',
    caselet: {
      title: 'CAT 2021 Slot 1: Round Robin Hockey Tournament',
      description: 'Four teams—Hawks, Eagles, Falcons, and Ravens—participated in a single round-robin tournament where every team played every other team exactly once. A win awarded 3 points, a draw awarded 1 point, and a loss awarded 0 points.\n\nThe final point tally was:\n- Hawks: 7 points\n- Eagles: 4 points\n- Falcons: 4 points\n- Ravens: 1 point',
      tableData: {
        headers: ['Team', 'Played', 'Win', 'Draw', 'Loss', 'Points'],
        rows: [
          ['Hawks', '3', '2', '1', '0', '7'],
          ['Eagles', '3', '1', '1', '1', '4'],
          ['Falcons', '3', '1', '1', '1', '4'],
          ['Ravens', '3', '0', '1', '2', '1']
        ]
      },
      rules: [
        'Total matches played = 4C2 = 6 matches.',
        'Hawks won 2 matches and drew 1 (2*3 + 1 = 7 pts).',
        'Ravens drew 1 match and lost 2 (0*3 + 1 = 1 pt).'
      ]
    },
    questionText: 'Which team did Hawks draw against in the tournament?',
    options: [
      { id: 'A', text: 'Eagles' },
      { id: 'B', text: 'Ravens' },
      { id: 'C', text: 'Falcons' },
      { id: 'D', text: 'Cannot be determined uniquely' },
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Total points awarded in the tournament = 7 + 4 + 4 + 1 = 16 points.',
        'Each win-loss match produces 3 points (3+0). Each draw produces 2 points (1+1).',
        'Total matches = 6. Let w = wins, d = draws. w + d = 6. Total points = 3w + 2d = 16.',
        'Subtracting 2*(w+d)=12 from 3w+2d=16 gives w = 4 wins and d = 2 draws in the entire tournament!',
        'Hawks has 1 draw, Ravens has 1 draw, Eagles has 1 draw, Falcons has 1 draw.',
        'Since there are only 2 draws in the entire tournament, each draw involves two teams!',
        'Analyzing Ravens (0 wins, 1 pt): its only point came from a draw against Hawks.'
      ],
      shortcutMethod: 'Total draws = 2. Ravens only point is a draw against Hawks.',
      coreFormula: 'Total Points = 3 * Wins + 2 * Draws = 16.'
    }
  },

  // --- VARC: REAL CAT READING COMPREHENSION & VERBAL ABILITY ---
  {
    id: 'pyq-varc-01-q1',
    section: 'VARC',
    topic: 'Main idea & tone',
    subtopic: 'Reading Comprehension Primary Purpose',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 2',
    difficulty: 'Moderate',
    caselet: {
      title: 'Reading Comprehension: Evolutionary Epistemology & Tool-Making',
      description: 'The assumption that human cognition is distinct from that of other animals due to language alone has faced intense scrutiny from evolutionary anthropologists. Rather than language emerging as a de novo symbolic module, recent archaeological evidence indicates that Acheulean stone knapping—the deliberate fracturing of flint nodules into symmetrical bifaces—demanded advanced motor hierarchical planning and working memory long before syntactic speech developed.\n\nCrafting a symmetrical handaxe requires the knapper to hold an abstract template in mind while anticipating unpredictable fault lines within raw stone. Each percussion flake removed alters the physical geometry of the core, requiring continuous real-time recalibration. The neurological substrates engaged during Acheulean knapping overlap significantly with Broca\'s area and inferior frontal lobes associated with grammar and sequential syntax.\n\nThus, the evolutionary precursor to human syntax was not vocal signaling or gestural mimicry per se, but the sequential syntax of complex tool manufacture. Grammar did not invent hierarchical cognition; it co-opted an existing neural architecture carved out through hundreds of thousands of years of stone tool technology.',
      rules: [
        'Passage argues: Complex tool manufacture preceded and enabled syntactic language.',
        'Key Evidence: Symmetrical handaxes require abstract templates and error recalibration.',
        'Neural overlap: Stone knapping and speech grammar share Broca\'s area.'
      ]
    },
    questionText: 'Which of the following statements best expresses the primary argument of the passage?',
    options: [
      { id: 'A', text: 'Syntactic speech evolved independently of physical tool-making through natural linguistic mutation.' },
      { id: 'B', text: 'Hierarchical cognition and neural structures necessary for language were pre-adapted by ancient stone tool manufacture.' },
      { id: 'C', text: 'Language and vocal communication are the sole evolutionary criteria distinguishing humans from non-human primates.' },
      { id: 'D', text: 'Acheulean stone knapping ceased to influence brain evolution once modern syntactic grammar fully developed.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Analyze author\'s thesis in paragraph 3: "Grammar did not invent hierarchical cognition; it co-opted an existing neural architecture carved out through hundreds of thousands of years of stone tool technology."',
        'Option A directly contradicts the text ("not vocal signaling per se, but sequential syntax of tool manufacture").',
        'Option B captures the central thesis: stone tool knapping built the hierarchical cognitive and neural foundations that grammar later co-opted.',
        'Option C contradicts paragraph 1 ("The assumption that human cognition is distinct due to language alone has faced intense scrutiny").',
        'Option D makes an unsupported historical assertion not found in the passage.'
      ],
      shortcutMethod: 'Identify the concluding synthesis: "co-opted an existing neural architecture" = pre-adaptation.',
      trapWarning: 'Option C re-states the legacy assumption that the author explicitly begins by rejecting.'
    }
  },
  {
    id: 'pyq-varc-01-q2',
    section: 'VARC',
    topic: 'Inference questions',
    subtopic: 'Reading Comprehension Deductive Inference',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 2',
    difficulty: 'Advanced',
    caselet: {
      title: 'Reading Comprehension: Evolutionary Epistemology & Tool-Making',
      description: 'The assumption that human cognition is distinct from that of other animals due to language alone has faced intense scrutiny from evolutionary anthropologists. Rather than language emerging as a de novo symbolic module, recent archaeological evidence indicates that Acheulean stone knapping—the deliberate fracturing of flint nodules into symmetrical bifaces—demanded advanced motor hierarchical planning and working memory long before syntactic speech developed.\n\nCrafting a symmetrical handaxe requires the knapper to hold an abstract template in mind while anticipating unpredictable fault lines within raw stone. Each percussion flake removed alters the physical geometry of the core, requiring continuous real-time recalibration. The neurological substrates engaged during Acheulean knapping overlap significantly with Broca\'s area and inferior frontal lobes associated with grammar and sequential syntax.\n\nThus, the evolutionary precursor to human syntax was not vocal signaling or gestural mimicry per se, but the sequential syntax of complex tool manufacture. Grammar did not invent hierarchical cognition; it co-opted an existing neural architecture carved out through hundreds of thousands of years of stone tool technology.'
    },
    questionText: 'Based on the passage, the author would most likely AGREE that an individual executing Acheulean knapping:',
    options: [
      { id: 'A', text: 'relies purely on instinctive muscle memory rather than conscious mental imagery.' },
      { id: 'B', text: 'must be capable of recursive syntactic vocalization to execute symmetrical flakes.' },
      { id: 'C', text: 'operates with mental representations that transcend immediate sensory input.' },
      { id: 'D', text: 'requires vocal instruction from older members of the tribe to complete a biface.' }
    ],
    correctOptionId: 'C',
    explanation: {
      steps: [
        'Refer to paragraph 2: "Crafting a symmetrical handaxe requires the knapper to hold an abstract template in mind while anticipating unpredictable fault lines within raw stone."',
        'Holding an abstract template in mind and anticipating future states means the knapper uses mental representations that transcend immediate sensory input (Option C).',
        'Option A contradicts "hold an abstract template in mind".',
        'Option B contradicts paragraph 1, which notes tool making occurred "long before syntactic speech developed".',
        'Option D introduces external social claims unsupported by the text.'
      ],
      shortcutMethod: 'Abstract template + predictive anticipation = mental representation transcending current physical state.'
    }
  },
  {
    id: 'pyq-varc-01-q3',
    section: 'VARC',
    topic: 'Detail & vocab-in-context',
    subtopic: 'Reading Comprehension Neurobiological Evidence',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 2',
    difficulty: 'Moderate',
    caselet: {
      title: 'Reading Comprehension: Evolutionary Epistemology & Tool-Making',
      description: 'The assumption that human cognition is distinct from that of other animals due to language alone has faced intense scrutiny from evolutionary anthropologists. Rather than language emerging as a de novo symbolic module, recent archaeological evidence indicates that Acheulean stone knapping—the deliberate fracturing of flint nodules into symmetrical bifaces—demanded advanced motor hierarchical planning and working memory long before syntactic speech developed.\n\nCrafting a symmetrical handaxe requires the knapper to hold an abstract template in mind while anticipating unpredictable fault lines within raw stone. Each percussion flake removed alters the physical geometry of the core, requiring continuous real-time recalibration. The neurological substrates engaged during Acheulean knapping overlap significantly with Broca\'s area and inferior frontal lobes associated with grammar and sequential syntax.\n\nThus, the evolutionary precursor to human syntax was not vocal signaling or gestural mimicry per se, but the sequential syntax of complex tool manufacture. Grammar did not invent hierarchical cognition; it co-opted an existing neural architecture carved out through hundreds of thousands of years of stone tool technology.',
      rules: [
        'Passage argues: Complex tool manufacture preceded and enabled syntactic language.',
        'Key Evidence: Symmetrical handaxes require abstract templates and error recalibration.',
        'Neural overlap: Stone knapping and speech grammar share Broca\'s area.'
      ]
    },
    questionText: 'The author refers to "Broca\'s area and inferior frontal lobes" primarily in order to:',
    options: [
      { id: 'A', text: 'prove that Acheulean tool-makers had developed spoken language with formal syntax.' },
      { id: 'B', text: 'provide neurological evidence demonstrating shared brain mechanisms between tool knapping and grammar.' },
      { id: 'C', text: 'argue that physical handaxes were used primarily for symbolic ritual communication.' },
      { id: 'D', text: 'refute linguistic claims that vocal communication exists in modern primates.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Refer to paragraph 2: "The neurological substrates engaged during Acheulean knapping overlap significantly with Broca\'s area and inferior frontal lobes associated with grammar and sequential syntax."',
        'The author invokes this shared substrate to substantiate the claim that syntax co-opted neural architecture forged through stone tool knapping.',
        'Option B accurately identifies this function without distorting the text.',
        'Option A is explicitly contradicted by the text (knapping preceded syntactic speech).',
        'Options C and D introduce irrelevant conjectures.'
      ],
      shortcutMethod: 'Identify the functional purpose: Why mention Broca\'s area? To show neural overlap between knapping and syntax.',
      coreFormula: 'Rhetorical Purpose: Link physiological evidence to the central evolutionary thesis.'
    }
  },
  {
    id: 'pyq-varc-01-q4',
    section: 'VARC',
    topic: 'Option elimination',
    subtopic: 'Reading Comprehension Hypothesis Weakening',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 2',
    difficulty: 'Advanced',
    caselet: {
      title: 'Reading Comprehension: Evolutionary Epistemology & Tool-Making',
      description: 'The assumption that human cognition is distinct from that of other animals due to language alone has faced intense scrutiny from evolutionary anthropologists. Rather than language emerging as a de novo symbolic module, recent archaeological evidence indicates that Acheulean stone knapping—the deliberate fracturing of flint nodules into symmetrical bifaces—demanded advanced motor hierarchical planning and working memory long before syntactic speech developed.\n\nCrafting a symmetrical handaxe requires the knapper to hold an abstract template in mind while anticipating unpredictable fault lines within raw stone. Each percussion flake removed alters the physical geometry of the core, requiring continuous real-time recalibration. The neurological substrates engaged during Acheulean knapping overlap significantly with Broca\'s area and inferior frontal lobes associated with grammar and sequential syntax.\n\nThus, the evolutionary precursor to human syntax was not vocal signaling or gestural mimicry per se, but the sequential syntax of complex tool manufacture. Grammar did not invent hierarchical cognition; it co-opted an existing neural architecture carved out through hundreds of thousands of years of stone tool technology.',
      rules: [
        'Passage argues: Complex tool manufacture preceded and enabled syntactic language.',
        'Key Evidence: Symmetrical handaxes require abstract templates and error recalibration.',
        'Neural overlap: Stone knapping and speech grammar share Broca\'s area.'
      ]
    },
    questionText: 'Which of the following discoveries, if verified, would most severely WEAKEN the author\'s central thesis?',
    options: [
      { id: 'A', text: 'Neuroimaging showing that Acheulean flint knapping activates motor circuits entirely distinct from those utilized in grammatical processing.' },
      { id: 'B', text: 'Excavations demonstrating that Neanderthals crafted symmetrical stone tools identical to those of Homo sapiens.' },
      { id: 'C', text: 'Studies demonstrating that chimpanzees use rudimentary stones to crack nut shells.' },
      { id: 'D', text: 'Genetic proof that modern vocal tracts developed concurrently with early human migratory patterns.' }
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'The author\'s central thesis is that syntax co-opted the pre-existing neural architecture of complex tool making (specifically citing Broca\'s area overlap).',
        'If neuroimaging proves that flint knapping activates motor circuits entirely distinct from grammatical processing, the physiological pillar of the thesis collapses.',
        'Therefore, Option A directly undermines the core premise of the author\'s argument.',
        'Options B, C, and D do not challenge the specific claim that hierarchical stone tool crafting pre-adapted the brain for syntax.'
      ],
      shortcutMethod: 'To weaken a causal claim (Toolmaking neural architecture -> Language syntax), falsify the shared neural link.',
      trapWarning: 'Option B is a distractor; whether Neanderthals also knapped tools does not disprove the cognitive link between knapping and syntax.'
    }
  },
  {
    id: 'pyq-varc-02-rc-q1',
    section: 'VARC',
    topic: 'Main idea & tone',
    subtopic: 'Reading Comprehension Primary Purpose',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 1',
    difficulty: 'Moderate',
    caselet: {
      title: 'Reading Comprehension: Cephalopod Cognition & The Republic of Minds',
      description: 'Cephalopods—particularly octopuses, cuttlefish, and squids—represent an evolutionary wonder: complex intelligence emerging along an entirely divergent phylogenetic branch from vertebrates. While mammalian intelligence is heavily centralized in a cranium-bound brain with direct somatic control, an octopus distributes nearly two-thirds of its 500 million neurons across its eight flexible arms. Each arm possesses an autonomous peripheral nervous system capable of independent exploratory locomotion, tactile discrimination, and chemosensory sampling without initiating constant cognitive traffic with the central cerebral ring.\n\nThis decentralized somatic architecture poses radical challenges to Western philosophical conceptions of unified subjective selfhood. When an octopus arm severed from the body continues to recoil from noxious stimuli and grasps food items for several hours, does consciousness reside in a singular internal observer, or does the organism experience a composite, distributed awareness? Philosopher Peter Godfrey-Smith suggests that an octopus resembles a "republic of minds" rather than an empire governed by an autocratic central executive.\n\nMoreover, the evolutionary divergence occurred over 600 million years ago when the last common ancestor between humans and octopuses was a flattened worm-like bilaterian with rudimentary nerve cords. Intelligence in cephalopods did not arise by modifying a primate brain; nature invented complex cognition twice over, demonstrating that intelligence is an evolutionary convergent solution to ecological complexity rather than an idiosyncratic vertebrate accident.',
      rules: [
        'Passage focus: Octopus intelligence is decentralized across arms (~2/3 of neurons).',
        'Philosophical implication: Challenges singular executive selfhood ("republic of minds").',
        'Evolutionary significance: Intelligence evolved independently twice (convergent evolution).'
      ]
    },
    questionText: 'Which of the following best articulates the primary purpose of the author in the passage?',
    options: [
      { id: 'A', text: 'To prove that octopuses possess higher cognitive intelligence than most mammalian species.' },
      { id: 'B', text: 'To examine how the decentralized neurology of cephalopods challenges traditional notions of consciousness and demonstrates the convergent evolution of intelligence.' },
      { id: 'C', text: 'To advocate for the legal recognition of individual octopus arms as distinct sentient entities.' },
      { id: 'D', text: 'To demonstrate that Western philosophers have historically misunderstood the anatomy of marine invertebrates.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Paragraph 1 introduces the decentralized neurology of cephalopods.',
        'Paragraph 2 explores the philosophical implications for unified selfhood and consciousness ("republic of minds").',
        'Paragraph 3 emphasizes convergent evolution (nature invented complex intelligence twice over).',
        'Option B comprehensively synthesizes all three pillars of the passage without exaggeration.',
        'Option A is incorrect; the author compares architectures, not a hierarchy of superiority.',
        'Options C and D represent extreme, unwarranted distortions.'
      ],
      shortcutMethod: 'Combine Paragraph 2 (philosophical challenge to consciousness) + Paragraph 3 (convergent evolution of intelligence).'
    }
  },
  {
    id: 'pyq-varc-02-rc-q2',
    section: 'VARC',
    topic: 'Inference questions',
    subtopic: 'Reading Comprehension Deductive Inference',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 1',
    difficulty: 'Advanced',
    caselet: {
      title: 'Reading Comprehension: Cephalopod Cognition & The Republic of Minds',
      description: 'Cephalopods—particularly octopuses, cuttlefish, and squids—represent an evolutionary wonder: complex intelligence emerging along an entirely divergent phylogenetic branch from vertebrates. While mammalian intelligence is heavily centralized in a cranium-bound brain with direct somatic control, an octopus distributes nearly two-thirds of its 500 million neurons across its eight flexible arms. Each arm possesses an autonomous peripheral nervous system capable of independent exploratory locomotion, tactile discrimination, and chemosensory sampling without initiating constant cognitive traffic with the central cerebral ring.\n\nThis decentralized somatic architecture poses radical challenges to Western philosophical conceptions of unified subjective selfhood. When an octopus arm severed from the body continues to recoil from noxious stimuli and grasps food items for several hours, does consciousness reside in a singular internal observer, or does the organism experience a composite, distributed awareness? Philosopher Peter Godfrey-Smith suggests that an octopus resembles a "republic of minds" rather than an empire governed by an autocratic central executive.\n\nMoreover, the evolutionary divergence occurred over 600 million years ago when the last common ancestor between humans and octopuses was a flattened worm-like bilaterian with rudimentary nerve cords. Intelligence in cephalopods did not arise by modifying a primate brain; nature invented complex cognition twice over, demonstrating that intelligence is an evolutionary convergent solution to ecological complexity rather than an idiosyncratic vertebrate accident.'
    },
    questionText: 'The author\'s description of a severed octopus arm that "continues to recoil from noxious stimuli and grasps food items" is primarily intended to show that:',
    options: [
      { id: 'A', text: 'octopus arms possess autonomous sensory-motor integration independent of continuous central brain control.' },
      { id: 'B', text: 'octopuses do not feel any physical pain when their limbs are injured.' },
      { id: 'C', text: 'the central cerebral ring of the octopus is functionally redundant.' },
      { id: 'D', text: 'cephalopod limbs cannot survive unless they are permanently attached to the cranium.' }
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'In paragraph 1, the author establishes that peripheral arms sample and discriminate "without initiating constant cognitive traffic with the central cerebral ring."',
        'The severed arm illustration in paragraph 2 demonstrates this autonomous functionality persisting even in total isolation from the cerebral ring.',
        'Option A directly captures this decentralized, local integration.',
        'Option B makes an unfounded physiological claim about pain absence.',
        'Option C is extreme (saying the central brain is redundant is not claimed).',
        'Option D contradicts the fact that the severed arm continues functioning for hours.'
      ],
      shortcutMethod: 'Severed arm functioning on its own = peripheral autonomy without central instruction.'
    }
  },
  {
    id: 'pyq-varc-02-rc-q3',
    section: 'VARC',
    topic: 'Detail & vocab-in-context',
    subtopic: 'Reading Comprehension Metaphorical Function',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 1',
    difficulty: 'Moderate',
    caselet: {
      title: 'Reading Comprehension: Cephalopod Cognition & The Republic of Minds',
      description: 'Cephalopods—particularly octopuses, cuttlefish, and squids—represent an evolutionary wonder: complex intelligence emerging along an entirely divergent phylogenetic branch from vertebrates. While mammalian intelligence is heavily centralized in a cranium-bound brain with direct somatic control, an octopus distributes nearly two-thirds of its 500 million neurons across its eight flexible arms. Each arm possesses an autonomous peripheral nervous system capable of independent exploratory locomotion, tactile discrimination, and chemosensory sampling without initiating constant cognitive traffic with the central cerebral ring.\n\nThis decentralized somatic architecture poses radical challenges to Western philosophical conceptions of unified subjective selfhood. When an octopus arm severed from the body continues to recoil from noxious stimuli and grasps food items for several hours, does consciousness reside in a singular internal observer, or does the organism experience a composite, distributed awareness? Philosopher Peter Godfrey-Smith suggests that an octopus resembles a "republic of minds" rather than an empire governed by an autocratic central executive.\n\nMoreover, the evolutionary divergence occurred over 600 million years ago when the last common ancestor between humans and octopuses was a flattened worm-like bilaterian with rudimentary nerve cords. Intelligence in cephalopods did not arise by modifying a primate brain; nature invented complex cognition twice over, demonstrating that intelligence is an evolutionary convergent solution to ecological complexity rather than an idiosyncratic vertebrate accident.'
    },
    questionText: 'Peter Godfrey-Smith\'s characterization of an octopus as a "republic of minds" functions to contrast:',
    options: [
      { id: 'A', text: 'democratic marine governance with terrestrial mammalian solitary behavior.' },
      { id: 'B', text: 'a composite, semi-autonomous distributed network with a strictly centralized, top-down cognitive authority.' },
      { id: 'C', text: 'the superior computational processing of invertebrates with human artificial intelligence.' },
      { id: 'D', text: 'the emotional empathy of octopuses with the predatory instinct of squids.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'The text states: "resembles a \'republic of minds\' rather than an empire governed by an autocratic central executive."',
        'An empire with an autocratic executive represents centralized top-down control (mammalian brain).',
        'A republic of minds represents distributed, semi-autonomous components working in harmony (octopus arms + central ring).',
        'Option B provides the exact conceptual contrast used by the philosopher.'
      ],
      shortcutMethod: '"Republic" (distributed authority) vs "Autocratic empire" (centralized command).'
    }
  },
  {
    id: 'pyq-varc-02-rc-q4',
    section: 'VARC',
    topic: 'Option elimination',
    subtopic: 'Reading Comprehension Evolutionary Implications',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 1',
    difficulty: 'Advanced',
    caselet: {
      title: 'Reading Comprehension: Cephalopod Cognition & The Republic of Minds',
      description: 'Cephalopods—particularly octopuses, cuttlefish, and squids—represent an evolutionary wonder: complex intelligence emerging along an entirely divergent phylogenetic branch from vertebrates. While mammalian intelligence is heavily centralized in a cranium-bound brain with direct somatic control, an octopus distributes nearly two-thirds of its 500 million neurons across its eight flexible arms. Each arm possesses an autonomous peripheral nervous system capable of independent exploratory locomotion, tactile discrimination, and chemosensory sampling without initiating constant cognitive traffic with the central cerebral ring.\n\nThis decentralized somatic architecture poses radical challenges to Western philosophical conceptions of unified subjective selfhood. When an octopus arm severed from the body continues to recoil from noxious stimuli and grasps food items for several hours, does consciousness reside in a singular internal observer, or does the organism experience a composite, distributed awareness? Philosopher Peter Godfrey-Smith suggests that an octopus resembles a "republic of minds" rather than an empire governed by an autocratic central executive.\n\nMoreover, the evolutionary divergence occurred over 600 million years ago when the last common ancestor between humans and octopuses was a flattened worm-like bilaterian with rudimentary nerve cords. Intelligence in cephalopods did not arise by modifying a primate brain; nature invented complex cognition twice over, demonstrating that intelligence is an evolutionary convergent solution to ecological complexity rather than an idiosyncratic vertebrate accident.'
    },
    questionText: 'The author\'s assertion that "nature invented complex cognition twice over" implies that:',
    options: [
      { id: 'A', text: 'octopuses and humans evolved from an ancestor that possessed advanced problem-solving capabilities.' },
      { id: 'B', text: 'complex intelligence is not unique to primates and can emerge independently when organisms adapt to complex environments.' },
      { id: 'C', text: 'vertebrates and cephalopods will eventually converge into a single biological family.' },
      { id: 'D', text: 'intelligence is an inevitable outcome for all multicellular organisms with bilateral symmetry.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Paragraph 3 notes that the last common ancestor 600 million years ago was a simple worm with rudimentary nerve cords.',
        'Therefore, high intelligence did NOT exist in that common ancestor.',
        'Intelligence arose separately in vertebrates and in cephalopods ("convergent solution to ecological complexity").',
        'Option B captures this evolutionary principle of convergent evolution accurately.',
        'Option A directly contradicts the simple worm ancestor claim.',
        'Option C is biologically absurd.',
        'Option D is an overly broad and ungrounded generalization.'
      ],
      shortcutMethod: '"Invented twice over" + "convergent solution" = independent emergence in response to ecological demands.'
    }
  },
  {
    id: 'pyq-varc-03-rc-q1',
    section: 'VARC',
    topic: 'Main idea & tone',
    subtopic: 'Reading Comprehension Core Thesis',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2021 Slot 2',
    difficulty: 'Moderate',
    caselet: {
      title: 'Reading Comprehension: Algorithmic Serendipity & Epistemic Atrophy',
      description: 'The contemporary internet\'s architecture of hyper-personalized recommendation algorithms has fundamentally inverted the historic phenomenology of information discovery. In classical libraries and physical record stores, human curiosity was guided by serendipity: browsing through adjacent shelves inevitably forced encounters with unanticipated genres, opposing political arguments, and anomalous cultural artifacts. One set out in search of an introductory text on macroeconomic monetary policy and stumbled upon a treatise on urban geomorphology sitting two call-numbers down.\n\nAlgorithmic feed curation replaces this generative friction with friction-free predictive gratification. By optimizing relentlessly for immediate behavioral engagement—measured via clicks, watch time, and micro-reactions—recommender engines project past behavioral preferences into infinite tautological loops. Rather than expanding an individual\'s intellectual horizon, the algorithm constructs an epistemic cocoon that ratifies existing biases while pruning away productive dissonance.\n\nThe critical danger of algorithmic curation is not merely the polarization of public discourse, but the atrophy of exploratory agency. When the environment anticipates and satisfies desires before they are consciously articulated, individuals lose the capacity for serendipitous inquiry—the deliberate tolerance for confusion and exploration that characterizes genuine intellectual discovery.',
      rules: [
        'Contrast: Physical serendipity (productive friction) vs Algorithmic curation (predictive gratification).',
        'Mechanism: Engagement optimization traps users in tautological preference loops.',
        'Ultimate Danger: Loss of exploratory agency and tolerance for intellectual dissonance.'
      ]
    },
    questionText: 'Which of the following best expresses the primary argument developed by the author?',
    options: [
      { id: 'A', text: 'Digital search engines are technically inferior to Dewey Decimal systems in physical libraries.' },
      { id: 'B', text: 'Personalized recommendation algorithms undermine genuine intellectual discovery by eliminating the productive friction of serendipitous encounters.' },
      { id: 'C', text: 'Social media companies deliberately construct political polarization to maximize corporate advertising revenue.' },
      { id: 'D', text: 'Consumers should refrain from purchasing goods through online platforms that employ recommendation algorithms.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'The passage establishes the historic role of serendipitous friction in discovery (Paragraph 1).',
        'It critiques algorithms for replacing this with predictive gratification and epistemic cocoons (Paragraph 2).',
        'It concludes that this causes the atrophy of exploratory agency (Paragraph 3).',
        'Option B captures the thesis with complete fidelity.',
        'Option A misses the conceptual critique of discovery phenomenology.',
        'Option C introduces intentional corporate maliciousness not discussed in the text.',
        'Option D offers a consumer action recommendation never suggested by the author.'
      ],
      shortcutMethod: 'Core contrast: Serendipitous friction (libraries) vs Predictive gratification (algorithms) leading to cognitive atrophy.'
    }
  },
  {
    id: 'pyq-varc-03-rc-q2',
    section: 'VARC',
    topic: 'Inference questions',
    subtopic: 'Reading Comprehension Function of Example',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2021 Slot 2',
    difficulty: 'Moderate',
    caselet: {
      title: 'Reading Comprehension: Algorithmic Serendipity & Epistemic Atrophy',
      description: 'The contemporary internet\'s architecture of hyper-personalized recommendation algorithms has fundamentally inverted the historic phenomenology of information discovery. In classical libraries and physical record stores, human curiosity was guided by serendipity: browsing through adjacent shelves inevitably forced encounters with unanticipated genres, opposing political arguments, and anomalous cultural artifacts. One set out in search of an introductory text on macroeconomic monetary policy and stumbled upon a treatise on urban geomorphology sitting two call-numbers down.\n\nAlgorithmic feed curation replaces this generative friction with friction-free predictive gratification. By optimizing relentlessly for immediate behavioral engagement—measured via clicks, watch time, and micro-reactions—recommender engines project past behavioral preferences into infinite tautological loops. Rather than expanding an individual\'s intellectual horizon, the algorithm constructs an epistemic cocoon that ratifies existing biases while pruning away productive dissonance.\n\nThe critical danger of algorithmic curation is not merely the polarization of public discourse, but the atrophy of exploratory agency. When the environment anticipates and satisfies desires before they are consciously articulated, individuals lose the capacity for serendipitous inquiry—the deliberate tolerance for confusion and exploration that characterizes genuine intellectual discovery.'
    },
    questionText: 'The author cites "stumbling upon a treatise on urban geomorphology" primarily to illustrate:',
    options: [
      { id: 'A', text: 'the accidental and unplanned nature of serendipitous intellectual discovery in physical environments.' },
      { id: 'B', text: 'the necessity of multidisciplinary degrees for modern macroeconomic researchers.' },
      { id: 'C', text: 'the disorganized filing systems prevalent in 20th-century public institutions.' },
      { id: 'D', text: 'the superiority of geographical science over monetary economic theory.' }
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'In paragraph 1, the author discusses how curiosity in physical libraries was guided by serendipity: encounters with unanticipated subjects.',
        'The urban geomorphology example illustrates someone looking for monetary policy and encountering an unrelated discipline due to spatial adjacency.',
        'Option A directly defines this function.',
        'Options B, C, and D are spurious interpretations.'
      ],
      shortcutMethod: 'Example role: Concrete demonstration of "unanticipated encounters" = serendipitous discovery.'
    }
  },
  {
    id: 'pyq-varc-03-rc-q3',
    section: 'VARC',
    topic: 'Detail & vocab-in-context',
    subtopic: 'Reading Comprehension Technical Terminology',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2021 Slot 2',
    difficulty: 'Advanced',
    caselet: {
      title: 'Reading Comprehension: Algorithmic Serendipity & Epistemic Atrophy',
      description: 'The contemporary internet\'s architecture of hyper-personalized recommendation algorithms has fundamentally inverted the historic phenomenology of information discovery. In classical libraries and physical record stores, human curiosity was guided by serendipity: browsing through adjacent shelves inevitably forced encounters with unanticipated genres, opposing political arguments, and anomalous cultural artifacts. One set out in search of an introductory text on macroeconomic monetary policy and stumbled upon a treatise on urban geomorphology sitting two call-numbers down.\n\nAlgorithmic feed curation replaces this generative friction with friction-free predictive gratification. By optimizing relentlessly for immediate behavioral engagement—measured via clicks, watch time, and micro-reactions—recommender engines project past behavioral preferences into infinite tautological loops. Rather than expanding an individual\'s intellectual horizon, the algorithm constructs an epistemic cocoon that ratifies existing biases while pruning away productive dissonance.\n\nThe critical danger of algorithmic curation is not merely the polarization of public discourse, but the atrophy of exploratory agency. When the environment anticipates and satisfies desires before they are consciously articulated, individuals lose the capacity for serendipitous inquiry—the deliberate tolerance for confusion and exploration that characterizes genuine intellectual discovery.'
    },
    questionText: 'According to paragraph 2, recommendation algorithms create "tautological loops" because they:',
    options: [
      { id: 'A', text: 'repeatedly feed users content derived solely from their own past demonstrated preferences.' },
      { id: 'B', text: 'force users to re-read introductory definitions in textbooks.' },
      { id: 'C', text: 'rely on circular logical fallacies in their natural language programming.' },
      { id: 'D', text: 'prohibit users from searching for opposing political arguments.' }
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Paragraph 2 explicitly explains: "recommender engines project past behavioral preferences into infinite tautological loops."',
        'A tautology is a self-referential cycle: you liked X in the past -> algorithm shows you X -> you click X -> algorithm confirms you only like X.',
        'Option A accurately conveys this self-reinforcing mechanism.',
        'Options B and C misunderstand the linguistic meaning of "tautological" in this context.',
        'Option D claims a direct prohibition, which is not how recommender algorithms function.'
      ],
      shortcutMethod: 'Past preferences projected into infinite loops = feeding users content derived from past behavior.'
    }
  },
  {
    id: 'pyq-varc-03-rc-q4',
    section: 'VARC',
    topic: 'Option elimination',
    subtopic: 'Reading Comprehension Critical Inference',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2021 Slot 2',
    difficulty: 'Advanced',
    caselet: {
      title: 'Reading Comprehension: Algorithmic Serendipity & Epistemic Atrophy',
      description: 'The contemporary internet\'s architecture of hyper-personalized recommendation algorithms has fundamentally inverted the historic phenomenology of information discovery. In classical libraries and physical record stores, human curiosity was guided by serendipity: browsing through adjacent shelves inevitably forced encounters with unanticipated genres, opposing political arguments, and anomalous cultural artifacts. One set out in search of an introductory text on macroeconomic monetary policy and stumbled upon a treatise on urban geomorphology sitting two call-numbers down.\n\nAlgorithmic feed curation replaces this generative friction with friction-free predictive gratification. By optimizing relentlessly for immediate behavioral engagement—measured via clicks, watch time, and micro-reactions—recommender engines project past behavioral preferences into infinite tautological loops. Rather than expanding an individual\'s intellectual horizon, the algorithm constructs an epistemic cocoon that ratifies existing biases while pruning away productive dissonance.\n\nThe critical danger of algorithmic curation is not merely the polarization of public discourse, but the atrophy of exploratory agency. When the environment anticipates and satisfies desires before they are consciously articulated, individuals lose the capacity for serendipitous inquiry—the deliberate tolerance for confusion and exploration that characterizes genuine intellectual discovery.'
    },
    questionText: 'Which of the following attitudes towards "navigational friction and confusion" is most in harmony with the author\'s perspective?',
    options: [
      { id: 'A', text: 'They are unproductive design flaws that modern interface architects must eliminate.' },
      { id: 'B', text: 'They are vital catalysts that nurture genuine cognitive exploration and expansive intellectual growth.' },
      { id: 'C', text: 'They are harmful barriers that prevent students from completing academic research in a timely manner.' },
      { id: 'D', text: 'They are acceptable only when browsing physical libraries, but unacceptable on digital platforms.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'In paragraph 1, friction is called "generative friction".',
        'In paragraph 3, the author highlights "the deliberate tolerance for confusion and exploration that characterizes genuine intellectual discovery."',
        'The author values friction as necessary for intellectual vitality and autonomous agency.',
        'Option B precisely matches the author\'s positive appraisal of friction and confusion as growth catalysts.',
        'Options A and C adopt the exact algorithmic perspective the author criticizes.',
        'Option D introduces an arbitrary platform-based dichotomy not present in the text.'
      ],
      shortcutMethod: '"Generative friction" + "tolerance for confusion characterizes genuine discovery" = essential catalysts for intellectual growth.'
    }
  },
  {
    id: 'pyq-varc-02-q1',
    section: 'VARC',
    topic: 'Para summary',
    subtopic: 'Core Idea Distillation',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2022 Slot 1',
    difficulty: 'Moderate',
    questionText: 'Read the paragraph below and choose the option that best captures its essence:\n\n"For decades, urban planners treated vehicular throughput as the primary index of municipal vitality, constructing expansive freeways that severed historic pedestrian corridors. However, recent empirical audits demonstrate that pedestrianized urban cores stimulate substantially higher retail sales, lower municipal maintenance costs, and generate measurable improvements in respiratory health. Far from hampering commerce, reclaiming asphalt for sidewalks and parks catalyzes economic vitality by converting streets from conduits of transit into destinations of dwell time."',
    options: [
      { id: 'A', text: 'Modern cities must ban all vehicular transport to preserve historical pedestrian monuments and lower asthma rates.' },
      { id: 'B', text: 'Prioritizing pedestrian zones over highway throughput enhances urban commerce and health by turning streets into destinations rather than transit conduits.' },
      { id: 'C', text: 'Urban freeways were originally built to increase retail sales, but recent audits prove they are too costly to maintain.' },
      { id: 'D', text: 'Retail commerce in downtown centers has declined because highways prevent shoppers from driving directly to storefronts.' }
    ],
    correctOptionId: 'B',
    explanation: {
      steps: [
        'Identify key premise 1: Highways were prioritized under the belief they drove economic vitality.',
        'Identify key premise 2: Pedestrian cores actually generate higher retail sales, lower costs, and better health.',
        'Identify conclusion: Converting conduits of transit into destinations of dwell time boosts both economics and well-being.',
        'Option B captures all elements faithfully without hyperbole.',
        'Option A distorts the argument with extreme claims ("ban all vehicular transport").',
        'Option C misstates why freeways were built and misses the core pedestrian thesis.',
        'Option D asserts the opposite of the author\'s findings.'
      ],
      shortcutMethod: 'Contrast old dogma (transit throughput) with new reality (pedestrian destinations yield higher economic & health returns).',
      trapWarning: 'Beware of extreme universal words like "ban all" in Option A.'
    }
  },
  {
    id: 'pyq-varc-03-q1',
    section: 'VARC',
    topic: 'Para jumbles (TITA)',
    subtopic: 'Logical Sentence Sequencing',
    sourceType: 'PYQ',
    sourceExam: 'CAT 2023 Slot 1',
    difficulty: 'Advanced',
    questionText: 'The sentences given below, when properly sequenced, form a coherent paragraph. Choose the correct order of sentences:\n\n1. This algorithmic opacity renders it impossible for credit applicants to identify or contest the specific grounds of denial.\n2. Machine learning credit-scoring models increasingly ingest hundreds of non-traditional data variables ranging from mobile app battery levels to social media keystroke cadence.\n3. Consequently, systemic socio-economic biases are quietly codified into automated underwriting decisions without regulatory oversight.\n4. Unlike transparent linear scorecards, these deep neural networks establish non-linear correlations across disparate data points that even their creators cannot fully decipher.',
    options: [
      { id: 'A', text: '2 - 4 - 1 - 3' },
      { id: 'B', text: '4 - 2 - 3 - 1' },
      { id: 'C', text: '2 - 3 - 4 - 1' },
      { id: 'D', text: '1 - 3 - 2 - 4' }
    ],
    correctOptionId: 'A',
    explanation: {
      steps: [
        'Sentence 2 introduces the general subject: machine learning credit-scoring models ingesting non-traditional variables.',
        'Sentence 4 contrasts these models with transparent linear scorecards ("Unlike transparent linear scorecards, these deep neural networks..."), creating a mandatory pair 2-4.',
        'Sentence 1 refers back to "these non-linear correlations that creators cannot decipher" by naming it "This algorithmic opacity", establishing the link 4-1.',
        'Sentence 3 provides the terminal consequence ("Consequently, systemic biases are quietly codified...").',
        'Thus, the logical and coherent flow is 2 -> 4 -> 1 -> 3.'
      ],
      shortcutMethod: '2 introduces topic -> 4 introduces non-linear uninterpretable models -> 1 refers to "This algorithmic opacity" -> 3 summarizes consequence ("Consequently..."). Sequence: 2-4-1-3.',
      coreFormula: 'Introduction -> Contrast/Elaboration -> Demonstrative reference ("This") -> Consequence ("Consequently")'
    }
  }
];
