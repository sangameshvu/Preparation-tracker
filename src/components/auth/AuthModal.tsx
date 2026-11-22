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
  Target,
  UserPlus
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
    signup,
    logout,
    syncDataToCloudVault,
    importDataFromCloudVault,
    studyNotes,
    stickyNotes,
    mockTests
  } = useAppData();

  const navigate = useNavigate();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form State: Starts completely blank with NO pre-filled credentials
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setDisplayNameInput('');
    setEmailInput('');
    setPasswordInput('');
    setShowPassword(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error('Please enter your email ID');
      return;
    }
    if (!passwordInput) {
      toast.error('Please enter your password');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await login(emailInput, passwordInput);
      if (res.success) {
        resetForm();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await signup(displayNameInput, emailInput, passwordInput);
      if (res.success) {
        resetForm();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    resetForm();
    setAuthMode('signin');
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

  // Compute initials for display
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-regular border border-border/80 shadow-2xl p-6">
        {isAuthenticated ? (
          /* ========================================================================= */
          /* 1. AUTHENTICATED PROFILE VIEW */
          /* ========================================================================= */
          <div className="space-y-5">
            <DialogHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xl shadow-md border-2 border-white/20">
                    {getInitials(profile.displayName)}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-400"
                    title="Profile Active & Synced"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-extrabold text-foreground truncate">
                      {profile.displayName || 'CAT Aspirant'}
                    </DialogTitle>
                    {profile.isAdmin && (
                      <Badge variant="purple" className="text-[10px] font-mono gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3" />
                    <span>{profile.email || 'No email attached'}</span>
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
                All preparation parameters, syllabus progress, 52-week plan, mock test records, mistake logs, study notes, and Sticky Board notes are stored under this profile.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-[10px]">
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block">CAT Target</span>
                  <span className="font-bold text-foreground">{profile.catTargetYear || 2027}</span>
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
                  ID: {profile.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">Registered Email:</span>
                  <span className="font-mono font-semibold text-foreground">{profile.email || 'N/A'}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Login Password:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {showPassword ? (profile.password || '••••••••') : '••••••••••••'}
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
                onClick={handleLogoutClick}
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
          /* 2. UNAUTHENTICATED: SIGN IN / SIGN UP TABS */
          /* ========================================================================= */
          <div className="space-y-4">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                    {authMode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-foreground">
                      {authMode === 'signin' ? 'Sign In to Your CAT Profile' : 'Create a New CAT Profile'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {authMode === 'signin'
                        ? 'Enter your email ID and password to access your personal profile.'
                        : 'Register a fresh profile to start your personalized CAT prep.'}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Tab Selector between Sign In and Sign Up */}
              <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl mt-3 border border-border/50">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Profile</span>
                </button>
              </div>
            </DialogHeader>

            {authMode === 'signin' ? (
              /* --- SIGN IN FORM --- */
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
                      placeholder="e.g. yourname@example.com"
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
                      placeholder="Enter your password"
                      className="pl-8 pr-8 h-9 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-muted-foreground leading-relaxed">
                  🔒 <strong className="text-foreground">Profile Security:</strong> Each profile stores its own topics, weekly plans, notes, and mock tests. Enter your credentials to unlock your profile.
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

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Don't have a profile yet? Create one here
                  </button>
                </div>
              </form>
            ) : (
              /* --- SIGN UP / CREATE PROFILE FORM --- */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5 py-1">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      required
                      placeholder="e.g. Sangamesh V U"
                      className="pl-8 h-9 text-xs"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Email ID</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      placeholder="e.g. sangamesh.vu@gmail.com"
                      className="pl-8 h-9 text-xs"
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
                      placeholder="Create a password (min 4 characters)"
                      className="pl-8 pr-8 h-9 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-muted-foreground leading-relaxed">
                  ✨ <strong className="text-foreground">Multi-Profile Support:</strong> You can create however many profiles you want. Each profile maintains its own dedicated workspace and data.
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-9 text-xs font-bold gap-1.5 shadow-sm cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{isSubmitting ? 'Creating Profile...' : 'Create Profile & Sign In'}</span>
                  </Button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Already have a profile? Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
