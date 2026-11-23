import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  User,
  Calendar,
  Clock,
  Download,
  RotateCcw,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  Palette,
  Sliders,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  LogIn,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AuthModal } from '../components/auth/AuthModal';

export const ProfileSettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    isAuthenticated,
    weeklyPlans,
    topics,
    topicProgress,
    mockTests,
    mistakes,
    resources,
    resetAllData,
    cloudSyncStatus,
    syncNowToCloud,
    syncDataToCloudVault,
    importDataFromCloudVault
  } = useAppData();
  const { theme, toggleTheme, setTheme, glassEffect, setGlassEffect } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data'>('profile');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState(profile.displayName || (isAuthenticated ? '' : 'CAT Aspirant'));
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState(profile.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [prepStartDate, setPrepStartDate] = useState(profile.prepStartDate);
  const [targetExamDate, setTargetExamDate] = useState(profile.targetExamDate);
  const [dailyHours, setDailyHours] = useState(profile.preferredDailyHours);
  const [targetYear, setTargetYear] = useState(profile.catTargetYear);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName || (isAuthenticated ? '' : 'CAT Aspirant'));
    setEmail(profile.email || '');
    setPassword(profile.password || '');
    setPrepStartDate(profile.prepStartDate);
    setTargetExamDate(profile.targetExamDate);
    setDailyHours(profile.preferredDailyHours);
    setTargetYear(profile.catTargetYear);
  }, [profile, isAuthenticated]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
      prepStartDate,
      targetExamDate,
      preferredDailyHours: Number(dailyHours),
      catTargetYear: Number(targetYear),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const backupData = {
      profile,
      weeklyPlans,
      topics,
      topicProgress,
      mockTests,
      mistakes,
      resources,
      exportedAt: new Date().toISOString(),
      appVersion: '2.0.0'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CAT_2027_HQ_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmReset = () => {
    resetAllData();
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings & Preferences
          </h1>
        </div>

        <div className="w-full sm:w-auto">
          <SegmentedTabs
            value={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
            options={[
              { id: 'profile', label: 'Profile & Exam', icon: <User className="h-4 w-4" /> },
              { id: 'preferences', label: 'Preferences', icon: <Sliders className="h-4 w-4" /> },
              { id: 'data', label: 'Data & Backup', icon: <Database className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 text-emerald-800 text-xs flex items-center gap-2 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Settings saved successfully! 52-week calendar dates updated automatically.</span>
        </div>
      )}

      {/* Tab 1: Profile & Exam Parameters */}
      {activeTab === 'profile' && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Aspirant Profile & Timeline Parameters</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              Updating the preparation start date automatically recalculates the 52-week study plan schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target CAT Year
                  </label>
                  <Input
                    type="number"
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Preparation Start Date
                  </label>
                  <Input
                    type="date"
                    value={prepStartDate}
                    onChange={(e) => setPrepStartDate(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Exam Date
                  </label>
                  <Input
                    type="date"
                    value={targetExamDate}
                    onChange={(e) => setTargetExamDate(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Daily Study Hours
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="14"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="text-xs rounded-xl"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 block">
                    Recommended: 2.5 to 3.5 hrs on weekdays, 5.0 to 6.0 hrs on weekends.
                  </span>
                </div>
              </div>

              {/* Account Credentials & Database Association */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span>Account Credentials & Cloud Profile</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAuthenticated
                        ? 'Login on any device using your email and password to access your CAT 2027 dataset.'
                        : 'Sign in to access your saved profile (including Sangamesh\'s profile) or register a new account.'}
                    </p>
                  </div>
                  <Badge variant="purple" className="text-[10px] font-mono">
                    ID: {profile.id || 'user-guest'}
                  </Badge>
                </div>

                {!isAuthenticated ? (
                  <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-blue-600" />
                        Viewing as Guest Aspirant
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        You are currently in guest mode. Sign in to load Sangamesh's profile or register a new profile.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setAuthModalOpen(true)}
                      className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Sign In / Register
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Account Email ID
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-xs rounded-xl pl-8 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Login Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-xs rounded-xl pl-8 pr-8 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Database & Cross-Device Cloud Sync Status */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between text-purple-900 dark:text-purple-200">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>Database Status: <strong>100% Data Bound to {profile.email}</strong></span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-900/40 font-bold">
                        Verified Bound
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 dark:text-slate-200">
                      <div className="flex items-start gap-2.5">
                        <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>Cross-Device Cloud Sync: Active</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                              Connected
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            All your tasks, syllabus progress, mock logs, notes, and vocabulary are automatically synchronized. Sign into <strong>{profile.email}</strong> on any phone, tablet, or PC to get the exact same data!
                          </p>
                          {cloudSyncStatus.lastSyncedAt && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-1 block">
                              Last synchronized: {new Date(cloudSyncStatus.lastSyncedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={syncNowToCloud}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${cloudSyncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
                          <span>Sync Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={syncDataToCloudVault}
                          className="px-2.5 py-1.5 rounded-xl border border-border/80 bg-white/70 dark:bg-slate-900/60 font-medium text-[11px] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Preferences & Appearance */}
      {activeTab === 'preferences' && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Appearance & Display Options</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              Customize the visual theme and date formats to match your study preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Color Theme
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Currently using {theme === 'dark' ? 'Dark Mode (#0B0F19)' : 'Light Mode (#F3F5FB pale canvas)'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="gap-2 text-xs rounded-xl border-slate-200 dark:border-slate-700"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Switch to Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-blue-500" />
                    <span>Switch to Dark</span>
                  </>
                )}
              </Button>
            </div>

            {/* Glass Effects Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Glass Effects
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {glassEffect === 'full'
                    ? 'Full liquid glassmorphism with 24px blur and ambient light blobs'
                    : glassEffect === 'reduced'
                    ? 'Reduced blur (8px), static background, and higher opacity for performance'
                    : 'Glass disabled: Solid high-contrast surfaces without blur'}
                </span>
              </div>
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700">
                {(['full', 'reduced', 'off'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGlassEffect(mode)}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer',
                      glassEffect === mode
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Time Format
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  12-hour clock (AM/PM) vs 24-hour standard
                </span>
              </div>
              <Badge variant="outline" className="text-xs rounded-lg">
                12-Hour
              </Badge>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Date Format
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Standard format for milestones and practice logs
                </span>
              </div>
              <Badge variant="outline" className="text-xs rounded-lg font-mono">
                YYYY-MM-DD
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Data & Backup */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export Offline Backup</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Download a complete JSON snapshot of all your topic progress, mock scores, mistake entries, and study notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="gap-2 text-xs rounded-xl border-slate-200 dark:border-slate-700"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export Full Backup JSON</span>
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Restore / Import Data Vault JSON */}
          <Card className="rounded-3xl border-blue-200/80 dark:border-blue-900/60 shadow-sm bg-blue-50/20 dark:bg-blue-950/10">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-900 dark:text-blue-200">
                <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Restore / Upload Data Vault JSON</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Upload your saved or recovery CAT 2027 Data Vault JSON file to immediately restore your study streaks, daily goals, notes, tasks, and syllabus progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  id="vault-file-input"
                  accept=".json,application/json"
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          importDataFromCloudVault(content);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </div>
              <div className="pt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span>Direct recovery backup:</span>
                <a
                  href="/Sangamesh_CAT_2027_DataVault_Recovery.json"
                  download="Sangamesh_CAT_2027_DataVault_Recovery.json"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Recovery Vault (Sangamesh_CAT_2027_DataVault_Recovery.json)</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-rose-200/80 dark:border-rose-950/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Reset Application State</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Restore all topics, 52-week plan, and configuration to the default CAT 2027 seed data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!resetConfirmOpen ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setResetConfirmOpen(true)}
                  className="gap-2 text-xs rounded-xl"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Data</span>
                </Button>
              ) : (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    Are you sure you want to reset everything?
                  </div>
                  <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">
                    This will delete all custom topics, mock entries, and logged mistakes, restoring the fresh initial state.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleConfirmReset}
                      className="text-xs rounded-xl"
                    >
                      Yes, Reset Everything
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetConfirmOpen(false)}
                      className="text-xs rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {profile.isAdmin && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Admin Database Controls</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                  Manage master syllabus, weekly plan seeds, and direct PDF blueprint sections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="gap-2 text-xs rounded-xl border-slate-200 dark:border-slate-700"
                >
                  <Database className="h-3.5 w-3.5 text-blue-600" />
                  <span>Open Dedicated Admin Panel →</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Auth Modal for Guest Sign In / Multi-profile Register */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default ProfileSettingsPage;
