# CAT 2027 HQ – AI-Powered CAT Preparation & Progress Management Platform

A modern, high-performance web platform combining task management (JIRA), organized notes and resources (Notion), analytical telemetry (Stripe), and intelligent coaching for CAT 2027 aspirants.

Built directly from the master study roadmap (`CAT_2027_Study_Planner by Riyalizations.xlsx`) and the complete pedagogical blueprint (`CAT Preparation.pdf`).

---

## 🌟 Key Features & Modules

1. **CAT Command Centre (Dashboard / Home):**
   - Dynamic overview: Overall % completion, current week of 52, days to target exam, topic mastery tally, mock stats, pending & overdue mistakes queue.
   - Today's Focus: Actionable daily checklist with multi-stage status, priority toggling, and study time tracking.
   - Interactive Recharts: Progress curve, weekly study hours, subject breakdown, mock score trajectories, confidence heatmap, and mistake distributions.
   - Quick Actions: Shortcuts to log a mock, record an error, schedule a task, or add a sticky note.
   - Interactive CAT 2027 Blueprint: Complete exam structure, section targets (90%ile benchmark), weekly subject distribution, and recommended topic learning sequences.

2. **Weekly Planner (52 Weeks):**
   - 4 Interactive Views: Weekly Sprint, JIRA Kanban Board, Calendar Roadmap, and Compact Data Table.
   - Dynamic 52-week calendar automatically recalibrates start and end dates whenever the preparation start date is changed in settings.
   - Highlights buffer and revision weeks (Weeks 12, 19, and 26).

3. **Topic Tracker (53 Master Topics):**
   - 25 Quantitative Aptitude, 18 Data Interpretation & Logical Reasoning, and 10 Verbal Ability topics.
   - Multi-stage tracking: Concept Notes, Practice Sets, Past Year Questions (PYQs), Revision 1, Revision 2.
   - 5-point confidence rating (Level 1: Novice to Level 5: Mastered) driving the weak-topic diagnostic engine.

4. **Mock Tracker (40 Slots):**
   - Sectional attempt and score breakdown (VARC, DILR, QA) with auto-calculated total attempts and scores.
   - Percentile tracking and graphical trajectory visualization.
   - Comprehensive Post-Test Debrief Dossier: What went well, what went wrong, skipped questions, time management slips, and remedial action plan.
   - Isolated sample mock (SIMCAT 1) excluded from real analytics until adopted.

5. **Mistake Log (300 Slots):**
   - 7 canonical mistake categories from the CAT workbook.
   - Automated 7-day spaced repetition revisit queue with overdue visual badges.
   - Direct linking to topics and mock exams.

6. **Free Resources Repository (28 Curated Links):**
   - 29 active web hyperlinks preserved from the Excel master sheet across Quant, DILR, VARC, Reading lists (Aeon, Guardian, New Yorker), past papers, and mock series.
   - Personal favorites, completion toggles, and usage counters.

7. **Daily Routines:**
   - 3 pre-built time-block schedule templates: Working Professional (Weekday & Weekend) and College Student.
   - Visual time-block timeline and interactive block editor.

8. **CAT Preparation Guide:**
   - Complete extraction of `CAT Preparation.pdf` organized into 8 rich markdown sections.
   - In-app admin markdown editor to refine advice or add personal strategy notes.

9. **AI Study Coach & Preparation Analyst:**
   - Live context ingestion: Reads your actual current week, syllabus completion %, weak topics list, mock scores, and overdue mistake queue.
   - Instant action proposals: Directly schedules remedial tasks and mistake reviews.
   - Connects to Supabase Edge Functions with Gemini/OpenAI API, falling back to a deterministic local coach when working offline.

10. **Sticky Board:**
    - Interactive 2D drag-and-drop idea canvas with 6 color palettes, pin toggling, and relational linking to topics and mocks.

11. **Profile & Settings:**
    - Dynamic start date picker triggering automatic 52-week plan date recalculation.
    - Full JSON data backup export and factory reset restore.

12. **Admin Panel:**
    - Direct inline table editing of weekly plans, master topics, free resources, and guide markdown articles.

---

## 🛠 Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Sonner.
- **Backend / DB:** Supabase PostgreSQL 15+, Supabase Auth, Row Level Security (RLS).
- **Edge Functions:** Supabase Edge Functions (Deno / TypeScript) for AI Coach API requests.
- **Deployment:** Netlify with automated continuous deployment and SPA redirect routing.

---

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/your-username/cat-2027-hq.git
cd cat-2027-hq

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔐 Supabase Configuration

1. Create a new Supabase project at [https://database.new](https://database.new).
2. Copy `.env.example` to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Run the database migration script in `supabase/migrations/20261116000001_cat_2027_hq_schema.sql` inside the Supabase SQL Editor.
4. (Optional) Deploy the AI Coach Edge Function:
   ```bash
   supabase functions deploy chat-study-coach
   supabase secrets set GEMINI_API_KEY=your-gemini-api-key
   ```

---

## 🌐 Netlify Deployment

1. Push your repository to GitHub.
2. In Netlify, create a new site from your GitHub repository.
3. Build Settings are auto-detected via `netlify.toml`:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Netlify Site Configuration -> Environment Variables.
5. Deploy!
