import { MockTestItem, MistakeItem } from '../types';

export const initialMockTests: MockTestItem[] = [
  {
    id: 'mock-1',
    mockNumber: 1,
    testDate: '2027-09-05',
    seriesName: 'Example: SIMCAT 1',
    varcAttempts: 16,
    varcScore: 30,
    dilrAttempts: 10,
    dilrScore: 21,
    qaAttempts: 14,
    qaScore: 26,
    totalAttempts: 40,
    totalScore: 77,
    percentile: 82.5,
    analysisDone: true,
    biggestLesson: 'Spent 14 min on one DILR set. Rule: switch sets at 8 min if no progress',
    isSample: true, // Marked as sample data
  },
  // Template slots for mocks 2-40
  ...Array.from({ length: 39 }, (_, i) => ({
    id: `mock-${i + 2}`,
    mockNumber: i + 2,
    analysisDone: false,
    isSample: false,
  })),
];

export const initialMistakes: MistakeItem[] = [
  {
    id: 'mistake-1',
    date: '2027-09-05',
    source: 'Example: SIMCAT 1',
    section: 'Quant',
    topic: 'Remainders',
    questionRef: 'Q 18',
    mistakeType: 'Concept gap',
    whatWentWrong: "Didn't know Euler's theorem, tried long division",
    ruleForNextTime: 'If divisor & base are co-prime, try Euler first',
    revisitDate: '2027-09-12',
    reSolved: false,
    isSample: true, // Marked as sample data
  },
];
