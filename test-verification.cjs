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

// 20. VERIFY CALENDAR IN STUDY HISTORY & COMPLETED + PENDING GOALS
test('Calendar in Study History section displays selected day goals (completed & pending)', () => {
  const historyContent = fs.readFileSync(path.join(__dirname, 'src/pages/HistoryPage.tsx'), 'utf8');
  assert(historyContent.includes('Study History Calendar'), 'Study History Calendar title missing');
  assert(historyContent.includes('startOfMonth') && historyContent.includes('eachDayOfInterval'), 'Month interval missing');
  assert(historyContent.includes('goalsFilter'), 'Goals completed/pending filter missing');
  assert(historyContent.includes('toggleDailyGoal'), 'toggleDailyGoal missing from HistoryPage');
  assert(historyContent.includes('addDailyGoal'), 'addDailyGoal missing from HistoryPage');
  assert(historyContent.includes('Completed ✓') && historyContent.includes('Pending'), 'Completed and Pending badges missing');
  assert(historyContent.includes('All Goals Done'), 'All Goals Done legend missing');
  assert(historyContent.includes('Pending Goals'), 'Pending Goals legend missing');

  // Verify initialDailyGoals includes seed completed and pending goals
  const initAct = fs.readFileSync(path.join(__dirname, 'src/data/initialActivities.ts'), 'utf8');
  assert(initAct.includes('initialDailyGoals'), 'initialDailyGoals missing');
  assert(initAct.includes('completed: true') && initAct.includes('completed: false'), 'Completed & Pending initial daily goals missing');
});

// 21. VERIFY STICKY BOARD WORD-LIKE MARKDOWN CANVAS & METADATA INTAKE
test('Sticky Board retains name, provides Word-like markdown canvas editor, preview cards, and metadata intake modal', () => {
  const stickyContent = fs.readFileSync(path.join(__dirname, 'src/pages/StickyBoardPage.tsx'), 'utf8');
  
  // Feature naming
  assert(stickyContent.includes('Sticky Board'), 'Feature name Sticky Board missing');
  assert(stickyContent.includes('Word Canvas & Markdown Editor'), 'Word canvas tagline missing');

  // Initial Metadata intake modal
  assert(stickyContent.includes('New Sticky Board Note Setup') || stickyContent.includes('metadataModalOpen'), 'Metadata intake modal missing');
  assert(stickyContent.includes('Note Name / Title *'), 'Note title field missing in intake modal');
  assert(stickyContent.includes('Purpose / Category *'), 'Purpose field missing in intake modal');
  assert(stickyContent.includes('Subject Section *'), 'Section field missing in intake modal');
  assert(stickyContent.includes('Open Word Canvas Editor'), 'Open Word Canvas Editor button missing');

  // Word-like Canvas Toolbar & Modes
  assert(stickyContent.includes('insertFormatting'), 'Formatting helper missing');
  assert(stickyContent.includes('insertQATemplate'), 'Q&A template helper missing');
  assert(stickyContent.includes('insertFormulaTemplate'), 'Formula table template helper missing');
  assert(stickyContent.includes('handleImageUpload'), 'Notebook scan upload helper missing');
  assert(stickyContent.includes('Split View') && stickyContent.includes('Formatted Word View'), 'Canvas modes missing');

  // Preview Cards & Lightbox
  assert(stickyContent.includes('Open Canvas'), 'Open Canvas card action missing');
  assert(stickyContent.includes('setReadingNote'), 'Read note action missing');
  assert(stickyContent.includes('setLightboxImage'), 'Lightbox scan action missing');

  // Types verification
  const typesContent = fs.readFileSync(path.join(__dirname, 'src/types/index.ts'), 'utf8');
  assert(typesContent.includes('title?: string') && typesContent.includes('purpose?: string'), 'StickyNoteItem metadata fields missing');
  assert(typesContent.includes('images?: NoteImageItem[]'), 'StickyNoteItem images field missing');
});

// 22. VERIFY STICKY NOTE SQUARE SHAPE & UNIFORM DIMENSIONS
test('Sticky notes in Sticky Board are rendered in uniform square shapes with curved edges', () => {
  const stickyContent = fs.readFileSync(path.join(__dirname, 'src/pages/StickyBoardPage.tsx'), 'utf8');
  assert(stickyContent.includes('aspect-square'), 'Sticky note preview card missing aspect-square class');
  assert(stickyContent.includes('rounded-2xl') || stickyContent.includes('rounded-3xl'), 'Curved edges missing from sticky card');
  assert(stickyContent.includes('min-h-0'), 'min-h-0 container constraint missing to prevent vertical elongation');
  assert(stickyContent.includes('overflow-hidden'), 'overflow-hidden boundary missing');
});

