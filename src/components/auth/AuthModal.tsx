import React, { useState, useRef } from 'react';
import { useAppData } from '../../context/AppDataContext';
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  LogOut,
  LogIn,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Database,
  Calendar,
  Layers,
  FileText,
  Target
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const {
    profile,
    isAuthenticated,
    login,
    logout,
    syncDataToCloudVault,
    importDataFromCloudVault,
    stats,
    studyNotes,
    stickyNotes,
    mockTests,
    mistakes
  } = useAppData();

  const navigate = useNavigate();

  // Form State
  const [emailInput, setEmailInput] = useState('sangamesh.vu@gmail.com');
  const [passwordInput, setPasswordInput] = useState('Sangamesh.vu@');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await login(emailInput, passwordInput);
      if (res.success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLoginAsSangamesh = async () => {
    setEmailInput('sangamesh.vu@gmail.com');
    setPasswordInput('Sangamesh.vu@');
    setIsSubmitting(true);
    try {
      const res = await login('sangamesh.vu@gmail.com', 'Sangamesh.vu@');
      if (res.success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataFromCloudVault(content);
        if (ok) {
          onOpenChange(false);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-regular border border-border/80 shadow-2xl p-6">
        {isAuthenticated ? (
          /* ========================================================================= */
          /* 1. AUTHENTICATED PROFILE VIEW (SANGAMESH V U) */
          /* ========================================================================= */
          <div className="space-y-5">
            <DialogHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xl shadow-md border-2 border-white/20">
                    SV
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-400"
                    title="Profile Active & Synced"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-extrabold text-foreground truncate">
                      {profile.displayName || 'Sangamesh V U'}
                    </DialogTitle>
                    <Badge variant="purple" className="text-[10px] font-mono gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Master Admin
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3" />
                    <span>{profile.email || 'sangamesh.vu@gmail.com'}</span>
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Account Database Association Banner */}
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Database className="h-4 w-4" />
                  Database Bound to This Profile
                </span>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Live Synced
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All preparation parameters, syllabus progress, 52-week plan, 40 mock test records, mistake logs, study notes, and Sticky Board notes are stored under this profile.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-[10px]">
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block">CAT Target</span>
                  <span className="font-bold text-foreground">2027</span>
                </div>
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block">Mocks</span>
                  <span className="font-bold text-foreground">{mockTests.length}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block">Study Notes</span>
                  <span className="font-bold text-foreground">{studyNotes.length}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block">Sticky Notes</span>
                  <span className="font-bold text-foreground">{stickyNotes.length}</span>
                </div>
              </div>
            </div>

            {/* Profile Credentials Information Card */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  Profile Login Credentials
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {profile.id || 'user-sangamesh-vu'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">Registered Email:</span>
                  <span className="font-mono font-semibold text-foreground">{profile.email || 'sangamesh.vu@gmail.com'}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Login Password:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {showPassword ? (profile.password || 'Sangamesh.vu@') : '••••••••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Cross-Device Cloud Sync Actions */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Cross-Device Cloud Vault Access
              </span>
              <p className="text-[11px] text-muted-foreground">
                Export your database snapshot to open on another laptop or phone, or restore an existing backup file.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={syncDataToCloudVault}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs h-9 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Sync & Download Vault</span>
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,application/json"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs h-9 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Restore from Device</span>
                </Button>
              </div>
            </div>

            <DialogFooter className="border-t border-border/60 pt-4 flex flex-col sm:flex-row justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1.5 text-xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/settings');
                  }}
                  className="text-xs cursor-pointer"
                >
                  Profile Settings
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. SIGN IN / LOGIN VIEW */
          /* ========================================================================= */
          <div className="space-y-4">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                  <LogIn className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Sign In to Your CAT 2027 Profile
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Enter your email ID and password to access your database and analytics.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 py-1">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="sangamesh.vu@gmail.com"
                    className="pl-8 h-9 text-xs"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    placeholder="Sangamesh.vu@"
                    className="pl-8 pr-8 h-9 text-xs"
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

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isSubmitting ? 'Verifying Profile...' : 'Sign In to Profile'}</span>
                </Button>
              </div>

              <div className="relative my-2 text-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground bg-background px-2 relative z-10">
                  Quick Access
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60" />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleQuickLoginAsSangamesh}
                className="w-full h-9 text-xs font-semibold gap-1.5 border-purple-500/30 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>1-Click Sign In as Sangamesh</span>
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
