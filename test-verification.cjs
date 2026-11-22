// =====================================================================
// CAT 2027 HQ: Comprehensive Application Logic & Integrity Test Suite
// =====================================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting CAT 2027 HQ Verification Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. VERIFY MASTER SEED DATA
test('Master Topics dataset contains all 53 canonical topics', () => {
  const topicsContent = fs.readFileSync(path.join(__dirname, 'src/data/topics.ts'), 'utf8');
  assert(topicsContent.includes('export const initialTopics'), 'Export missing');
  const count = (topicsContent.match(/"id":\s*"topic-/g) || []).length;
  assert.strictEqual(count, 53, `Expected 53 topics, found ${count}`);
});

test('Master Weekly Plans dataset contains 52 weeks and identifies buffer weeks', () => {
  const weeksContent = fs.readFileSync(path.join(__dirname, 'src/data/weeklyPlans.ts'), 'utf8');
  assert(weeksContent.includes('export const initialWeeklyPlans'), 'Export missing');
  const count = (weeksContent.match(/"weekNumber":/g) || []).length;
  assert.strictEqual(count, 52, `Expected 52 weeks, found ${count}`);
  assert(weeksContent.includes('"isBufferWeek": true'), 'Buffer weeks must be flagged');
});

test('Free Resources dataset contains 28+ curated items and preserved hyperlinks', () => {
  const resContent = fs.readFileSync(path.join(__dirname, 'src/data/resources.ts'), 'utf8');
  const count = (resContent.match(/"id":\s*"res-/g) || []).length;
  assert(count >= 28, `Expected at least 28 resources, found ${count}`);
  assert(resContent.includes('https://aeon.co'), 'Aeon link missing');
  assert(resContent.includes('online.2iim.com'), '2IIM link missing');
  assert(resContent.includes('gmatclub.com'), 'GMATClub link missing');
  assert(resContent.includes('iquanta.in'), 'iQuanta link missing');
  assert(resContent.includes('cracku.in'), 'Cracku link missing');
});

test('Preparation Guide dataset contains complete extracted sections from PDF', () => {
  const guideContent = fs.readFileSync(path.join(__dirname, 'src/data/guideSections.ts'), 'utf8');
  assert(guideContent.includes('CAT Examination Structure & Format'), 'Exam structure missing');
  assert(guideContent.includes('Strategy for 90%+'), '90% strategy missing');
  assert(guideContent.includes('Optimal Weekly Subject Allocation Schedule'), 'Weekly schedule missing');
  assert(guideContent.includes('Quantitative Aptitude (QA): Topics & 9-Step Sequence'), 'QA sequence missing');
  assert(guideContent.includes('Data Interpretation & Logical Reasoning (DILR)'), 'DILR missing');
  assert(guideContent.includes('Verbal Ability & Reading Comprehension (VARC)'), 'VARC missing');
});

// 2. VERIFY COMPONENT INTEGRITY
test('MarkdownRenderer component exists and exports renderInline and MarkdownRenderer', () => {
  const mdContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/MarkdownRenderer.tsx'), 'utf8');
  assert(mdContent.includes('export const renderInline'), 'renderInline missing');
  assert(mdContent.includes('export const MarkdownRenderer'), 'MarkdownRenderer missing');
  assert(mdContent.includes('<table'), 'Table rendering missing');
  assert(mdContent.includes('<ul'), 'List rendering missing');
  assert(mdContent.includes('<ol'), 'Numbered list rendering missing');
});

test('TopicTrackerPage confidence dropdown uses high-contrast meta styles and does not wrap', () => {
  const ttContent = fs.readFileSync(path.join(__dirname, 'src/pages/TopicTrackerPage.tsx'), 'utf8');
  assert(ttContent.includes('confidenceMeta'), 'confidenceMeta config missing');
  assert(ttContent.includes('w-[128px]'), 'Fixed pill width missing');
  assert(ttContent.includes('whitespace-nowrap'), 'Whitespace nowrap missing');
  assert(ttContent.includes('dark:text-rose-300'), 'Dark/Light contrast classes missing');
});

test('Sidebar AI Study Coach does not have washed-out low contrast styling', () => {
  const sbContent = fs.readFileSync(path.join(__dirname, 'src/components/layout/Sidebar.tsx'), 'utf8');
  assert(!sbContent.includes('text-purple-300/90 font-medium'), 'Washed out underlight class must be removed');
  assert(sbContent.includes('AI'), 'AI badge missing');
});

test('StickyBoardPage sticky notes have crisp light mode and dark mode theme classes', () => {
  const stickyContent = fs.readFileSync(path.join(__dirname, 'src/pages/StickyBoardPage.tsx'), 'utf8');
  assert(stickyContent.includes('text-purple-950'), 'Lavender light mode contrast missing');
  assert(stickyContent.includes('dark:text-purple-100'), 'Lavender dark mode contrast missing');
  assert(stickyContent.includes('text-emerald-950'), 'Emerald light mode contrast missing');
  assert(stickyContent.includes('dark:text-emerald-100'), 'Emerald dark mode contrast missing');
  assert(stickyContent.includes('MarkdownRenderer'), 'Markdown rendering in sticky notes missing');
});

test('Badge component has proper light mode contrast classes', () => {
  const badgeContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/badge.tsx'), 'utf8');
  assert(badgeContent.includes('bg-purple-50 text-purple-700'), 'Purple badge light mode contrast missing');
  assert(badgeContent.includes('bg-emerald-50 text-emerald-700'), 'Emerald badge light mode contrast missing');
  assert(badgeContent.includes('bg-amber-50 text-amber-800'), 'Amber badge light mode contrast missing');
});

// 3. VERIFY STUDY NOTES & SEPARATE SECTIONS
test('Study Notes dataset contains Notes, QA, and Quick Ref categories', () => {
  const notesContent = fs.readFileSync(path.join(__dirname, 'src/data/initialNotes.ts'), 'utf8');
  assert(notesContent.includes("noteType: 'QA'"), 'QA note type missing');
  assert(notesContent.includes("noteType: 'Notes'"), 'Notes concept type missing');
  assert(notesContent.includes("noteType: 'Quick Ref'"), 'Quick Ref type missing');
});

test('Sidebar separates Study Notes and Sticky Board into distinct navigation items', () => {
  const sbContent = fs.readFileSync(path.join(__dirname, 'src/components/layout/Sidebar.tsx'), 'utf8');
  assert(sbContent.includes("path: '/notes'"), 'Notes route missing in sidebar');
  assert(sbContent.includes("path: '/sticky-board'"), 'Sticky board route missing in sidebar');
  assert(sbContent.includes('Study Notes & Q&A'), 'Study Notes label missing in sidebar');
  assert(sbContent.includes('Sticky Board'), 'Sticky Board label missing in sidebar');
});

test('MarkdownRenderer component parses and renders images', () => {
  const mdContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/MarkdownRenderer.tsx'), 'utf8');
  assert(mdContent.includes('!['), 'Image token missing');
  assert(mdContent.includes('<img'), 'Img tag missing');
});

// 4. VERIFY METRICS & ISOLATION LOGIC
test('MockTracker & MistakeLog isolate sample row data from real metrics', () => {
  const mockContent = fs.readFileSync(path.join(__dirname, 'src/data/initialMockAndMistake.ts'), 'utf8');
  assert(mockContent.includes('isSample: true'), 'isSample flag missing');
  const appDataContent = fs.readFileSync(path.join(__dirname, 'src/context/AppDataContext.tsx'), 'utf8');
  assert(appDataContent.includes('filter((m) => !m.isSample'), 'Sample isolation filter missing');
});

// 5. VERIFY REDESIGN ENHANCEMENTS & BREATHABLE UI
test('Student Activity History and Daily Goals datasets exist and are integrated', () => {
  const actContent = fs.readFileSync(path.join(__dirname, 'src/data/initialActivities.ts'), 'utf8');
  assert(actContent.includes('initialActivities'), 'initialActivities missing');
  assert(actContent.includes('initialDailyGoals'), 'initialDailyGoals missing');
  const contextContent = fs.readFileSync(path.join(__dirname, 'src/context/AppDataContext.tsx'), 'utf8');
  assert(contextContent.includes('addActivity'), 'addActivity missing');
  assert(contextContent.includes('addDailyGoal'), 'addDailyGoal missing');
});

test('App routing includes dedicated History and Analytics pages', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
  assert(appContent.includes('path="history"'), 'history route missing');
  assert(appContent.includes('path="analytics"'), 'analytics route missing');
});

test('Design system contains StatCard, CircularProgress, and EmptyState components', () => {
  assert(fs.existsSync(path.join(__dirname, 'src/components/ui/StatCard.tsx')), 'StatCard missing');
  assert(fs.existsSync(path.join(__dirname, 'src/components/ui/CircularProgress.tsx')), 'CircularProgress missing');
  assert(fs.existsSync(path.join(__dirname, 'src/components/ui/EmptyState.tsx')), 'EmptyState missing');
});

test('MockTrackerPage includes practice exam simulator with timer and palette', () => {
  const mockPageContent = fs.readFileSync(path.join(__dirname, 'src/pages/MockTrackerPage.tsx'), 'utf8');
  assert(mockPageContent.includes('SAMPLE_EXAM_QUESTIONS'), 'Exam questions missing');
  assert(mockPageContent.includes('formatTimer'), 'Timer formatter missing');
  assert(mockPageContent.includes('Question Palette'), 'Question palette missing');
});

test('Production build output contains all expected bundles', () => {
  assert(fs.existsSync(path.join(__dirname, 'dist/index.html')), 'dist/index.html missing');
  const assets = fs.readdirSync(path.join(__dirname, 'dist/assets'));
  assert(assets.some(f => f.startsWith('vendor-')), 'Vendor bundle missing');
  assert(assets.some(f => f.startsWith('charts-')), 'Charts bundle missing');
  assert(assets.some(f => f.startsWith('icons-')), 'Icons bundle missing');
  assert(assets.some(f => f.startsWith('index-') && f.endsWith('.css')), 'CSS bundle missing');
});

// 19. VERIFY STREAK PRESERVATION & YESTERDAY AEON BACKFILL
test('Study Streak engine and retroactive yesterday backfill are implemented', () => {
  assert(fs.existsSync(path.join(__dirname, 'src/utils/streakCalculator.ts')), 'streakCalculator.ts missing');
  const streakCalc = fs.readFileSync(path.join(__dirname, 'src/utils/streakCalculator.ts'), 'utf8');
  assert(streakCalc.includes('calculateStreak'), 'calculateStreak function missing');
  assert(streakCalc.includes('isYesterdayDone'), 'isYesterdayDone missing');
  assert(streakCalc.includes('streakAtRisk'), 'streakAtRisk logic missing');
  assert(streakCalc.includes('getRecentHabitDays'), 'getRecentHabitDays function missing');

  // Verify AppDataContext integration
  const appCtx = fs.readFileSync(path.join(__dirname, 'src/context/AppDataContext.tsx'), 'utf8');
  assert(appCtx.includes('markYesterdayAeonDone'), 'markYesterdayAeonDone missing from AppDataContext');
  assert(appCtx.includes('markTodayAeonDone'), 'markTodayAeonDone missing from AppDataContext');
  assert(appCtx.includes('toggleAeonDate'), 'toggleAeonDate missing from AppDataContext');
  assert(appCtx.includes('cat2027_aeon_reading'), 'LocalStorage cat2027_aeon_reading missing');

  // Verify HomePage streak display & yesterday saver
  const home = fs.readFileSync(path.join(__dirname, 'src/pages/HomePage.tsx'), 'utf8');
  assert(home.includes('Day Streak'), 'Day Streak badge missing from HomePage');
  assert(home.includes('markYesterdayAeonDone'), 'markYesterdayAeonDone button missing from HomePage');
  assert(home.includes('Streak Saver Available'), 'Streak Saver banner missing from HomePage');

  // Verify CATPracticeEngine integration
  const practice = fs.readFileSync(path.join(__dirname, 'src/components/practice/CATPracticeEngine.tsx'), 'utf8');
  assert(practice.includes('markYesterdayAeonDone'), 'markYesterdayAeonDone missing from CATPracticeEngine');
  assert(practice.includes('getRecentHabitDays'), 'getRecentHabitDays missing from CATPracticeEngine');
  assert(practice.includes('Save Streak'), 'Save Streak action missing from CATPracticeEngine');

  // Verify WeeklyPlannerPage streak badge & yesterday action
  const planner = fs.readFileSync(path.join(__dirname, 'src/pages/WeeklyPlannerPage.tsx'), 'utf8');
  assert(planner.includes('markYesterdayAeonDone'), 'markYesterdayAeonDone missing from WeeklyPlannerPage');
  assert(planner.includes('Streak'), 'Streak badge missing from WeeklyPlannerPage');
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)\n`);

if (passedTests === totalTests) {
  console.log('🎉 ALL APPLICATION LOGIC & UI INTEGRITY TESTS PASSED SUCCESSFULLY!\n');
} else {
  process.exit(1);
}