// 23. VERIFY USER PROFILE PRESERVATION, NON-DEFAULT GUEST MODE, MULTI-PROFILE SUPPORT & EMPTY LOGIN INPUTS
test('User profile created for Sangamesh is preserved in registry, guest is default, login inputs start blank, and multi-profile signup is supported', () => {
  const appDataContent = fs.readFileSync(path.join(__dirname, 'src/context/AppDataContext.tsx'), 'utf8');
  assert(appDataContent.includes('sangamesh.vu@gmail.com'), 'Sangamesh email credential missing in AppDataContext');
  assert(appDataContent.includes('Sangamesh.vu@'), 'Sangamesh password credential missing in AppDataContext');
  assert(appDataContent.includes('user-sangamesh-vu'), 'Sangamesh user profile ID missing');
  assert(appDataContent.includes('GUEST_PROFILE'), 'GUEST_PROFILE missing');
  assert(appDataContent.includes('DEFAULT_PROFILE: UserProfile = GUEST_PROFILE'), 'Default profile must be GUEST_PROFILE');
  assert(appDataContent.includes('registeredProfiles'), 'registeredProfiles state missing');
  assert(appDataContent.includes('signup = async'), 'signup function missing in AppDataContext');
  assert(appDataContent.includes('syncDataToCloudVault'), 'syncDataToCloudVault method missing');
  assert(appDataContent.includes('importDataFromCloudVault'), 'importDataFromCloudVault method missing');

  // Verify AuthModal exists, starts with blank inputs, and supports signup
  const authModalContent = fs.readFileSync(path.join(__dirname, 'src/components/auth/AuthModal.tsx'), 'utf8');
  assert(authModalContent.includes("useState('')"), 'Form inputs must start blank in AuthModal');
  assert(!authModalContent.includes('1-Click Sign In as Sangamesh'), '1-Click auto-login shortcut must be removed');
  assert(authModalContent.includes('signup'), 'signup must be used in AuthModal');
  assert(authModalContent.includes('Create a New CAT Profile') || authModalContent.includes('Create Profile'), 'Create profile tab missing in AuthModal');
  assert(authModalContent.includes('syncDataToCloudVault'), 'Vault sync missing from AuthModal');

  // Verify ProfileSettingsPage handles guest mode and displays credentials when authenticated
  const profilePageContent = fs.readFileSync(path.join(__dirname, 'src/pages/ProfileSettingsPage.tsx'), 'utf8');
  assert(profilePageContent.includes('Viewing as Guest Aspirant'), 'Guest state missing from ProfileSettingsPage');
  assert(profilePageContent.includes('Database Status:'), 'Database status missing from ProfileSettingsPage');
});

// 24. VERIFY RENAMING OF FREE RESOURCES TO RESOURCES
test('Free Resources is renamed to Resources across Sidebar, TopNav, and Resources Library page', () => {
  const sidebarContent = fs.readFileSync(path.join(__dirname, 'src/components/layout/Sidebar.tsx'), 'utf8');
  assert(sidebarContent.includes("name: 'Resources'"), "Sidebar navigation label must be 'Resources'");
  assert(!sidebarContent.includes("name: 'Free Resources'"), "Sidebar navigation must not be 'Free Resources'");

  const topNavContent = fs.readFileSync(path.join(__dirname, 'src/components/layout/TopNav.tsx'), 'utf8');
  assert(topNavContent.includes("if (path.startsWith('/resources')) return 'Resources';"), "TopNav title must be 'Resources'");

  const resourcesPageContent = fs.readFileSync(path.join(__dirname, 'src/pages/FreeResourcesPage.tsx'), 'utf8');
  assert(resourcesPageContent.includes('Resources Library'), "Header title must be 'Resources Library'");
  assert(resourcesPageContent.includes('Curated directory of hand-picked CAT preparation resources'), 'Subtitle missing');
});

