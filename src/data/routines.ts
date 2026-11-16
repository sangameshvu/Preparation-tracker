import { DailyRoutineTemplate } from '../types';

export const initialRoutines: DailyRoutineTemplate[] = [
  {
    "id": "routine-1",
    "classification": "working_professional_weekday",
    "title": "Working Professional: Weekday",
    "targetHours": 2.5,
    "timeBlocks": [
      {
        "timeRange": "06:30–07:15",
        "activity": "Reading: 1 article + 1 RC",
        "section": "VARC"
      },
      {
        "timeRange": "07:15–08:00",
        "activity": "Quant: concept video / notes",
        "section": "Quant"
      },
      {
        "timeRange": "Commute",
        "activity": "Formula sheet / mistake log on phone",
        "section": "General"
      },
      {
        "timeRange": "Lunch break",
        "activity": "1 DILR set (or 5 VA Qs)",
        "section": "DILR"
      },
      {
        "timeRange": "21:30–22:30",
        "activity": "Quant practice: 15–20 Qs on this week's topic",
        "section": "Quant"
      }
    ]
  },
  {
    "id": "routine-2",
    "classification": "working_professional_weekend",
    "title": "Working Professional: Weekend",
    "targetHours": 6.5,
    "timeBlocks": [
      {
        "timeRange": "08:00–10:00",
        "activity": "Topic tests / sectional / mock",
        "section": "General"
      },
      {
        "timeRange": "10:30–12:30",
        "activity": "Analysis + mistake log",
        "section": "General"
      },
      {
        "timeRange": "15:00–17:00",
        "activity": "Pending Quant topic + PYQs",
        "section": "Quant"
      },
      {
        "timeRange": "17:30–18:30",
        "activity": "2 DILR sets",
        "section": "DILR"
      },
      {
        "timeRange": "Evening",
        "activity": "Plan next week from 'Weekly Plan'",
        "section": "General"
      }
    ]
  },
  {
    "id": "routine-3",
    "classification": "college_student_weekday",
    "title": "College Student: Weekday",
    "targetHours": 3.75,
    "timeBlocks": [
      {
        "timeRange": "06:30–07:30",
        "activity": "Quant concepts",
        "section": "Quant"
      },
      {
        "timeRange": "Between classes",
        "activity": "Reading + 1 RC",
        "section": "VARC"
      },
      {
        "timeRange": "17:00–18:00",
        "activity": "2 DILR sets",
        "section": "DILR"
      },
      {
        "timeRange": "20:00–21:30",
        "activity": "Quant practice + PYQs",
        "section": "Quant"
      },
      {
        "timeRange": "21:30–22:00",
        "activity": "VA practice + update trackers",
        "section": "VARC"
      }
    ]
  }
];
