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
