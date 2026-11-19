import { StudyNoteItem } from '../types';

export const initialStudyNotes: StudyNoteItem[] = [
  {
    id: 'note-1',
    title: 'Fermat & Euler Remainder Theorems: Solved CAT Benchmark Problems',
    section: 'Quant',
    noteType: 'QA',
    topic: 'Remainders',
    createdAt: '2026-11-16',
    updatedAt: '2026-11-16',
    images: [],
    isPinned: true,
    syncedWithGoogleDocs: true,
    googleDocId: '1FermatEuler-Remainders-2027-DocId',
    googleDocsUrl: 'https://docs.google.com/document/d/1FermatEuler-Remainders-2027-DocId/edit',
    content: `### Problem Breakdown (Solved Q&A):

#### Question:
Find the remainder when **3^{2026} + 5^{2027}** is divided by **17**.

---

### Step-by-Step Solution & Method:

#### 1. Part A: Remainder of $3^{2026} \\pmod{17}$
- Since **17** is prime and $\\gcd(3, 17) = 1$, apply **Fermat's Little Theorem**:
  $$a^{p-1} \\equiv 1 \\pmod{p} \\implies 3^{16} \\equiv 1 \\pmod{17}$$
- Divide the exponent 2026 by 16:
  $$2026 = 16 \\times 126 + 10$$
- Therefore:
  $$3^{2026} \\equiv (3^{16})^{126} \\times 3^{10} \\equiv 1 \\times 3^{10} \\pmod{17}$$
- Evaluating $3^{10} \\pmod{17}$:
  - $3^3 = 27 \\equiv 10 \\pmod{17}$
  - $3^6 = 100 \\equiv 15 \\equiv -2 \\pmod{17}$
  - $3^{10} = 3^6 \\times 3^4 = (-2) \\times 81 \\equiv (-2) \\times 13 = -26 \\equiv 8 \\pmod{17}$
- **Remainder for Part A = 8**

#### 2. Part B: Remainder of $5^{2027} \\pmod{17}$
- Again by Fermat's Theorem: $5^{16} \\equiv 1 \\pmod{17}$
- Divide 2027 by 16: $2027 = 16 \\times 126 + 11$
- $5^{2027} \\equiv 5^{11} \\pmod{17}$
  - $5^2 = 25 \\equiv 8 \\pmod{17}$
  - $5^4 = 64 \\equiv 13 \\equiv -4 \\pmod{17}$
  - $5^8 \\equiv (-4)^2 = 16 \\equiv -1 \\pmod{17}$
  - $5^{11} = 5^8 \\times 5^2 \\times 5^1 \\equiv (-1) \\times 8 \\times 5 = -40 \\equiv 11 \\pmod{17}$
- **Remainder for Part B = 11**

#### Final Combination:
- Total Remainder = $(8 + 11) \\pmod{17} = 19 \\pmod{17} = \\mathbf{2}$

> **Rule for Exam:** When dividing by a prime $P$, always reduce exponent modulo $(P - 1)$ first. It cuts computation time by 80%.`
  },
  {
    id: 'note-2',
    title: 'Circular & Linear Arrangements: Core Deduction Matrix',
    section: 'DILR',
    noteType: 'Notes',
    topic: 'Circular arrangements',
    createdAt: '2026-11-15',
    updatedAt: '2026-11-15',
    images: [],
    isPinned: true,
    syncedWithGoogleDocs: true,
    googleDocId: '1CircularLinear-DILR-2027-DocId',
    googleDocsUrl: 'https://docs.google.com/document/d/1CircularLinear-DILR-2027-DocId/edit',
    content: `### Core Rules for Circular Arrangements (DILR):

#### 1. Directional Orientation Matrix:
| Facing | Left Movement | Right Movement | Opposite Person |
| :--- | :--- | :--- | :--- |
| **Facing Center** | Clockwise | Counter-clockwise | At $(N/2)$ positions for even $N$ |
| **Facing Away** | Counter-clockwise | Clockwise | At $(N/2)$ positions for even $N$ |

#### 2. Four Golden Rules for Set Selection & Solving:
1. **Never start with negative clues:** Skip "A does not sit next to B" initially.
2. **Anchor the absolute positions first:** Begin with clues that link at least 2 people to fixed reference points (e.g. "B sits third to the left of C").
3. **Dual-Case Branching:** If a clue leads to only 2 configurations, draw both circles immediately rather than trying to hold them in working memory.
4. **The 8-Minute Cutoff:** If 0 solid deductions are made within 8 minutes of starting a DILR set, abandon and move to the next set immediately.`
  },
  {
    id: 'note-3',
    title: 'Reading Comprehension: Author Tone Identification Quick Reference',
    section: 'VARC',
    noteType: 'Quick Ref',
    topic: 'RC Tone',
    createdAt: '2026-11-14',
    updatedAt: '2026-11-14',
    images: [],
    isPinned: false,
    syncedWithGoogleDocs: true,
    googleDocId: '1AuthorTone-VARC-2027-DocId',
    googleDocsUrl: 'https://docs.google.com/document/d/1AuthorTone-VARC-2027-DocId/edit',
    content: `### Master Author Tone Reference Card (CAT VARC)

#### 1. Analytical & Objective Tones:
- **Detached / Objective:** Neutral presentation of facts, data, and contrasting perspectives without emotional words.
- **Expository / Informative:** Explains how a mechanism, historical event, or scientific phenomenon works.

#### 2. Critical & Skeptical Tones:
- **Acerbic / Vitriolic:** Harsh, biting criticism with stinging or contemptuous language.
- **Cynical:** Believes people or institutions act solely out of selfish motives.
- **Skeptical / Questioning:** Doubts conventional claims and demands stronger evidentiary proof.

#### 3. Praising & Supportive Tones:
- **Eulogistic / Laudatory:** High praise, admiring contributions or historical figures.
- **Reverent:** Deep respect, awe, and veneration (common in art and philosophy passages).

#### 4. Cautionary & Prescriptive Tones:
- **Didactic:** Educational tone intended to instruct morality or proper procedure.
- **Admonitory / Cautionary:** Warning of grave negative consequences if current trends persist.

> **Elimination Rule:** Extreme tones (*vitriolic, fanatical, ecstatic*) are rarely the correct answer in CAT RC unless the text is extraordinarily biased.`
  },
  {
    id: 'note-4',
    title: 'Comprehensive CAT Exam Strategy & 3-Round Test Attempting Protocol',
    section: 'General',
    noteType: 'Notes',
    topic: 'General',
    createdAt: '2026-11-17',
    updatedAt: '2026-11-17',
    images: [],
    isPinned: true,
    syncedWithGoogleDocs: true,
    googleDocId: '1GeneralExamStrategy-2027-DocId',
    googleDocsUrl: 'https://docs.google.com/document/d/1GeneralExamStrategy-2027-DocId/edit',
    content: `### Universal 3-Round Test Strategy (Applicable to QA, DILR & VARC):

#### 1. Round 1: Fast Pick & Immediate Wins (Minutes 0–18)
- Target easy direct questions only (high accuracy, low computational load).
- Mark solvable-but-lengthy questions with 'Review' immediately.
- If a question takes more than 60 seconds without a clear path, skip without ego.

#### 2. Round 2: Marked Review Problems (Minutes 18–34)
- Attack the problems flagged during Round 1.
- Focus on clean calculations, cross-checking intermediate steps to prevent arithmetic slips.

#### 3. Round 3: Strategic Set Closures (Minutes 34–40)
- Lock in final answers, verify input TITA formatting, and confirm no misread negative constraints.
- Never guess blindly on non-TITA questions in the final 2 minutes.`
  }
];