// 25. VERIFY STUDY FOCUS TIMER, PICTURE-IN-PICTURE (PIP) ENGINE, AND STUDY TIME LOGGING
test('Study Focus Timer provides full pause/resume controls, Picture-in-Picture (Document & Video PiP), and logs study time to activity history', () => {
  const timerContext = fs.readFileSync(path.join(__dirname, 'src/context/StudyTimerContext.tsx'), 'utf8');
  assert(timerContext.includes('documentPictureInPicture'), 'Document Picture-in-Picture support missing in StudyTimerContext');
  assert(timerContext.includes('captureStream'), 'Video Picture-in-Picture canvas stream fallback missing');
  assert(timerContext.includes('pauseTimer'), 'pauseTimer function missing');
  assert(timerContext.includes('resumeTimer'), 'resumeTimer function missing');
  assert(timerContext.includes('togglePause'), 'togglePause function missing');
  assert(timerContext.includes('stopAndLog'), 'stopAndLog function missing');
  assert(timerContext.includes('resetTimer'), 'resetTimer function missing');
  assert(timerContext.includes('category: \'study\''), 'Activity logging with category study missing');
  assert(timerContext.includes('cat2027_active_study_timer'), 'Storage persistence key missing');
  assert(timerContext.includes('mediaSession'), 'MediaSession integration missing');

  // Verify UI components
  const modalContent = fs.readFileSync(path.join(__dirname, 'src/components/timer/StudyTimerModal.tsx'), 'utf8');
  assert(modalContent.includes('CAT Study Focus Timer'), 'Timer title missing in StudyTimerModal');
  assert(modalContent.includes('togglePip'), 'Picture-in-Picture trigger missing in StudyTimerModal');
  assert(modalContent.includes('togglePause'), 'Pause/resume trigger missing in StudyTimerModal');
  assert(modalContent.includes('stopAndLog'), 'Finish and log trigger missing in StudyTimerModal');
  assert(modalContent.includes('formatTimerDigits'), 'formatTimerDigits missing in StudyTimerModal');

  const dockContent = fs.readFileSync(path.join(__dirname, 'src/components/timer/StudyTimerFloatingDock.tsx'), 'utf8');
  assert(dockContent.includes('StudyTimerFloatingDock'), 'StudyTimerFloatingDock component missing');
  assert(dockContent.includes('togglePause'), 'togglePause missing in StudyTimerFloatingDock');
  assert(dockContent.includes('togglePip'), 'togglePip missing in StudyTimerFloatingDock');

  // Verify App integration
  const appContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
  assert(appContent.includes('StudyTimerProvider'), 'StudyTimerProvider missing in App.tsx');

  const shellContent = fs.readFileSync(path.join(__dirname, 'src/components/layout/AppShell.tsx'), 'utf8');
  assert(shellContent.includes('StudyTimerModal'), 'StudyTimerModal missing in AppShell');
  assert(shellContent.includes('StudyTimerFloatingDock'), 'StudyTimerFloatingDock missing in AppShell');

  const topNavContent = fs.readFileSync(path.join(__dirname, 'src/components/layout/TopNav.tsx'), 'utf8');
  assert(topNavContent.includes('useStudyTimer'), 'useStudyTimer hook missing in TopNav');
  assert(topNavContent.includes('openTimerModal'), 'openTimerModal trigger missing in TopNav');
});

// 26. VERIFY KANBAN INDEPENDENT TASK MOVING & DEFAULT DAILY GOALS
test('Kanban tasks move independently with index targeting and unique IDs, and default daily goals (VARC: AONSA & VARC: 5 root words) are present every day', () => {
  const appDataContext = fs.readFileSync(path.join(__dirname, 'src/context/AppDataContext.tsx'), 'utf8');
  assert(appDataContext.includes('DEFAULT_DAILY_GOALS_LIST'), 'DEFAULT_DAILY_GOALS_LIST missing in AppDataContext');
  assert(appDataContext.includes('VARC: AONSA'), 'VARC: AONSA default goal missing');
  assert(appDataContext.includes('VARC: 5 root words'), 'VARC: 5 root words default goal missing');
  assert(appDataContext.includes('ensureUniqueTaskIds'), 'ensureUniqueTaskIds function missing');
  assert(appDataContext.includes('ensureDefaultGoalsForDate'), 'ensureDefaultGoalsForDate function missing');
  assert(appDataContext.includes('targetIndex'), 'targetIndex targeting in updateTask/deleteTask missing');

  const plannerContent = fs.readFileSync(path.join(__dirname, 'src/pages/WeeklyPlannerPage.tsx'), 'utf8');
  assert(plannerContent.includes("updateTask(t.id, { status: 'Not Started' })"), 'Move to Not Started missing in Kanban');
  assert(plannerContent.includes("updateTask(t.id, { status: 'In Progress' })"), 'Move to In Progress missing in Kanban');
  assert(plannerContent.includes("updateTask(t.id, { status: 'Review' })"), 'Move to Review missing in Kanban');
  assert(plannerContent.includes("updateTask(t.id, { status: 'Completed'"), 'Move to Completed missing in Kanban');

  const initialActivitiesContent = fs.readFileSync(path.join(__dirname, 'src/data/initialActivities.ts'), 'utf8');
  assert(initialActivitiesContent.includes('VARC: AONSA'), 'VARC: AONSA missing in initialActivities.ts');
  assert(initialActivitiesContent.includes('VARC: 5 root words'), 'VARC: 5 root words missing in initialActivities.ts');
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)\n`);

if (passedTests === totalTests) {
  console.log('🎉 ALL APPLICATION LOGIC & UI INTEGRITY TESTS PASSED SUCCESSFULLY!\n');
} else {
  process.exit(1);
}
