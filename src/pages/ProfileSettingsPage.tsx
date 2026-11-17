import React, { useState } from 'react';
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
  Sliders
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { useNavigate } from 'react-router-dom';

export const ProfileSettingsPage: React.FC = () => {
  const { profile, updateProfile, weeklyPlans, topics, topicProgress, mockTests, mistakes, resources, resetAllData } = useAppData();
  const { theme, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data'>('profile');

  // Form State
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [prepStartDate, setPrepStartDate] = useState(profile.prepStartDate);
  const [targetExamDate, setTargetExamDate] = useState(profile.targetExamDate);
  const [dailyHours, setDailyHours] = useState(profile.preferredDailyHours);
  const [targetYear, setTargetYear] = useState(profile.catTargetYear);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim(),
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
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Configure your CAT 2027 milestones, study parameters, appearance theme, and data backups.
          </p>
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
    </div>
  );
};

export default ProfileSettingsPage;
