import { PrepGuideSection } from '../types';

export const initialGuideSections: PrepGuideSection[] = [
  {
    "id": "guide-1",
    "sectionKey": "exam_structure",
    "title": "CAT Examination Structure & Format",
    "sortOrder": 1,
    "contentMarkdown": "### CAT Exam Architecture & Timing\n- **Total Duration:** 120 Minutes (2 Hours)\n- **Sections:** 3 Sequential Sections strictly timed at **40 Minutes each** (No section jumping allowed)\n- **Total Questions:** 68 Questions (49 Multiple Choice Questions + 17 Non-MCQ / TITA Questions)\n\n#### Sectional Breakdown:\n| Section Name | What it Tests | Questions | Time Limit | MCQ Count | TITA Count |\n| :--- | :--- | :---: | :---: | :---: | :---: |\n| **VARC** | English comprehension & verbal reasoning | 24 | 40 mins | 21 | 3 |\n| **DILR** | Logical reasoning & data interpretation | 22 | 40 mins | 14 | 6 |\n| **QA** | Mathematics & quantitative aptitude | 22 | 40 mins | 14 | 8 |\n| **Total** | Full Comprehensive Test | **68** | **120 mins** | **49** | **17** |\n\n#### Scoring Scheme:\n- **+3 Marks** for every correct answer.\n- **-1 Mark** for every incorrect Multiple Choice Question (MCQ).\n- **0 Marks (No negative marking)** for incorrect Type-In-The-Answer (TITA) questions."
  },
  {
    "id": "guide-2",
    "sectionKey": "strategy_90",
    "title": "Strategy for 90%+: Target Net Score Benchmarks",
    "sortOrder": 2,
    "contentMarkdown": "### Blueprint Target Scores for 90th Percentile+\n*(Derived directly from the reference guide as bare-minimum raw score targets)*\n\n- **VARC (Verbal Ability & Reading Comprehension):** **15 – 20** net score\n- **DILR (Data Interpretation & Logical Reasoning):** **10** net score\n- **QA (Quantitative Aptitude):** **5+** net score\n\n> **Note on Strategy:** These raw score targets represent the minimum thresholds outlined in the preparation guide. Consistency across all three sections is required to clear sectional cutoffs at top IIMs and tier-1 business schools."
  },
  {
    "id": "guide-3",
    "sectionKey": "weekly_schedule",
    "title": "Optimal Weekly Subject Allocation Schedule",
    "sortOrder": 3,
    "contentMarkdown": "### New Alternating Study Plan: Daily VARC + Alternating QA & DI\n\n- **Daily Core Habit:** **VARC every single day** (Daily editorial reading, RC passage analysis & VA drills).\n- **Weekdays (Mon–Fri):** Alternating between **Quantitative Aptitude (QA)** and **Data Interpretation (DI)**.\n- **Weekends (Sat & Sun):** Dedicated to **comprehensive revision** of everything studied during that particular week.\n\n#### Week Type A (Odd Weeks: 1, 3, 5...):\n| Day | Primary Focus Area | Description |\n| :--- | :--- | :--- |\n| **Monday** | **VARC + QA** | Daily RC/VA + Quantitative Aptitude concept theory & problem drills |\n| **Tuesday** | **VARC + DI** | Daily RC/VA + Data Interpretation set practice (Tables, Caselets) |\n| **Wednesday** | **VARC + QA** | Daily RC/VA + Quantitative Aptitude problem-solving & formulas |\n| **Thursday** | **VARC + DI** | Daily RC/VA + Data Interpretation set practice (Charts, Graphs) |\n| **Friday** | **VARC + QA** | Daily RC/VA + Quantitative Aptitude PYQs, speed drills & problem sets |\n| **Saturday** | **Weekly Revision** | Consolidate and re-solve all QA, DI & VARC topics covered this week |\n| **Sunday** | **Weekly Revision & Review** | Deep error log revisit, formula sheet update & weekly recap |\n\n#### Week Type B (Even Weeks: 2, 4, 6...):\n*(Since previous Friday concluded with QA, Monday alternates to DI)*\n| Day | Primary Focus Area | Description |\n| :--- | :--- | :--- |\n| **Monday** | **VARC + DI** | Daily RC/VA + Data Interpretation set practice (Tables, Caselets) |\n| **Tuesday** | **VARC + QA** | Daily RC/VA + Quantitative Aptitude concept theory & problem drills |\n| **Wednesday** | **VARC + DI** | Daily RC/VA + Data Interpretation set practice (Charts, Graphs) |\n| **Thursday** | **VARC + QA** | Daily RC/VA + Quantitative Aptitude problem-solving & formulas |\n| **Friday** | **VARC + DI** | Daily RC/VA + Advanced DI problem sets & reasoning puzzles |\n| **Saturday** | **Weekly Revision** | Consolidate and re-solve all DI, QA & VARC topics covered this week |\n| **Sunday** | **Weekly Revision & Review** | Deep error log revisit, formula sheet update & weekly recap |"
  },
  {
    "id": "guide-4",
    "sectionKey": "qa_strategy",
    "title": "Quantitative Aptitude (QA): Topics & 9-Step Sequence",
    "sortOrder": 4,
    "contentMarkdown": "### Concepts to Master:\n- **Arithmetic:** Percentages, profit and loss, ratios, averages, simple and compound interest, mixtures and alligations, partnerships, time and work, speed, distance and time.\n- **Algebra:** Linear equations, quadratic equations, inequalities, functions, logarithms, sequences and progressions.\n- **Number System:** Divisibility, factors, multiples, HCF and LCM, remainders (Fermat, Euler, Wilson), cyclicity.\n- **Geometry & Mensuration:** Triangles, circles, quadrilaterals, polygons, area, perimeter, surface area, volume, coordinate geometry, trigonometry.\n- **Modern Maths:** Permutations and combinations, probability, set theory.\n\n### Recommended 9-Step Learning Sequence:\n1. **Ratio and proportion** (Base of arithmetic)\n2. **Profit and loss**\n3. **Simple and compound interest**\n4. **Mixtures and alligations**\n5. **Time and work**\n6. **Time, speed and distance**\n7. **Number systems**\n8. **Geometry and mensuration**\n9. **Modern mathematics**"
  },
  {
    "id": "guide-5",
    "sectionKey": "dilr_strategy",
    "title": "Data Interpretation & Logical Reasoning (DILR)",
    "sortOrder": 5,
    "contentMarkdown": "### Data Interpretation Topics:\n- Tables and caselets, Bar graphs, Line graphs, Pie charts, Mixed graphs, Data comparison, Data sufficiency.\n\n### Logical Reasoning Topics:\n- Linear seating arrangements, Circular seating arrangements, Selection and distribution, Scheduling problems, Games and tournaments, Blood relations, Ranking and ordering, Venn diagrams, Routes and networks, Conditional logic and puzzles.\n\n### Recommended Problem-Set Sequence:\n1. Tables and charts\n2. Linear arrangements\n3. Circular arrangements\n4. Scheduling and distribution\n5. Games and tournaments\n6. Mixed and advanced puzzles\n\n> **Key Rule from Guide:** *Don't just learn formulas. DILR is primarily about practising different types of problem sets rather than rote memorization.*"
  },
  {
    "id": "guide-6",
    "sectionKey": "varc_strategy",
    "title": "Verbal Ability & Reading Comprehension (VARC)",
    "sortOrder": 6,
    "contentMarkdown": "### Reading Comprehension (RC) Skills:\n- Identify the central idea of a passage.\n- Understand the author's perspective and tone.\n- Identify assumptions and underlying arguments.\n- Draw logical inferences (what is implied, not stated).\n- Identify supporting and contradictory statements.\n\n### Verbal Ability (VA) Question Types:\n- Para jumbles (TITA - No negative marking)\n- Para summaries\n- Odd sentence out\n- Sentence placement\n- Paragraph completion\n\n### Daily Preparation Guidelines:\n- Read 1 or 2 long-form articles every day across economics, business, science, psychology, and philosophy.\n- Practise reading without translating every sentence into your native language.\n- Solve 2–3 reading comprehension passages regularly under untimed conditions initially, moving to timed (7–8 min/passage) in Phase 2.\n- Focus on understanding the author's argument rather than memorising vocabulary.\n\n> **Key Principle:** *Comprehension and contextual understanding are more important than memorising thousands of isolated English words.*"
  }
];
