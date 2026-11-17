import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Compass,
  BookOpen,
  Edit2,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ListOrdered
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { PrepGuideSection } from '../types';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';

export const PrepGuidePage: React.FC = () => {
  const { guideSections, updateGuideSection, profile } = useAppData();
  const [editingSection, setEditingSection] = useState<PrepGuideSection | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>(guideSections[0]?.id || '');

  const handleOpenEdit = (sec: PrepGuideSection) => {
    setEditingSection(sec);
    setEditTitle(sec.title);
    setEditContent(sec.contentMarkdown);
  };

  const handleSaveEdit = () => {
    if (!editingSection) return;
    updateGuideSection(editingSection.id, {
      title: editTitle,
      contentMarkdown: editContent,
    });
    setEditingSection(null);
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              CAT 2027 Preparation Blueprint
            </h1>
            <Badge variant="blue" className="text-xs">
              Curated Strategy
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Complete strategic blueprint, sectional targets, and daily study allocations extracted from CAT Preparation manual.
          </p>
        </div>
        {profile.isAdmin && (
          <Badge variant="outline" className="text-xs gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Editing Enabled
          </Badge>
        )}
      </div>

      {/* Main Layout with Sticky Table of Contents on Desktop */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#121826]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
              <ListOrdered className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Table of Contents
            </h3>
            <nav className="space-y-1 text-xs">
              {guideSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`block w-full text-left rounded-xl px-3 py-2 transition-all truncate ${
                    activeSectionId === sec.id
                      ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 70ch Readable Guide Articles */}
        <div className="lg:col-span-9 space-y-6 max-w-[75ch]">
          {guideSections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-[#121826]"
            >
              <div className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {sec.title}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Section Key: {sec.sectionKey}
                  </span>
                </div>
                {profile.isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    onClick={() => handleOpenEdit(sec)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Content</span>
                  </Button>
                )}
              </div>
              <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <MarkdownRenderer content={sec.contentMarkdown} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Section Modal */}
      <Dialog open={Boolean(editingSection)} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-[#121826]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Edit Preparation Guide Section
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
              Modify the blueprint instructions or add new study advice. Changes persist directly into your database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Section Title
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Content (Markdown / Text)
              </label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="font-mono text-xs leading-relaxed rounded-xl border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" className="rounded-xl text-slate-600 dark:text-slate-300" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button variant="default" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrepGuidePage;
