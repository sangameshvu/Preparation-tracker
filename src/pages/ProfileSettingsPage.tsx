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
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const ProfileSettingsPage: React.FC = () => {
  const { profile, updateProfile, weeklyPlans, topics, topicProgress, mockTests, mistakes, resources, resetAllData } = useAppData();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [prepStartDate, setPrepStartDate] = useState(profile.prepStartDate);
  const [targetExamDate, setTargetExamDate] = useState(profile.targetExamDate);
  const [dailyHours, setDailyHours] = useState(profile.preferredDailyHours);
  const [targetYear, setTargetYear] = useState(profile.catTargetYear);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      appVersion: '1.0.0'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CAT_2027_HQ_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile & Preparation Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure your CAT 2027 parameters, start date recalculations, UI preferences, and data backups.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Settings saved successfully! 52-week calendar dates updated automatically.</span>
        </div>
      )}

      {/* Main Parameters Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-purple-400" />
            <span>Preparation Profile & Target Parameters</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Updating the preparation start date automatically recalculates the 52-week study plan schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Target Exam Year</label>
                <Input
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Preparation Start Date (Monday)
                </label>
                <Input
                  type="date"
                  value={prepStartDate}
                  onChange={(e) => setPrepStartDate(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Changing this date recalculates all 52 weekly plan date ranges.
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Expected CAT 2027 Date
                </label>
                <Input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Expected last Sunday of November. Update when IIMs announce.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Target Daily Study Hours
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Active Study Routine
                </label>
                <Select
                  value={profile.preferredRoutine}
                  onValueChange={(val) => updateProfile({ preferredRoutine: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working_professional_weekday">Working Professional (Weekday ~2.5h)</SelectItem>
                    <SelectItem value="working_professional_weekend">Working Professional (Weekend ~6-7h)</SelectItem>
                    <SelectItem value="college_student_weekday">College Student (Weekday ~3.5-4h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="purple" size="sm">
                Save & Recalculate Roadmap
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-400" />
            <span>Application Interface Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card">
            <div>
              <span className="text-xs font-semibold text-foreground block">Theme Mode</span>
              <span className="text-[11px] text-muted-foreground">Toggle between high-contrast dark and light modes.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={theme === 'dark' ? 'purple' : 'outline'}
                className="h-8 text-xs gap-1"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </Button>
              <Button
                size="sm"
                variant={theme === 'light' ? 'purple' : 'outline'}
                className="h-8 text-xs gap-1"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Download className="h-4 w-4 text-purple-400" />
            <span>Data Portability & Complete Backup</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Export your entire preparation database (topics, mocks, mistakes, routines) as JSON for local backups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border border-border/70 bg-muted/20">
            <div>
              <span className="text-xs font-semibold text-foreground block">Full Database Backup (JSON)</span>
              <span className="text-[11px] text-muted-foreground">All 52 weekly plans, 53 topics, mock logs, and mistakes.</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 shrink-0" onClick={handleExportJSON}>
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON Backup</span>
            </Button>
          </div>

          {/* Factory Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <div>
              <span className="text-xs font-semibold text-red-300 block">Factory Reset Application Data</span>
              <span className="text-[11px] text-muted-foreground">Restore initial state from the original Excel & PDF files.</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs gap-1.5 shrink-0"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all preparation data? This restores the master workbook defaults.')) {
                  resetAllData();
                }
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Workbook Defaults</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
