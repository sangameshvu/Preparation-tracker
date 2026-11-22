import React, { useState, useMemo, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Search,
  Check,
  Eye,
  FileText,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  X,
  Maximize2,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  HelpCircle,
  Table as TableIcon,
  BookOpen,
  ArrowLeft,
  SlidersHorizontal,
  Tag,
  Share2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { StickyNoteItem, NoteImageItem, SectionType } from '../types';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export const STICKY_COLORS = [
  {
    name: 'lavender',
    label: 'Lavender Purple',
    hex: '#8B5CF6',
    bg: 'glass-regular bg-purple-500/12 border-purple-400/40 text-purple-950 dark:bg-purple-500/20 dark:border-purple-400/30 dark:text-purple-100 shadow-md',
    badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-600/40',
    accent: 'text-purple-600 dark:text-purple-400'
  },
  {
    name: 'emerald',
    label: 'Emerald Green',
    hex: '#10B981',
    bg: 'glass-regular bg-emerald-500/12 border-emerald-400/40 text-emerald-950 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-100 shadow-md',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600/40',
    accent: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    name: 'amber',
    label: 'Warm Amber',
    hex: '#F59E0B',
    bg: 'glass-regular bg-amber-500/12 border-amber-400/40 text-amber-950 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-100 shadow-md',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600/40',
    accent: 'text-amber-600 dark:text-amber-400'
  },
  {
    name: 'rose',
    label: 'Rose Pink',
    hex: '#F43F5E',
    bg: 'glass-regular bg-rose-500/12 border-rose-400/40 text-rose-950 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-100 shadow-md',
    badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-600/40',
    accent: 'text-rose-600 dark:text-rose-400'
  },
  {
    name: 'cyan',
    label: 'Cyan Blue',
    hex: '#06B6D4',
    bg: 'glass-regular bg-cyan-500/12 border-cyan-400/40 text-cyan-950 dark:bg-cyan-500/20 dark:border-cyan-400/30 dark:text-cyan-100 shadow-md',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-200 dark:border-cyan-600/40',
    accent: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    name: 'charcoal',
    label: 'Slate Charcoal',
    hex: '#27272A',
    bg: 'glass-regular bg-slate-500/12 border-slate-400/40 text-slate-950 dark:bg-slate-500/20 dark:border-slate-400/30 dark:text-slate-100 shadow-md',
    badge: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-700/40',
    accent: 'text-slate-600 dark:text-slate-400'
  },
] as const;

export const NOTE_PURPOSES = [
  'Concept Summary',
  'Formula Sheet',
  'Solved Q&A Breakdown',
  'Exam Strategy',
  'Quick Reflection / Rule',
  'Shortcut Matrix',
  'Other'
] as const;

export const StickyBoardPage: React.FC = () => {
  const { stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote, topics } = useAppData();

  // Active View: 'gallery' or 'editor'
  const [activeView, setActiveView] = useState<'gallery' | 'editor'>('gallery');

  // Search & Filters in Gallery
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'All' | SectionType | 'General'>('All');
  const [colorFilter, setColorFilter] = useState<string>('All');
  const [purposeFilter, setPurposeFilter] = useState<string>('All');

  // Metadata Intake Modal State
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Note Metadata Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formPurpose, setFormPurpose] = useState<string>('Concept Summary');
  const [formCustomPurpose, setFormCustomPurpose] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSection, setFormSection] = useState<SectionType | 'General'>('Quant');
  const [formTopicId, setFormTopicId] = useState('');
  const [formColor, setFormColor] = useState<StickyNoteItem['color']>('lavender');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Active Editor Content & Canvas Mode
  const [editorContent, setEditorContent] = useState('');
  const [editorImages, setEditorImages] = useState<NoteImageItem[]>([]);
  const [canvasMode, setCanvasMode] = useState<'edit' | 'split' | 'preview'>('split');

  // Document Reader & Lightbox Modals
  const [readingNote, setReadingNote] = useState<StickyNoteItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter topics based on selected section
  const relevantTopics = useMemo(() => {
    if (formSection === 'General') return topics;
    return topics.filter((t) => t.section === formSection);
  }, [topics, formSection]);

  // Color helper
  const getColorClass = (col: StickyNoteItem['color']) => {
    const found = STICKY_COLORS.find((c) => c.name === col);
    return found ? found.bg : 'glass-regular bg-card border-border text-foreground';
  };

  const getColorMeta = (col: StickyNoteItem['color']) => {
    return STICKY_COLORS.find((c) => c.name === col) || STICKY_COLORS[0];
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return stickyNotes
      .filter((note) => {
        if (sectionFilter !== 'All') {
          const noteSec = note.section || 'General';
          if (noteSec !== sectionFilter) return false;
        }
        if (colorFilter !== 'All' && note.color !== colorFilter) {
          return false;
        }
        if (purposeFilter !== 'All') {
          const notePurp = note.purpose || 'Concept Summary';
          if (notePurp !== purposeFilter) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (note.title || '').toLowerCase().includes(q);
          const matchContent = (note.content || '').toLowerCase().includes(q);
          const matchPurpose = (note.purpose || '').toLowerCase().includes(q);
          const linkedTopic = topics.find((t) => t.id === note.linkedTopicId);
          const matchTopic = (linkedTopic?.topicName || '').toLowerCase().includes(q);
          if (!matchTitle && !matchContent && !matchPurpose && !matchTopic) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const dateA = new Date(a.date || a.createdAt).getTime();
        const dateB = new Date(b.date || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [stickyNotes, sectionFilter, colorFilter, purposeFilter, searchQuery, topics]);

  // Summary Metrics
  const summaryCounts = useMemo(() => {
    const total = stickyNotes.length;
    const pinned = stickyNotes.filter((n) => n.isPinned).length;
    const quant = stickyNotes.filter((n) => n.section === 'Quant').length;
    const dilr = stickyNotes.filter((n) => n.section === 'DILR').length;
    const varc = stickyNotes.filter((n) => n.section === 'VARC').length;
    const totalScans = stickyNotes.reduce((acc, n) => acc + (n.images ? n.images.length : 0), 0);
    return { total, pinned, quant, dilr, varc, totalScans };
  }, [stickyNotes]);

  // Launch Metadata Intake Modal for a NEW note
  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormPurpose('Concept Summary');
    setFormCustomPurpose('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSection(sectionFilter !== 'All' ? sectionFilter : 'Quant');
    setFormTopicId('');
    setFormColor('lavender');
    setFormIsPinned(false);
    setEditorContent('');
    setEditorImages([]);
    setMetadataModalOpen(true);
  };

  // Launch Metadata Edit for an EXISTING note
  const handleOpenEditMetadata = (note: StickyNoteItem) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title || '');
    setFormPurpose(NOTE_PURPOSES.includes(note.purpose as any) ? note.purpose! : 'Other');
    setFormCustomPurpose(NOTE_PURPOSES.includes(note.purpose as any) ? '' : (note.purpose || ''));
    setFormDate(note.date || (note.createdAt ? note.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]));
    setFormSection(note.section || 'Quant');
    setFormTopicId(note.linkedTopicId || '');
    setFormColor(note.color || 'lavender');
    setFormIsPinned(Boolean(note.isPinned));
    setEditorContent(note.content || '');
    setEditorImages(note.images || []);
    setMetadataModalOpen(true);
  };

  // Open Canvas Editor directly for an EXISTING note
  const handleOpenCanvasForNote = (note: StickyNoteItem) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title || '');
    setFormPurpose(note.purpose || 'Concept Summary');
    setFormCustomPurpose('');
    setFormDate(note.date || (note.createdAt ? note.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]));
    setFormSection(note.section || 'Quant');
    setFormTopicId(note.linkedTopicId || '');
    setFormColor(note.color || 'lavender');
    setFormIsPinned(Boolean(note.isPinned));
    setEditorContent(note.content || '');
    setEditorImages(note.images || []);
    setCanvasMode('split');
    setActiveView('editor');
    if (readingNote) setReadingNote(null);
  };

  // From Metadata Dialog: Proceed to the Word Canvas Editor
  const handleProceedToCanvas = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = formTitle.trim() || 'Untitled Sticky Note';
    setFormTitle(finalTitle);

    // If starting fresh with no content, provide an optional introductory starter or blank canvas
    if (!editorContent.trim() && !editingNoteId) {
      if (formPurpose === 'Formula Sheet') {
        setEditorContent(
          `### Key Formulas & Shortcut Matrix:\n\n| Concept / Case | Formula / Property | Conditions |\n| :--- | :--- | :--- |\n| Case 1 | Formula 1 | Details |\n| Case 2 | Formula 2 | Details |\n\n> **Exam Mental Rule:** `
        );
      } else if (formPurpose === 'Solved Q&A Breakdown') {
        setEditorContent(
          `### Problem Statement:\n> [Write or paste the question text here...]\n\n---\n\n### Step-by-Step Solution & Method:\n\n#### 1. Given Parameters & Constraints:\n- \n\n#### 2. Key Concept / Formula Used:\n- \n\n#### 3. Step-by-Step Deduction:\n1. \n2. \n\n#### 4. Final Answer & Shortcut Takeaway:\n- **Answer:** \n> **Exam Shortcut / Rule:** `
        );
      }
    }

    setMetadataModalOpen(false);
    setCanvasMode('split');
    setActiveView('editor');
    toast.info('Opened Word Canvas. Type formatting, attach scans, or insert templates.');
  };

  // From Metadata Dialog: Save directly as a quick sticky note without opening full canvas
  const handleQuickSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = formTitle.trim() || 'Untitled Sticky Note';
    const finalPurpose = formPurpose === 'Other' && formCustomPurpose.trim() ? formCustomPurpose.trim() : formPurpose;
    const fallbackContent = editorContent.trim() || `*Quick sticky note created on ${formDate}*`;

    if (editingNoteId) {
      updateStickyNote(editingNoteId, {
        title: finalTitle,
        purpose: finalPurpose,
        date: formDate,
        section: formSection,
        linkedTopicId: formTopicId || undefined,
        color: formColor,
        isPinned: formIsPinned,
        content: fallbackContent,
        images: editorImages,
        updatedAt: new Date().toISOString()
      });
      toast.success('Sticky Board note updated');
    } else {
      addStickyNote({
        title: finalTitle,
        purpose: finalPurpose,
        date: formDate,
        section: formSection,
        linkedTopicId: formTopicId || undefined,
        color: formColor,
        isPinned: formIsPinned,
        content: fallbackContent,
        images: editorImages,
        positionX: Math.floor(Math.random() * 200) + 50,
        positionY: Math.floor(Math.random() * 200) + 50,
        updatedAt: new Date().toISOString()
      });
      toast.success('Sticky Board note created');
    }
    setMetadataModalOpen(false);
  };

  // Inside Canvas Editor: Save Note to Context and exit
  const handleSaveCanvasNote = () => {
    const finalTitle = formTitle.trim() || 'Untitled Sticky Note';
    const finalPurpose = formPurpose === 'Other' && formCustomPurpose.trim() ? formCustomPurpose.trim() : formPurpose;
    const finalContent = editorContent.trim();

    if (!finalContent) {
      toast.error('Note content is empty. Please type some notes before saving.');
      return;
    }

    if (editingNoteId) {
      updateStickyNote(editingNoteId, {
        title: finalTitle,
        purpose: finalPurpose,
        date: formDate,
        section: formSection,
        linkedTopicId: formTopicId || undefined,
        color: formColor,
        isPinned: formIsPinned,
        content: finalContent,
        images: editorImages,
        updatedAt: new Date().toISOString()
      });
      toast.success('Sticky Board note updated successfully');
    } else {
      addStickyNote({
        title: finalTitle,
        purpose: finalPurpose,
        date: formDate,
        section: formSection,
        linkedTopicId: formTopicId || undefined,
        color: formColor,
        isPinned: formIsPinned,
        content: finalContent,
        images: editorImages,
        positionX: Math.floor(Math.random() * 200) + 50,
        positionY: Math.floor(Math.random() * 200) + 50,
        updatedAt: new Date().toISOString()
      });
      toast.success('New Sticky Board note saved');
    }

    setActiveView('gallery');
  };

  // Word-like Toolbar Formatting Helper
  const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editorContent.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = editorContent.substring(0, start) + replacement + editorContent.substring(end);
    setEditorContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // Handle notebook photo upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files can be attached');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const newImg: NoteImageItem = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: dataUrl,
          name: file.name.replace(/\.[^/.]+$/, ''),
          caption: `Notebook scan: ${file.name}`,
          uploadedAt: new Date().toISOString()
        };

        setEditorImages((prev) => [...prev, newImg]);
        insertFormatting(`\n\n![${newImg.caption}](${newImg.url})\n\n`, '', '');
        toast.success(`Photo "${file.name}" attached to canvas`);
      };

      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Remove attached image
  const handleRemoveImage = (imgId: string) => {
    setEditorImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  // Template Accelerators
  const insertQATemplate = () => {
    const template = `\n\n### Problem Question:
> [Write or paste the question text here...]

---

### Step-by-Step Solution & Method:

#### 1. Given Parameters & Constraints:
- 

#### 2. Key Concept / Formula Used:
- 

#### 3. Step-by-Step Deduction:
1. 
2. 

#### 4. Final Answer & Shortcut Takeaway:
- **Answer:** 
> **Exam Shortcut / Rule:** 
\n`;
    insertFormatting(template, '', '');
  };

  const insertFormulaTemplate = () => {
    const template = `\n\n### Key Formulas & Shortcut Matrix:

| Concept / Case | Formula / Property | Conditions |
| :--- | :--- | :--- |
| Case 1 | Formula 1 | Details |
| Case 2 | Formula 2 | Details |

> **Mental Rule:** 
\n`;
    insertFormatting(template, '', '');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & VIEW TOGGLE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sticky Board</h1>
            <Badge variant="purple" className="text-xs gap-1 font-mono">
              <Sparkles className="h-3 w-3" />
              Word Canvas & Markdown Editor
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Word-like markdown canvas, formula cheat sheets, solved problem dossiers, and notebook photo scans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'gallery' ? (
            <Button onClick={handleOpenCreate} variant="default" size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Add Sticky Note</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={() => setActiveView('gallery')} variant="outline" size="sm" className="gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Back to Sticky Board</span>
              </Button>
              <Button onClick={handleSaveCanvasNote} variant="default" size="sm" className="gap-1.5 shadow-sm">
                <Check className="h-4 w-4" />
                <span>Save Note</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: GALLERY VIEW (CARDS DISPLAYED ON THE PAGE IN STICKY BOARD) */}
      {/* ========================================================================= */}
      {activeView === 'gallery' && (
        <div className="space-y-6">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl border border-border/80 glass-regular shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">All Sticky Notes</span>
              <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">{summaryCounts.total}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/80 glass-regular shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Pinned to Top</span>
              <span className="text-lg font-bold font-mono text-purple-700 dark:text-purple-400 mt-0.5 block">{summaryCounts.pinned}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/80 glass-regular shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Quant Notes</span>
              <span className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400 mt-0.5 block">{summaryCounts.quant}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/80 glass-regular shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">DILR Notes</span>
              <span className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400 mt-0.5 block">{summaryCounts.dilr}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/80 glass-regular shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">VARC Notes</span>
              <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block">{summaryCounts.varc}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/80 glass-regular shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Attached Scans</span>
              <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400 mt-0.5 block">{summaryCounts.totalScans}</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl border border-border/80 glass-regular shadow-sm space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sticky notes by title, formula, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Section Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">Section:</span>
                {(['All', 'Quant', 'DILR', 'VARC', 'General'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSectionFilter(sec)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer',
                      sectionFilter === sec
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {sec === 'All' ? 'All Sections' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Color palette & Purpose category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs">
              {/* Purpose Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">Purpose:</span>
                {['All', 'Concept Summary', 'Formula Sheet', 'Solved Q&A Breakdown', 'Exam Strategy'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPurposeFilter(p)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer',
                      purposeFilter === p
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Color Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground font-medium">Color:</span>
                <button
                  onClick={() => setColorFilter('All')}
                  className={cn(
                    'px-2 py-0.5 text-[10px] rounded font-semibold cursor-pointer border',
                    colorFilter === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border text-muted-foreground'
                  )}
                >
                  All
                </button>
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColorFilter(colorFilter === c.name ? 'All' : c.name)}
                    className={cn(
                      'h-5 w-5 rounded-full border transition-transform cursor-pointer',
                      colorFilter === c.name ? 'scale-125 border-foreground ring-1 ring-primary' : 'border-transparent opacity-80 hover:opacity-100'
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Notes Cards Grid */}
          {filteredNotes.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 glass-regular space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <StickyNote className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No Sticky Board Notes Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No notes match your active filters. Click below to add a new note with Word canvas editor or reset filters.
              </p>
              <Button onClick={handleOpenCreate} variant="default" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add Sticky Note</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNotes.map((note) => {
                const linkedTopic = topics.find((t) => t.id === note.linkedTopicId);
                const hasImages = note.images && note.images.length > 0;
                const noteDateStr = note.date || (note.createdAt ? note.createdAt.split('T')[0] : '2026-11-22');
                const noteTitle = note.title || 'Untitled Sticky Note';
                const notePurpose = note.purpose || 'Concept Summary';
                const noteSection = note.section || 'General';

                return (
                  <div
                    key={note.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg ${getColorClass(
                      note.color
                    )} ${note.isPinned ? 'ring-2 ring-purple-500/40' : ''}`}
                  >
                    <div>
                      {/* Top Bar: Date, Purpose Badge, Pin Button */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/15 gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono opacity-80 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {noteDateStr}
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border bg-current/10 border-current/20">
                            {notePurpose}
                          </span>
                        </div>

                        <button
                          onClick={() => updateStickyNote(note.id, { isPinned: !note.isPinned })}
                          className="opacity-75 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          <Pin className={`h-3.5 w-3.5 ${note.isPinned ? 'fill-current text-purple-600 dark:text-purple-400' : ''}`} />
                        </button>
                      </div>

                      {/* Note Title */}
                      <h3
                        onClick={() => setReadingNote(note)}
                        className="text-sm font-extrabold leading-snug cursor-pointer hover:underline line-clamp-2 mb-1.5"
                      >
                        {noteTitle}
                      </h3>

                      {/* Section & Topic Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <Badge
                          variant={noteSection === 'Quant' ? 'quant' : noteSection === 'DILR' ? 'dilr' : noteSection === 'VARC' ? 'varc' : 'outline'}
                          className="text-[9px] px-1.5 py-0 font-bold"
                        >
                          {noteSection}
                        </Badge>
                        {linkedTopic && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-current/10 truncate max-w-[140px]">
                            {linkedTopic.topicName}
                          </span>
                        )}
                        {hasImages && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-900 dark:text-blue-100 flex items-center gap-1">
                            <ImageIcon className="h-2.5 w-2.5" />
                            {note.images!.length} scan{note.images!.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Attached Thumbnail Preview (if any) */}
                      {hasImages && (
                        <div className="mb-2">
                          <div
                            onClick={() => setLightboxImage(note.images![0].url)}
                            className="h-24 w-full rounded-lg overflow-hidden border border-current/20 bg-black/10 relative group cursor-pointer"
                          >
                            <img
                              src={note.images![0].url}
                              alt={note.images![0].name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                              <Maximize2 className="h-3.5 w-3.5" />
                              <span>Enlarge Scan</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content Preview */}
                      <div className="text-xs leading-relaxed font-medium line-clamp-4 opacity-90">
                        <MarkdownRenderer content={note.content} />
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 mt-3 border-t border-current/15 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCanvasForNote(note)}
                          className="h-7 px-2 text-[11px] font-bold gap-1 bg-current/10 hover:bg-current/20 text-current cursor-pointer"
                          title="Open full Microsoft Word-like markdown canvas editor"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Open Canvas</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setReadingNote(note)}
                          className="h-7 w-7 text-current opacity-80 hover:opacity-100 cursor-pointer"
                          title="Read note"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditMetadata(note)}
                          className="p-1 hover:bg-current/15 rounded transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                          title="Edit Note Metadata & Color"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete sticky note "${noteTitle}"?`)) {
                              deleteStickyNote(note.id);
                              toast.success('Sticky note deleted');
                            }
                          }}
                          className="p-1 hover:bg-red-500/25 rounded transition-colors opacity-80 hover:opacity-100 text-red-700 dark:text-red-400 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: WORD-LIKE MARKDOWN CANVAS EDITOR */}
      {/* ========================================================================= */}
      {activeView === 'editor' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 glass-regular shadow-lg overflow-hidden">
            {/* Canvas Header */}
            <div className="p-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView('gallery')}
                  className="gap-1.5 h-8 text-xs cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Board</span>
                </Button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-foreground">
                      {formTitle || 'Untitled Sticky Note'}
                    </h2>
                    <span
                      className="h-3 w-3 rounded-full border border-current"
                      style={{ backgroundColor: getColorMeta(formColor).hex }}
                      title={`Theme: ${getColorMeta(formColor).label}`}
                    />
                    <Badge variant="purple" className="text-[10px] font-mono">
                      {formPurpose}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {formSection}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-2">
                    <span>Date: {formDate}</span>
                    <span>•</span>
                    <button
                      onClick={() => setMetadataModalOpen(true)}
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                      <span>Edit Details & Color</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setMetadataModalOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Metadata</span>
                </Button>
                <Button onClick={handleSaveCanvasNote} variant="default" size="sm" className="gap-1.5 shadow-sm">
                  <Check className="h-4 w-4" />
                  <span>Save Note</span>
                </Button>
              </div>
            </div>

            {/* Microsoft Word-Style Formatting Ribbon Toolbar */}
            <div className="bg-muted/40 border-b border-border/70 p-2 flex flex-wrap items-center justify-between gap-2 select-none">
              {/* Group 1: Inline Formatting (Bold, Italic, Code) */}
              <div className="flex items-center gap-0.5 border-r border-border/60 pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('**', '**', 'bold text')}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('*', '*', 'italic text')}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('`', '`', 'formula or code')}
                  title="Inline Code / Formula"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Group 2: Headings (H1, H2, H3) */}
              <div className="flex items-center gap-0.5 border-r border-border/60 pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('# ', '', 'Major Heading')}
                  title="Heading 1"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('## ', '', 'Sub-heading')}
                  title="Heading 2"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('### ', '', 'Section Title')}
                  title="Heading 3"
                >
                  H3
                </Button>
              </div>

              {/* Group 3: Lists, Quotes & Dividers */}
              <div className="flex items-center gap-0.5 border-r border-border/60 pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('- ', '', 'Key point')}
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('1. ', '', 'Numbered step')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('> ', '', 'Important exam shortcut / rule')}
                  title="Quote / Important Rule"
                >
                  <Quote className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('\n---\n', '', '')}
                  title="Horizontal Divider Line"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Group 4: Templates & Accelerators */}
              <div className="flex items-center gap-1.5 border-r border-border/60 pr-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 px-2 font-medium cursor-pointer"
                  onClick={insertQATemplate}
                  title="Insert Problem & Solution Template"
                >
                  <HelpCircle className="h-3 w-3 text-amber-500" />
                  <span>+ Q&A Template</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 px-2 font-medium cursor-pointer"
                  onClick={insertFormulaTemplate}
                  title="Insert Formula Sheet Matrix Table"
                >
                  <TableIcon className="h-3 w-3 text-emerald-500" />
                  <span>+ Formula Table</span>
                </Button>
              </div>

              {/* Group 5: Notebook Photo Upload */}
              <div className="flex items-center gap-1.5 border-r border-border/60 pr-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1.5 px-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/40 font-semibold cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload photos of your physical notebook, solutions, or geometry diagrams"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Attach Notebook Photo</span>
                </Button>
              </div>

              {/* Group 6: Canvas Mode Switcher */}
              <div className="flex items-center gap-1 bg-background/80 rounded-lg p-0.5 border border-border/60">
                <button
                  type="button"
                  onClick={() => setCanvasMode('edit')}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer',
                    canvasMode === 'edit' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasMode('split')}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer',
                    canvasMode === 'split' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasMode('preview')}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer',
                    canvasMode === 'preview' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Formatted Word View
                </button>
              </div>
            </div>

            {/* Attached Notebook Photos Strip */}
            {editorImages.length > 0 && (
              <div className="p-2.5 bg-muted/20 border-b border-border/60 flex items-center gap-3 overflow-x-auto">
                <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Notebook Attachments ({editorImages.length}):
                </span>
                {editorImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group shrink-0 flex items-center gap-2 p-1.5 rounded-lg border border-border/80 bg-card shadow-xs"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      onClick={() => setLightboxImage(img.url)}
                      className="h-10 w-12 object-cover rounded cursor-pointer"
                    />
                    <div className="flex flex-col text-[10px] max-w-[120px] truncate">
                      <span className="font-semibold text-foreground truncate">{img.name}</span>
                      <button
                        type="button"
                        onClick={() => insertFormatting(`\n\n![${img.caption || img.name}](${img.url})\n\n`, '', '')}
                        className="text-purple-600 dark:text-purple-400 hover:underline text-left cursor-pointer"
                      >
                        + Insert Tag
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="text-muted-foreground hover:text-red-500 p-1 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Canvas Body */}
            <div className="p-4">
              <div
                className={cn(
                  'grid gap-4',
                  canvasMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                )}
              >
                {/* Editor Textarea */}
                {canvasMode !== 'preview' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pb-1">
                      <span>Markdown Canvas Editor</span>
                      <span>{editorContent.length} characters • {editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0} words</span>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      placeholder={`Type your notes here in markdown canvas...\n\nUse shortcuts in the toolbar above for bold, tables, Q&A blocks, and notebook image uploads.\n\nExample:\n### Core Theorem:\n- Statement\n\n| Case | Value |\n|---|---|\n| A | 100 |\n\n> Important shortcut for CAT exam`}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="min-h-[520px] font-mono text-xs leading-relaxed resize-y border-border/80 focus:border-purple-500"
                    />
                  </div>
                )}

                {/* Formatted Word View Preview */}
                {canvasMode !== 'edit' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pb-1">
                      <span>Live Formatted Word View</span>
                      <Badge variant="outline" className="text-[10px]">Document Page</Badge>
                    </div>
                    <div className="min-h-[520px] max-h-[720px] overflow-y-auto rounded-xl border border-border/80 bg-background p-6 shadow-xs">
                      {editorContent.trim() ? (
                        <div className="space-y-4">
                          <div className="border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                                {formSection} • {formPurpose}
                              </span>
                              <span
                                className="h-2.5 w-2.5 rounded-full inline-block"
                                style={{ backgroundColor: getColorMeta(formColor).hex }}
                              />
                            </div>
                            <h2 className="text-xl font-extrabold text-foreground mt-0.5">
                              {formTitle || 'Untitled Sticky Note'}
                            </h2>
                            <span className="text-xs text-muted-foreground font-mono">
                              Date: {formDate}
                            </span>
                          </div>

                          <MarkdownRenderer content={editorContent} />
                        </div>
                      ) : (
                        <div className="h-full py-32 text-center text-xs text-muted-foreground">
                          Start typing in the canvas editor to see your live formatted Word document here.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-4 border-t border-border/70 flex items-center justify-between bg-muted/20">
              <Button variant="outline" size="sm" onClick={() => setActiveView('gallery')}>
                Back to Sticky Board
              </Button>

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveCanvasNote} variant="default" size="sm" className="gap-1.5 shadow-sm">
                  <Check className="h-4 w-4" />
                  <span>Save Note</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. METADATA INTAKE MODAL (PROMPTS FOR NAME, PURPOSE, DATE, SECTION, COLOR) */}
      {/* ========================================================================= */}
      <Dialog open={metadataModalOpen} onOpenChange={setMetadataModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{editingNoteId ? 'Edit Sticky Note Metadata' : 'New Sticky Board Note Setup'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure the note's name, purpose, date, section, and color theme before opening the Word canvas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProceedToCanvas} className="space-y-4 py-2">
            {/* Note Name / Title */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Note Name / Title *
              </label>
              <Input
                placeholder="e.g. Euler & Wilson Theorem Applications, DILR Tournament Matrix..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="h-9 text-xs font-medium"
                autoFocus
              />
            </div>

            {/* Purpose / Category & Section in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Purpose */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Purpose / Category *
                </label>
                <select
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {NOTE_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                {formPurpose === 'Other' && (
                  <Input
                    placeholder="Specify custom purpose..."
                    value={formCustomPurpose}
                    onChange={(e) => setFormCustomPurpose(e.target.value)}
                    className="mt-1.5 h-8 text-xs"
                    autoFocus
                  />
                )}
              </div>

              {/* Subject Section */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Subject Section *
                </label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Quant">Quant (Mathematics)</option>
                  <option value="DILR">DILR (Logic & Data)</option>
                  <option value="VARC">VARC (Verbal & RC)</option>
                  <option value="General">General / Strategy</option>
                </select>
              </div>
            </div>

            {/* Date & Topic Link in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              {/* Optional Topic Link */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Topic Link (Optional)
                </label>
                <select
                  value={formTopicId}
                  onChange={(e) => setFormTopicId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer truncate"
                >
                  <option value="">None / General</option>
                  {relevantTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.topicName} ({t.section})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Color Palette & Theme
              </label>
              <div className="grid grid-cols-6 gap-2">
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setFormColor(c.name)}
                    className={cn(
                      'h-8 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer',
                      formColor === c.name
                        ? 'border-foreground scale-105 shadow-sm'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  >
                    {formColor === c.name && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pin to Top Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pin-note-checkbox"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="pin-note-checkbox" className="text-xs text-foreground font-medium cursor-pointer">
                Pin this sticky note to the top of the board
              </label>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setMetadataModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickSaveNote}
                className="cursor-pointer"
              >
                Save as Quick Sticky
              </Button>
              <Button type="submit" variant="default" size="sm" className="gap-1.5 shadow-sm cursor-pointer">
                <FileText className="h-4 w-4" />
                <span>Open Word Canvas Editor</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. DOCUMENT READER MODAL */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(readingNote)} onOpenChange={(open) => !open && setReadingNote(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {readingNote && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={readingNote.section === 'Quant' ? 'quant' : readingNote.section === 'DILR' ? 'dilr' : readingNote.section === 'VARC' ? 'varc' : 'outline'}>
                    {readingNote.section || 'General'}
                  </Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-500/30">
                    {readingNote.purpose || 'Concept Summary'}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground ml-auto">
                    {readingNote.date || (readingNote.createdAt ? readingNote.createdAt.split('T')[0] : '2026-11-22')}
                  </span>
                </div>

                <DialogTitle className="text-xl font-extrabold text-foreground pt-1">
                  {readingNote.title || 'Untitled Sticky Note'}
                </DialogTitle>
              </DialogHeader>

              {/* Attached Notebook Photos */}
              {readingNote.images && readingNote.images.length > 0 && (
                <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Attached Notebook Scans ({readingNote.images.length}):
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {readingNote.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setLightboxImage(img.url)}
                        className="group relative shrink-0 rounded-lg overflow-hidden border border-border/70 cursor-pointer shadow-xs"
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="h-28 w-36 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold">
                          Click to enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Markdown Body */}
              <div className="py-2 text-foreground">
                <MarkdownRenderer content={readingNote.content} />
              </div>

              <DialogFooter className="border-t border-border/60 pt-4 flex items-center justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleOpenCanvasForNote(readingNote)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Open in Word Canvas Editor</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReadingNote(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. LIGHTBOX MODAL FOR NOTEBOOK SCANS */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(lightboxImage)} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-zinc-800">
          {lightboxImage && (
            <div className="relative flex flex-col items-center justify-center p-2">
              <img
                src={lightboxImage}
                alt="Notebook scan high-resolution view"
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
              <p className="text-xs text-zinc-400 mt-2 text-center font-mono">
                High-Resolution Notebook Scan View
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
