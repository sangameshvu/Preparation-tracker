const fs = require('fs');
const path = require('path');

const brainDir = path.join(__dirname, '..', '..', 'brain', 'b256d23d-628b-464c-8c82-610c2b268009');
const excelDir = path.join(brainDir, 'scratch', 'excel_output');
const pdfDir = path.join(brainDir, 'scratch', 'pdf_output');
const outDir = path.join(__dirname, 'src', 'data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Phases
const phases = [
  {
    phaseNumber: 1,
    name: "Start right",
    description: "Diagnostic, pick resources, reading habit, Arithmetic basics",
    startWeek: 1,
    endWeek: 9,
    hoursMin: 10,
    hoursMax: 15
  },
  {
    phaseNumber: 2,
    name: "Finish the syllabus",
    description: "Finish every topic. Solve PYQs the same week you learn it",
    startWeek: 10,
    endWeek: 31,
    hoursMin: 15,
    hoursMax: 18
  },
  {
    phaseNumber: 3,
    name: "First revision",
    description: "Full revision round + 40-min sectional tests. Register for CAT",
    startWeek: 32,
    endWeek: 40,
    hoursMin: 18,
    hoursMax: 20
  },
  {
    phaseNumber: 4,
    name: "Mocks + analysis",
    description: "Full mocks + deep analysis + weak-topic fixing",
    startWeek: 41,
    endWeek: 51,
    hoursMin: 20,
    hoursMax: 25
  },
  {
    phaseNumber: 5,
    name: "Exam week",
    description: "Rest, light revision, exam day",
    startWeek: 52,
    endWeek: 52,
    hoursMin: 8,
    hoursMax: 10
  }
];
fs.writeFileSync(path.join(outDir, 'phases.ts'), `import { PrepPhase } from '../types';\n\nexport const initialPhases: PrepPhase[] = ${JSON.stringify(phases, null, 2)};\n`);
console.log('✓ Wrote phases.ts');

// 2. Topics (53 topics)
const rawTopics = JSON.parse(fs.readFileSync(path.join(excelDir, 'Topic_Tracker.json'), 'utf8'));
const topicsList = [];
let sortOrder = 1;
// Starting from row 6 where topics begin
for (let i = 6; i < rawTopics.length; i++) {
  const row = rawTopics[i];
  const section = row['Topic Tracker'];
  const area = row['__EMPTY'];
  const topicName = row['__EMPTY_1'];
  const subtopics = row['__EMPTY_2'] || '';
  const planWeek = row['__EMPTY_3'] || '';

  if (section && topicName && ['Quant', 'VARC', 'DILR'].includes(section)) {
    topicsList.push({
      id: `topic-${sortOrder}`,
      section: section,
      area: area || 'General',
      topicName: topicName,
      subtopics: subtopics,
      planWeek: String(planWeek),
      sortOrder: sortOrder++
    });
  }
}
fs.writeFileSync(path.join(outDir, 'topics.ts'), `import { TopicItem } from '../types';\n\nexport const initialTopics: TopicItem[] = ${JSON.stringify(topicsList, null, 2)};\n`);
console.log(`✓ Wrote topics.ts (${topicsList.length} topics)`);

// 3. Weekly Plans (52 weeks)
const rawWeekly = JSON.parse(fs.readFileSync(path.join(excelDir, 'Weekly_Plan.json'), 'utf8'));
const weeklyList = [];
for (let i = 2; i < rawWeekly.length; i++) {
  const row = rawWeekly[i];
  const weekNum = parseInt(row['Weekly Plan · 52 weeks'], 10);
  if (!isNaN(weekNum) && weekNum >= 1 && weekNum <= 52) {
    const isBuffer = [12, 19, 26].includes(weekNum);
    let phaseNumber = 1;
    const rawPhase = row['__EMPTY_3'] || '';
    if (rawPhase.startsWith('1')) phaseNumber = 1;
    else if (rawPhase.startsWith('2')) phaseNumber = 2;
    else if (rawPhase.startsWith('3')) phaseNumber = 3;
    else if (rawPhase.startsWith('4')) phaseNumber = 4;
    else if (rawPhase.startsWith('5')) phaseNumber = 5;

    weeklyList.push({
      id: `week-${weekNum}`,
      weekNumber: weekNum,
      startDate: '', // will be dynamically computed from start date
      endDate: '',
      monthLabel: row['__EMPTY_2'] || '',
      phaseNumber: phaseNumber,
      quantPlan: row['__EMPTY_4'] || '',
      varcPlan: row['__EMPTY_5'] || '',
      dilrPlan: row['__EMPTY_6'] || '',
      testsPlanned: row['__EMPTY_7'] || '',
      milestoneAdmin: row['__EMPTY_8'] || '',
      hoursTarget: row['__EMPTY_9'] || '10–12',
      status: 'Not started',
      myNotes: '',
      isBufferWeek: isBuffer
    });
  }
}
fs.writeFileSync(path.join(outDir, 'weeklyPlans.ts'), `import { WeeklyPlanItem } from '../types';\n\nexport const initialWeeklyPlans: WeeklyPlanItem[] = ${JSON.stringify(weeklyList, null, 2)};\n`);
console.log(`✓ Wrote weeklyPlans.ts (${weeklyList.length} weeks)`);

// 4. Free Resources (28 resources + links)
const rawResources = JSON.parse(fs.readFileSync(path.join(excelDir, 'Free_Resources.json'), 'utf8'));
const rawHyperlinks = JSON.parse(fs.readFileSync(path.join(excelDir, 'Free_Resources_hyperlinks.json'), 'utf8'));
const linkMap = {};
rawHyperlinks.forEach(h => {
  linkMap[h.ref] = h.target;
});

const resourcesList = [];
let resId = 1;

// Row 1 is video link
if (rawHyperlinks[0]) {
  resourcesList.push({
    id: `res-${resId++}`,
    section: 'Intro',
    resourceName: '▶ Watch the full video: How to Crack CAT Without Coaching Using Only Free Resources',
    intendedUsage: 'Orientation and prep mindset before starting week 1',
    url: rawHyperlinks[0].target,
    isFavorited: true,
    isCompleted: false
  });
}

// Starting from row 3 (which has index 3 in json)
for (let i = 3; i < rawResources.length; i++) {
  const row = rawResources[i];
  const section = row['Free Resources'];
  const name = row['__EMPTY'];
  const usage = row['__EMPTY_1'];
  if (section && name && usage && !section.startsWith('All free')) {
    // Hyperlinks are in column D (which corresponds to row index i + 3 in Excel)
    // Excel row numbers: Row 6 in Excel is index 3 in rawResources
    const excelRow = i + 3;
    const linkRef = `D${excelRow}`;
    const url = linkMap[linkRef] || 'https://www.youtube.com';
    resourcesList.push({
      id: `res-${resId++}`,
      section: section,
      resourceName: name,
      intendedUsage: usage,
      url: url,
      isFavorited: false,
      isCompleted: false
    });
  }
}
fs.writeFileSync(path.join(outDir, 'resources.ts'), `import { ResourceItem } from '../types';\n\nexport const initialResources: ResourceItem[] = ${JSON.stringify(resourcesList, null, 2)};\n`);
console.log(`✓ Wrote resources.ts (${resourcesList.length} resources)`);

// 5. Daily Routines (3 templates)
const routines = [
  {
    id: 'routine-1',
    classification: 'working_professional_weekday',
    title: 'Working Professional: Weekday',
    targetHours: 2.5,
    timeBlocks: [
      { timeRange: '06:30–07:15', activity: 'Reading: 1 article + 1 RC', section: 'VARC' },
      { timeRange: '07:15–08:00', activity: 'Quant: concept video / notes', section: 'Quant' },
      { timeRange: 'Commute', activity: 'Formula sheet / mistake log on phone', section: 'General' },
      { timeRange: 'Lunch break', activity: '1 DILR set (or 5 VA Qs)', section: 'DILR' },
      { timeRange: '21:30–22:30', activity: 'Quant practice: 15–20 Qs on this week\'s topic', section: 'Quant' }
    ]
  },
  {
    id: 'routine-2',
    classification: 'working_professional_weekend',
    title: 'Working Professional: Weekend',
    targetHours: 6.5,
    timeBlocks: [
      { timeRange: '08:00–10:00', activity: 'Topic tests / sectional / mock', section: 'General' },
      { timeRange: '10:30–12:30', activity: 'Analysis + mistake log', section: 'General' },
      { timeRange: '15:00–17:00', activity: 'Pending Quant topic + PYQs', section: 'Quant' },
      { timeRange: '17:30–18:30', activity: '2 DILR sets', section: 'DILR' },
      { timeRange: 'Evening', activity: 'Plan next week from \'Weekly Plan\'', section: 'General' }
    ]
  },
  {
    id: 'routine-3',
    classification: 'college_student_weekday',
    title: 'College Student: Weekday',
    targetHours: 3.75,
    timeBlocks: [
      { timeRange: '06:30–07:30', activity: 'Quant concepts', section: 'Quant' },
      { timeRange: 'Between classes', activity: 'Reading + 1 RC', section: 'VARC' },
      { timeRange: '17:00–18:00', activity: '2 DILR sets', section: 'DILR' },
      { timeRange: '20:00–21:30', activity: 'Quant practice + PYQs', section: 'Quant' },
      { timeRange: '21:30–22:00', activity: 'VA practice + update trackers', section: 'VARC' }
    ]
  }
];
fs.writeFileSync(path.join(outDir, 'routines.ts'), `import { DailyRoutineTemplate } from '../types';\n\nexport const initialRoutines: DailyRoutineTemplate[] = ${JSON.stringify(routines, null, 2)};\n`);
console.log('✓ Wrote routines.ts');

// 6. PDF Blueprint Guide Sections
const guideSections = [
  {
    id: 'guide-1',
    sectionKey: 'exam_structure',
    title: 'CAT Examination Structure & Format',
    sortOrder: 1,
    contentMarkdown: `### CAT Exam Architecture & Timing
- **Total Duration:** 120 Minutes (2 Hours)
- **Sections:** 3 Sequential Sections strictly timed at **40 Minutes each** (No section jumping allowed)
- **Total Questions:** 68 Questions (49 Multiple Choice Questions + 17 Non-MCQ / TITA Questions)

#### Sectional Breakdown:
| Section Name | What it Tests | Questions | Time Limit | MCQ Count | TITA Count |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **VARC** | English comprehension & verbal reasoning | 24 | 40 mins | 21 | 3 |
| **DILR** | Logical reasoning & data interpretation | 22 | 40 mins | 14 | 6 |
| **QA** | Mathematics & quantitative aptitude | 22 | 40 mins | 14 | 8 |
| **Total** | Full Comprehensive Test | **68** | **120 mins** | **49** | **17** |

#### Scoring Scheme:
- **+3 Marks** for every correct answer.
- **-1 Mark** for every incorrect Multiple Choice Question (MCQ).
- **0 Marks (No negative marking)** for incorrect Type-In-The-Answer (TITA) questions.`
  },
  {
    id: 'guide-2',
    sectionKey: 'strategy_90',
    title: 'Strategy for 90%+: Target Net Score Benchmarks',
    sortOrder: 2,
    contentMarkdown: `### Blueprint Target Scores for 90th Percentile+
*(Derived directly from the reference guide as bare-minimum raw score targets)*

- **VARC (Verbal Ability & Reading Comprehension):** **15 – 20** net score
- **DILR (Data Interpretation & Logical Reasoning):** **10** net score
- **QA (Quantitative Aptitude):** **5+** net score

> **Note on Strategy:** These raw score targets represent the minimum thresholds outlined in the preparation guide. Consistency across all three sections is required to clear sectional cutoffs at top IIMs and tier-1 business schools.`
  },
  {
    id: 'guide-3',
    sectionKey: 'weekly_schedule',
    title: 'Optimal Weekly Subject Allocation Schedule',
    sortOrder: 3,
    contentMarkdown: `### Recommended Daily Subject Distribution:
| Day | Primary Focus Areas |
| :--- | :--- |
| **Monday** | Arithmetic + DILR Problem Sets + Reading Comprehension (RC) |
| **Tuesday** | Algebra + DILR Problem Sets + Verbal Ability (VA) |
| **Wednesday** | Arithmetic + DILR Problem Sets + Reading Comprehension (RC) |
| **Thursday** | Geometry + DILR Problem Sets + Verbal Ability (VA) |
| **Friday** | Number Systems + DILR Problem Sets + Reading Comprehension (RC) |
| **Saturday** | Mixed Quant Practice + 40-Minute Sectional Tests |
| **Sunday** | Full 2-Hour Mock Test + Deep 3-Hour Analysis |`
  },
  {
    id: 'guide-4',
    sectionKey: 'qa_strategy',
    title: 'Quantitative Aptitude (QA): Topics & 9-Step Sequence',
    sortOrder: 4,
    contentMarkdown: `### Concepts to Master:
- **Arithmetic:** Percentages, profit and loss, ratios, averages, simple and compound interest, mixtures and alligations, partnerships, time and work, speed, distance and time.
- **Algebra:** Linear equations, quadratic equations, inequalities, functions, logarithms, sequences and progressions.
- **Number System:** Divisibility, factors, multiples, HCF and LCM, remainders (Fermat, Euler, Wilson), cyclicity.
- **Geometry & Mensuration:** Triangles, circles, quadrilaterals, polygons, area, perimeter, surface area, volume, coordinate geometry, trigonometry.
- **Modern Maths:** Permutations and combinations, probability, set theory.

### Recommended 9-Step Learning Sequence:
1. **Ratio and proportion** (Base of arithmetic)
2. **Profit and loss**
3. **Simple and compound interest**
4. **Mixtures and alligations**
5. **Time and work**
6. **Time, speed and distance**
7. **Number systems**
8. **Geometry and mensuration**
9. **Modern mathematics**`
  },
  {
    id: 'guide-5',
    sectionKey: 'dilr_strategy',
    title: 'Data Interpretation & Logical Reasoning (DILR)',
    sortOrder: 5,
    contentMarkdown: `### Data Interpretation Topics:
- Tables and caselets, Bar graphs, Line graphs, Pie charts, Mixed graphs, Data comparison, Data sufficiency.

### Logical Reasoning Topics:
- Linear seating arrangements, Circular seating arrangements, Selection and distribution, Scheduling problems, Games and tournaments, Blood relations, Ranking and ordering, Venn diagrams, Routes and networks, Conditional logic and puzzles.

### Recommended Problem-Set Sequence:
1. Tables and charts
2. Linear arrangements
3. Circular arrangements
4. Scheduling and distribution
5. Games and tournaments
6. Mixed and advanced puzzles

> **Key Rule from Guide:** *Don't just learn formulas. DILR is primarily about practising different types of problem sets rather than rote memorization.*`
  },
  {
    id: 'guide-6',
    sectionKey: 'varc_strategy',
    title: 'Verbal Ability & Reading Comprehension (VARC)',
    sortOrder: 6,
    contentMarkdown: `### Reading Comprehension (RC) Skills:
- Identify the central idea of a passage.
- Understand the author's perspective and tone.
- Identify assumptions and underlying arguments.
- Draw logical inferences (what is implied, not stated).
- Identify supporting and contradictory statements.

### Verbal Ability (VA) Question Types:
- Para jumbles (TITA - No negative marking)
- Para summaries
- Odd sentence out
- Sentence placement
- Paragraph completion

### Daily Preparation Guidelines:
- Read 1 or 2 long-form articles every day across economics, business, science, psychology, and philosophy.
- Practise reading without translating every sentence into your native language.
- Solve 2–3 reading comprehension passages regularly under untimed conditions initially, moving to timed (7–8 min/passage) in Phase 2.
- Focus on understanding the author's argument rather than memorising vocabulary.

> **Key Principle:** *Comprehension and contextual understanding are more important than memorising thousands of isolated English words.*`
  }
];
fs.writeFileSync(path.join(outDir, 'guideSections.ts'), `import { PrepGuideSection } from '../types';\n\nexport const initialGuideSections: PrepGuideSection[] = ${JSON.stringify(guideSections, null, 2)};\n`);
console.log('✓ Wrote guideSections.ts');

console.log('\nAll master datasets generated successfully!');
