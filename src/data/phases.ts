import { PrepPhase } from '../types';

export const initialPhases: PrepPhase[] = [
  {
    "phaseNumber": 1,
    "name": "Start right",
    "description": "Diagnostic, pick resources, reading habit, Arithmetic basics",
    "startWeek": 1,
    "endWeek": 9,
    "hoursMin": 10,
    "hoursMax": 15
  },
  {
    "phaseNumber": 2,
    "name": "Finish the syllabus",
    "description": "Finish every topic. Solve PYQs the same week you learn it",
    "startWeek": 10,
    "endWeek": 31,
    "hoursMin": 15,
    "hoursMax": 18
  },
  {
    "phaseNumber": 3,
    "name": "First revision",
    "description": "Full revision round + 40-min sectional tests. Register for CAT",
    "startWeek": 32,
    "endWeek": 40,
    "hoursMin": 18,
    "hoursMax": 20
  },
  {
    "phaseNumber": 4,
    "name": "Mocks + analysis",
    "description": "Full mocks + deep analysis + weak-topic fixing",
    "startWeek": 41,
    "endWeek": 51,
    "hoursMin": 20,
    "hoursMax": 25
  },
  {
    "phaseNumber": 5,
    "name": "Exam week",
    "description": "Rest, light revision, exam day",
    "startWeek": 52,
    "endWeek": 52,
    "hoursMin": 8,
    "hoursMax": 10
  }
];
