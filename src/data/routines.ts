import { DailyRoutineTemplate } from '../types';

export const initialRoutines: DailyRoutineTemplate[] = [
  {
    "id": "routine-1",
    "classification": "working_professional_weekday",
    "title": "Working Professional: Weekday (Daily VARC + Alternating DI/QA)",
    "targetHours": 2.5,
    "timeBlocks": [
      {
        "timeRange": "06:30–07:15",
        "activity": "Daily VARC: 1 Long Editorial + 1 RC Passage Analysis",
        "section": "VARC"
      },
      {
        "timeRange": "07:15–08:00",
        "activity": "Alternating Core: DI Concepts (DI days) or Quant Theory (QA days)",
        "section": "General"
      },
      {
        "timeRange": "Commute",
        "activity": "Formula sheet & mobile mistake log review",
        "section": "General"
      },
      {
        "timeRange": "Lunch break",
        "activity": "Daily VARC: 5 Verbal Ability Questions (PJ / PS)",
        "section": "VARC"
      },
      {
        "timeRange": "21:30–22:30",
        "activity": "Alternating Practice: 2 DI Sets (DI days) or 15–20 Quant Qs (QA days)",
        "section": "General"
      }
    ]
  },
  {
    "id": "routine-2",
    "classification": "working_professional_weekend",
    "title": "Working Professional: Weekend (Comprehensive Weekly Revision)",
    "targetHours": 6.5,
    "timeBlocks": [
      {
        "timeRange": "08:00–10:30",
        "activity": "Weekly Revision: Re-solve week's toughest DI sets & Quant problems",
        "section": "General"
      },
      {
        "timeRange": "11:00–13:00",
        "activity": "Mistake Log Audit: Revisit and clear all un-resolved errors",
        "section": "General"
      },
      {
        "timeRange": "15:00–17:00",
        "activity": "Weekly Sectional Practice & Mock Analysis",
        "section": "General"
      },
      {
        "timeRange": "17:30–18:30",
        "activity": "Formula consolidation & update spatial Sticky Board",
        "section": "General"
      },
      {
        "timeRange": "Evening",
        "activity": "Plan coming week's alternating schedule & verify deliverables",
        "section": "General"
      }
    ]
  },
  {
    "id": "routine-3",
    "classification": "college_student_weekday",
    "title": "College Student: Weekday (Daily VARC + Alternating DI/QA)",
    "targetHours": 3.75,
    "timeBlocks": [
      {
        "timeRange": "06:30–07:30",
        "activity": "Daily VARC: 1 Aeon/Guardian Editorial + 1 RC deep dive",
        "section": "VARC"
      },
      {
        "timeRange": "Between classes",
        "activity": "Daily VARC: Para summary & Para jumbles drills (10 Qs)",
        "section": "VARC"
      },
      {
        "timeRange": "17:00–18:30",
        "activity": "Alternating Core: DI Caselets (DI days) or Quant Concepts (QA days)",
        "section": "General"
      },
      {
        "timeRange": "20:00–21:30",
        "activity": "Alternating Problem Drill: Timed DI sets or Quant exercises",
        "section": "General"
      },
      {
        "timeRange": "21:30–22:00",
        "activity": "Day wrap-up: Update daily trackers and log tricky questions",
        "section": "General"
      }
    ]
  }
];
