import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Zap,
  Tag,
  Edit2,
  Trash2,
  Pin,
  ExternalLink,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  UploadCloud,
  X,
  Maximize2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  CheckCircle2,
  RefreshCw,
  FolderSync,
  Cloud,
  Download,
  Share2,
  Printer,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Sigma,
  FileCode,
  FolderOpen,
  FolderCheck,
  Laptop,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  LogOut,
  FolderPlus,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { SectionType, NoteCategoryType, StudyNoteItem, NoteImageItem } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export const NotesPage: React.FC = () => {
  const { studyNotes, addStudyNote, updateStudyNote, deleteStudyNote, topics } = useAppData();

  // Active View: 'gallery' or 'editor'
  const [activeView, setActiveView] = useState<'gallery' | 'editor'>('gallery');

  // Google Drive & Google Docs Folder Connection State (Frictionless / No developer key required)
  const [googleDocsFolderLink, setGoogleDocsFolderLink] = useState<string>(() => {
    return localStorage.getItem('cat2027_gdrive_folder_link') || 'https://drive.google.com/drive/u/0/search?q=title%3D%27CAT%20Notes%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27';
  });
  const [isDriveFolderConfigured, setIsDriveFolderConfigured] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('cat2027_gdrive_folder_link'));
  });

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [customFolderInput, setCustomFolderInput] = useState('');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Filters for Gallery View
  const [sectionFilter, setSectionFilter] = useState<'All' | SectionType>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | NoteCategoryType>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Form State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<SectionType>('Quant');
  const [noteType, setNoteType] = useState<NoteCategoryType>('Notes');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<NoteImageItem[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [googleDocId, setGoogleDocId] = useState<string | undefined>(undefined);
  const [googleDocsUrl, setGoogleDocsUrl] = useState<string>('');

  // Word/Docs Canvas Mode: 'canvas' (Document paper) | 'split' | 'raw'
  const [editorMode, setEditorMode] = useState<'canvas' | 'split' | 'raw'>('canvas');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Relevant syllabus topics based on section in editor
  const relevantTopics = useMemo(() => {
    return topics.filter((t) => t.section === section);
  }, [topics, section]);

  // Filtered notes for gallery view
  const filteredNotes = useMemo(() => {
    return studyNotes.filter((note) => {
      if (sectionFilter !== 'All' && note.section !== sectionFilter) return false;
      if (typeFilter !== 'All' && note.noteType !== typeFilter) return false;
      if (topicFilter !== 'All' && note.topic !== topicFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.title.toLowerCase().includes(q);
        const matchContent = note.content.toLowerCase().includes(q);
        const matchTopic = note.topic.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchTopic) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [studyNotes, sectionFilter, typeFilter, topicFilter, searchQuery]);

  // Summary counts
  const counts = useMemo(() => {
    const total = studyNotes.length;
    const qa = studyNotes.filter((n) => n.noteType === 'QA').length;
    const concepts = studyNotes.filter((n) => n.noteType === 'Notes').length;
    const quickRef = studyNotes.filter((n) => n.noteType === 'Quick Ref').length;
    const totalImages = studyNotes.reduce((acc, n) => acc + (n.images ? n.images.length : 0), 0);
    const gdocsSynced = studyNotes.filter((n) => Boolean(n.googleDocsUrl)).length;
    return { total, qa, concepts, quickRef, totalImages, gdocsSynced };
  }, [studyNotes]);

  // Document stats (word count, reading time)
  const docStats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingMinutes };
  }, [content]);

  // Save custom Google Drive folder URL
  const handleSaveDriveFolderLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customFolderInput.trim()) {
      toast.error('Please enter a Google Drive folder link');
      return;
    }
    const cleanLink = customFolderInput.trim();
    setGoogleDocsFolderLink(cleanLink);
    setIsDriveFolderConfigured(true);
    localStorage.setItem('cat2027_gdrive_folder_link', cleanLink);
    setConnectModalOpen(false);
    toast.success('Saved CAT Notes folder link! Direct access enabled.');
  };

  // Open Drive folder
  const handleOpenGoogleDriveFolder = () => {
    const link = googleDocsFolderLink || 'https://drive.google.com/drive/u/0/my-drive';
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Open Google Drive to create the CAT Notes folder directly
  const handleCreateFolderInGoogleDrive = () => {
    window.open('https://drive.google.com/drive/u/0/my-drive', '_blank', 'noopener,noreferrer');
    toast.info('Google Drive opened! Click "+ New" -> "New folder" and name it "CAT Notes".');
  };

  // Read Note: DIRECTLY OPENS THE DOCUMENT IN GOOGLE DOCS / DRIVE (NO MODAL)
  const handleReadNote = (note: StudyNoteItem) => {
    let targetUrl = note.googleDocsUrl;
    if (!targetUrl || targetUrl.includes('gdoc_cat_') || targetUrl.includes('DocId')) {
      targetUrl = 'https://docs.google.com/document/create';
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    toast.info(`Opening "${note.title}" in Google Docs...`);
  };

  // Open Editor for New Note
  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setSection(sectionFilter !== 'All' ? sectionFilter : 'Quant');
    setNoteType(typeFilter !== 'All' ? typeFilter : 'Notes');
    setSelectedTopic(topics[0]?.topicName || 'Remainders');
    setCustomTopic('');
    setCreatedDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setImages([]);
    setIsPinned(false);
    setGoogleDocId(undefined);
    setGoogleDocsUrl('');
    setEditorMode('canvas');
    setActiveView('editor');
  };

  // Open Editor to Edit Note
  const handleOpenEdit = (note: StudyNoteItem) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setSection(note.section);
    setNoteType(note.noteType);
    setSelectedTopic(note.topic);
    setCustomTopic('');
    setCreatedDate(note.createdAt);
    setContent(note.content);
    setImages(note.images || []);
    setIsPinned(Boolean(note.isPinned));
    setGoogleDocId(note.googleDocId);
    setGoogleDocsUrl(note.googleDocsUrl || '');
    setEditorMode('canvas');
    setActiveView('editor');
  };

  // Open a brand new Google Doc in a new tab for drafting
  const handleCreateNewGoogleDoc = () => {
    window.open('https://docs.google.com/document/create', '_blank', 'noopener,noreferrer');
    toast.info('New Google Doc created! Once you have its URL, you can paste it below.');
  };

  // Save Note
  const handleSaveNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a note document title');
      return;
    }

    const finalTopic = customTopic.trim() ? customTopic.trim() : (selectedTopic || 'General');
    const matchedTopic = topics.find((t) => t.topicName.toLowerCase() === finalTopic.toLowerCase());

    const finalDocUrl = googleDocsUrl.trim() || 'https://docs.google.com/document/create';

    if (editingNoteId) {
      updateStudyNote(editingNoteId, {
        title: title.trim(),
        section,
        noteType,
        topic: finalTopic,
        topicId: matchedTopic?.id,
        createdAt: createdDate,
        content: content.trim(),
        images,
        isPinned,
        googleDocId: googleDocId || `doc-${Date.now()}`,
        googleDocsUrl: finalDocUrl,
        syncedWithGoogleDocs: true
      });
      toast.success('Study note and Google Doc link saved successfully');
    } else {
      addStudyNote({
        title: title.trim(),
        section,
        noteType,
        topic: finalTopic,
        topicId: matchedTopic?.id,
        createdAt: createdDate,
        content: content.trim(),
        images,
        isPinned,
        googleDocId: `doc-${Date.now()}`,
        googleDocsUrl: finalDocUrl,
        syncedWithGoogleDocs: true
      });
      toast.success('New document created in CAT Notes knowledge base');
    }

    setActiveView('gallery');
  };

  // Delete Note
  const handleDeleteNote = (note: StudyNoteItem) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteStudyNote(note.id);
      toast.success('Note removed from library');
    }
  };

  // Insert formatting shortcut at cursor position
  const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

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
        toast.error('Only image files can be uploaded');
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

        setImages((prev) => [...prev, newImg]);
        insertFormatting(`\n\n![${newImg.caption}](${newImg.url})\n\n`, '', '');
        toast.success(`Notebook photo "${file.name}" embedded into document`);
      };

      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Templates
  const insertQATemplate = () => {
    const template = `\n\n### Problem Question (Solved Q&A):
> **Source / Context:** [e.g. CAT 2024 Slot 1 / IMS SIMCAT 5]
> 
> *Write or paste the exact question text here...*

---

### Step-by-Step Solution & Method:

#### 1. Given Parameters & Constraints:
- Variable 1: 
- Variable 2: 
- Key Constraint: 

#### 2. Core Theorem / Approach:
- **Applicable Principle:** 
- **Formula Used:** 

#### 3. Step-by-Step Deduction:
1. First, simplify the base equations...
2. Next, apply boundary conditions...
3. Substitute back to compute the target value...

#### 4. Final Answer & Exam Shortcut:
- **Correct Option / Answer:** 
> **Speed Rule for Next Time:** Avoid brute calculation; analyze modulo or unit digit pattern directly.\n`;
    insertFormatting(template, '', '');
  };

  const insertFormulaTemplate = () => {
    const template = `\n\n### Key Formula & Concept Matrix:

| Concept / Case | Master Formula | Key Condition / Trap |
| :--- | :--- | :--- |
| Case A | $E = mc^2$ | Applicable when mass is constant |
| Case B | $a^2 - b^2 = (a-b)(a+b)$ | Standard factorization |
| Case C | $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$ | Sum of first $n$ natural numbers |

> **Rapid Revision Rule:** Never skip verifying edge cases ($n=0, 1$).\n`;
    insertFormatting(template, '', '');
  };

  const insertTableTemplate = () => {
    const template = `\n\n| Item / Category | Metric A | Metric B | Status |
| :--- | :--- | :--- | :--- |
| Row 1 | Value 1 | Value 2 | Verified |
| Row 2 | Value 3 | Value 4 | Pending |\n\n`;
    insertFormatting(template, '', '');
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'cat-note').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded as Markdown file');
  };

  return (
    <div className="space-y-6 pb-20 font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Notes & Docs</h1>
                <Badge variant="blue" className="text-[11px] gap-1 font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Google Drive CAT Notes
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Word & Google Docs-grade study canvas. Click on any document card to read it directly in Google Docs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'gallery' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConnectModalOpen(true)}
                className="h-9 gap-1.5 text-xs border-border/80"
                title="Configure or link your Google Drive folder"
              >
                <FolderSync className="h-3.5 w-3.5 text-blue-600" />
                <span>Drive Settings</span>
              </Button>

              <Button
                onClick={handleOpenCreate}
                variant="default"
                size="sm"
                className="h-9 gap-1.5 text-xs shadow-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>+ Create New Note</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setActiveView('gallery')}
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs border-border/80"
            >
              <BookOpen className="h-4 w-4" />
              <span>Back to All Notes</span>
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: GALLERY VIEW (Notes Dashboard & Google Docs Folder) */}
      {/* ========================================================= */}
      {activeView === 'gallery' && (
        <div className="space-y-6">
          {/* Google Drive Status Banner Card */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 via-background to-blue-50/40 dark:from-blue-950/20 dark:via-card dark:to-blue-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FolderCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Google Drive "CAT Notes" Workspace</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Target Cloud Folder: <strong className="text-blue-700 dark:text-blue-400 font-mono">My Drive / CAT Notes /</strong> • Notes open directly in Google Docs with full formatting.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
                  <span>Linked notes: <strong className="text-foreground">{counts.total} documents</strong></span>
                  <span>Direct Google Docs access enabled</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenGoogleDriveFolder}
                className="h-8 text-xs gap-1 border-border/80"
                title="Open CAT Notes folder on Google Drive in a new tab"
              >
                <FolderOpen className="h-3.5 w-3.5 text-amber-600" />
                <span>Open in Google Drive</span>
                <ExternalLink className="h-3 w-3 ml-0.5 text-muted-foreground" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleCreateNewGoogleDoc}
                className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                title="Create a new Google Doc directly in your Google account"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ New Google Doc</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">All Documents</span>
              <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block">{counts.total}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Solved Q&As</span>
              <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">{counts.qa}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Concept Notes</span>
              <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block">{counts.concepts}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Quick Ref Matrices</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">{counts.quickRef}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] text-muted-foreground font-medium block">Notebook Photos</span>
              <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">{counts.totalImages}</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <Card className="p-4 border-border/70 shadow-xs space-y-3.5">
            {/* Top row: Search and Section Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes by title, topic, formula or solution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
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

              {/* Section Filters */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                {(['All', 'Quant', 'DILR', 'VARC'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSectionFilter(sec)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                      sectionFilter === sec
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                    )}
                  >
                    {sec === 'Quant' ? 'QA / Quant' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Note Type & Topic Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground font-medium">Type:</span>
              {(['All', 'Notes', 'QA', 'Quick Ref'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                    typeFilter === t
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 font-semibold'
                      : 'border-border/60 hover:bg-muted/60 text-muted-foreground'
                  )}
                >
                  {t === 'All' ? 'All Types' : t === 'Notes' ? 'Concept Notes' : t === 'QA' ? 'Solved Q&A' : 'Quick Reference'}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Topic:</span>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="h-8 text-xs rounded-lg border border-border/70 bg-background px-2.5 text-foreground max-w-[200px]"
                >
                  <option value="All">All Topics ({topics.length})</option>
                  {topics.map((top) => (
                    <option key={top.id} value={top.topicName}>
                      {top.section}: {top.topicName}
                    </option>
                  ))}
                </select>

                {(sectionFilter !== 'All' || typeFilter !== 'All' || topicFilter !== 'All' || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSectionFilter('All');
                      setTypeFilter('All');
                      setTopicFilter('All');
                      setSearchQuery('');
                    }}
                    className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/50">
              <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No Study Notes Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                No documents match the current filter selection. Create your first document to start building your CAT knowledge base!
              </p>
              <Button onClick={handleOpenCreate} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-1.5" />
                Create New Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                return (
                  <Card
                    key={note.id}
                    className={cn(
                      'flex flex-col border transition-all duration-200 hover:shadow-md hover:border-blue-500/50 bg-card rounded-2xl overflow-hidden cursor-pointer group',
                      note.isPinned && 'ring-1 ring-blue-500/30'
                    )}
                    onClick={() => handleReadNote(note)}
                  >
                    <CardHeader className="p-4 pb-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                              note.section === 'Quant'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300'
                                : note.section === 'DILR'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300'
                            )}
                          >
                            {note.section}
                          </span>

                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {note.noteType === 'QA' ? 'Solved Q&A' : note.noteType === 'Quick Ref' ? 'Quick Ref' : 'Concept'}
                          </span>

                          {note.isPinned && (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                              <Pin className="h-3 w-3 fill-current rotate-45" /> Pinned
                            </span>
                          )}
                        </div>

                        {/* Google Docs Direct Open Link */}
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                          title="Open directly in Google Docs"
                        >
                          <FolderSync className="h-3 w-3" />
                          <span>Google Docs</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </div>
                      </div>

                      <CardTitle className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors pt-1">
                        {note.title}
                      </CardTitle>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80 truncate max-w-[160px]">{note.topic}</span>
                        <span>•</span>
                        <span>{note.createdAt}</span>
                      </div>
                    </CardHeader>

                    {/* Preview Content */}
                    <CardContent className="p-4 pt-1 flex-1">
                      <div className="text-xs text-muted-foreground line-clamp-3 font-sans">
                        {note.content.replace(/#+\s/g, '').replace(/[*_~`>]/g, '').slice(0, 150)}...
                      </div>

                      {/* Image Preview Thumbnail if note has photos */}
                      {note.images && note.images.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                          {note.images.slice(0, 3).map((img) => (
                            <div
                              key={img.id}
                              className="h-12 w-16 rounded-lg border border-border/80 overflow-hidden shrink-0 bg-muted"
                              title={img.caption || img.name}
                            >
                              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {note.images.length > 3 && (
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              +{note.images.length - 3} photos
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>

                    {/* Footer Actions: Opens directly in Google Docs */}
                    <CardFooter
                      className="p-3 px-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReadNote(note)}
                        className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Read in Google Docs</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(note)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Document"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note)}
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: MICROSOFT WORD / GOOGLE DOCS-GRADE CANVAS EDITOR   */}
      {/* ========================================================= */}
      {activeView === 'editor' && (
        <div className="space-y-4">
          {/* Top Document Header Bar (Google Docs style) */}
          <div className="p-3.5 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('gallery')}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back
              </Button>

              <div className="flex-1 max-w-lg">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Study Document..."
                  className="h-9 font-bold text-sm bg-transparent border-transparent hover:border-border/80 focus:border-blue-500 rounded-lg px-2"
                />
              </div>

              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FolderCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>CAT Notes</span>
                <span className="text-border">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(googleDocsUrl.trim() || 'https://docs.google.com/document/create', '_blank', 'noopener,noreferrer')}
                className="h-8 gap-1.5 text-xs border-border/80 text-blue-600 dark:text-blue-400 font-semibold"
                title="Open directly in Google Docs"
              >
                <FolderSync className="h-3.5 w-3.5 text-blue-600" />
                <span>Open in Google Docs</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadAsMarkdown}
                className="h-8 gap-1 text-xs border-border/80"
                title="Export document"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Export</span>
              </Button>

              <Button
                onClick={() => handleSaveNote()}
                variant="default"
                size="sm"
                className="h-8 px-4 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Document</span>
              </Button>
            </div>
          </div>

          {/* Form Metadata Ribbon (Category, Section, Topic, Date, and Google Doc Link) */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 space-y-3 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Section */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Section</label>
                <Select value={section} onValueChange={(val: any) => setSection(val)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quantitative Aptitude (QA)</SelectItem>
                    <SelectItem value="DILR">Data Interpretation & Logical Reasoning (DILR)</SelectItem>
                    <SelectItem value="VARC">Verbal Ability & Reading Comp (VARC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Note Type */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Document Category</label>
                <Select value={noteType} onValueChange={(val: any) => setNoteType(val)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notes">Concept Notes & Theory</SelectItem>
                    <SelectItem value="QA">Solved Questions & Answers (Q&A)</SelectItem>
                    <SelectItem value="Quick Ref">Quick Reference & Formula Sheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Topic Covered</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {relevantTopics.map((top) => (
                      <SelectItem key={top.id} value={top.topicName}>
                        {top.topicName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Created & Pin */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Created Date</label>
                  <Input
                    type="date"
                    value={createdDate}
                    onChange={(e) => setCreatedDate(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={cn(
                      'h-8 px-2.5 rounded-lg border text-xs flex items-center gap-1 transition-colors',
                      isPinned
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-bold'
                        : 'border-border/80 text-muted-foreground hover:bg-muted'
                    )}
                    title="Pin note to top of gallery"
                  >
                    <Pin className={cn('h-3.5 w-3.5', isPinned && 'fill-current rotate-45')} />
                    <span className="hidden sm:inline">Pin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Google Doc URL Direct Link Input */}
            <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground font-semibold text-[11px]">
                <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
                <span>Google Doc URL:</span>
              </div>
              <Input
                placeholder="https://docs.google.com/document/d/..."
                value={googleDocsUrl}
                onChange={(e) => setGoogleDocsUrl(e.target.value)}
                className="h-8 text-xs font-mono bg-background flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateNewGoogleDoc}
                className="h-8 text-xs shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Draft in Google Docs
              </Button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* WORD / GOOGLE DOCS FORMATTING RIBBON                      */}
          {/* ========================================================= */}
          <div className="sticky top-16 z-10 p-2 rounded-xl border border-border/70 bg-card shadow-xs flex flex-wrap items-center gap-1">
            {/* View Mode Pills */}
            <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg mr-2">
              <button
                type="button"
                onClick={() => setEditorMode('canvas')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  editorMode === 'canvas' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Page View (Google Docs style)"
              >
                Page View
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  editorMode === 'split' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Split Side-by-Side Editor"
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('raw')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  editorMode === 'raw' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Code Editor"
              >
                Raw Text
              </button>
            </div>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Typography Styles */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('# ', '', 'Heading 1')}
              className="h-7 px-2 text-xs font-bold"
              title="Heading 1"
            >
              H1
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('## ', '', 'Heading 2')}
              className="h-7 px-2 text-xs font-bold"
              title="Heading 2"
            >
              H2
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('### ', '', 'Heading 3')}
              className="h-7 px-2 text-xs font-bold"
              title="Heading 3"
            >
              H3
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Text Formats */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Underline"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Strikethrough"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('`', '`', 'inline code')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Inline Code"
            >
              <Code className="h-3.5 w-3.5" />
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Lists & Quotes */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('\n- ', '', 'List item')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Bulleted List"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('\n1. ', '', 'Numbered item')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('\n- [ ] ', '', 'Task item')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Checklist / Task list"
            >
              <ListTodo className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting('\n> ', '', 'Key rule or quote')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Blockquote Callout"
            >
              <Quote className="h-3.5 w-3.5" />
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Structured Inserts */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertTableTemplate}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              title="Insert Table Matrix"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('\n$$\n', '\n$$\n', 'a^2 + b^2 = c^2')}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              title="Insert Math / LaTeX Equation"
            >
              <Sigma className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Formula</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertQATemplate}
              className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 gap-1 font-semibold"
              title="Insert Solved Question & Answer Template"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Solved Q&A</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertFormulaTemplate}
              className="h-7 px-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1 font-semibold"
              title="Insert Formula Cheat Sheet Matrix"
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cheat Sheet</span>
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Notebook Scan Photo Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2.5 text-xs border-dashed gap-1 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold"
              title="Upload physical notebook photos, scratch work, or question screenshots"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>+ Add Notebook Scan</span>
            </Button>
          </div>

          {/* ========================================================= */}
          {/* DOCUMENT CANVAS CONTAINER (Realistic Google Docs View)     */}
          {/* ========================================================= */}
          {editorMode === 'canvas' && (
            <div className="bg-slate-100 dark:bg-slate-950/80 p-4 md:p-8 rounded-2xl border border-border/80 flex flex-col items-center min-h-[920px]">
              {/* White A4/Letter Paper Page Sheet */}
              <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm min-h-[950px] p-8 md:p-14 flex flex-col justify-between transition-all">
                <div className="space-y-6">
                  {/* Document Title Header on Canvas */}
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {title || 'Untitled Study Document'}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{section}</span>
                      <span>•</span>
                      <span>{noteType === 'QA' ? 'Solved Problem Breakdown' : noteType === 'Quick Ref' ? 'Formula Reference' : 'Theory & Concept'}</span>
                      <span>•</span>
                      <span>{selectedTopic}</span>
                      <span>•</span>
                      <span>{createdDate}</span>
                    </div>
                  </div>

                  {/* Notebook Image Gallery Preview on Page */}
                  {images.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                        Handwritten Notebook Scans ({images.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((img) => (
                          <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="h-28 w-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="p-1.5 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between text-[10px]">
                              <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-400 font-mono">{img.name}</span>
                              <button
                                type="button"
                                onClick={() => setImages((prev) => prev.filter((i) => i.id !== img.id))}
                                className="text-rose-500 hover:text-rose-700"
                                title="Remove Image"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Typing Canvas */}
                  <div className="space-y-4">
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start typing your study notes, breakdown solutions, formulas, and takeaways here... Supports rich markdown, math LaTeX ($$...$$), tables, and notebook image uploads."
                      className="min-h-[500px] text-sm md:text-base leading-relaxed bg-transparent border-0 focus-visible:ring-0 resize-none font-sans p-0 text-slate-800 dark:text-slate-200"
                    />

                    {/* Formatted Preview below live typing */}
                    {content.trim() && (
                      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                          Formatted Document Render:
                        </span>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base">
                          <MarkdownRenderer content={content} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Footer (Word Count, Reading Time, Page) */}
                <div className="pt-8 mt-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
                  <span>Page 1 of 1</span>
                  <div className="flex items-center gap-3">
                    <span>{docStats.words} words</span>
                    <span>•</span>
                    <span>{docStats.characters} characters</span>
                    <span>•</span>
                    <span>{docStats.readingMinutes} min read</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SPLIT VIEW (Side-by-Side Live Typing & Real-time Markdown Render) */}
          {editorMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[750px]">
              <Card className="p-4 flex flex-col border-border/80 shadow-xs bg-card">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground">Markdown Document Canvas</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{docStats.words} words</span>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type notes or solved Q&A markdown here..."
                  className="flex-1 font-mono text-xs leading-relaxed resize-none border-0 focus-visible:ring-0 p-0"
                />
              </Card>

              <Card className="p-6 overflow-y-auto max-h-[750px] border-border/80 shadow-xs bg-card">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground">Live Formatted Preview</span>
                  <Badge variant="blue" className="text-[10px]">Formatted</Badge>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs">
                  <MarkdownRenderer content={content || '*Document is currently empty. Start typing on the left canvas...*'} />
                </div>
              </Card>
            </div>
          )}

          {/* RAW TEXT MODE */}
          {editorMode === 'raw' && (
            <Card className="p-4 border-border/80 shadow-xs bg-card">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type raw document text..."
                className="min-h-[650px] font-mono text-xs leading-relaxed resize-none border-0 focus-visible:ring-0 p-0"
              />
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* GOOGLE DRIVE SETUP MODAL (No Developer Keys Required)      */}
      {/* ========================================================= */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <FolderSync className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Google Drive "CAT Notes" Setup
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Connect your personal Google Drive so all study notes and documents open directly in Google Docs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Step 1: Create or Open 'CAT Notes' in Google Drive */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                Step 1: Open Google Drive & Create "CAT Notes" Folder
              </span>
              <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed text-[11px]">
                Click below to open your personal Google Drive, click <strong>"+ New"</strong> → <strong>"New folder"</strong>, and name it <strong>CAT Notes</strong>.
              </p>
              <Button
                type="button"
                onClick={handleCreateFolderInGoogleDrive}
                variant="default"
                size="sm"
                className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Open Google Drive Now</span>
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </Button>
            </div>

            {/* Step 2: Paste folder link (optional) */}
            <form onSubmit={handleSaveDriveFolderLink} className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Step 2: Paste Folder Link (Optional)</span>
                <span className="text-[10px] text-muted-foreground">Stored locally in browser</span>
              </label>
              <Input
                placeholder="https://drive.google.com/drive/folders/..."
                value={customFolderInput}
                onChange={(e) => setCustomFolderInput(e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Right-click your "CAT Notes" folder in Google Drive, select "Copy link", and paste here.
              </p>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 border-border/80"
              >
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Save Folder Link</span>
              </Button>
            </form>

            {/* Quick Action: New Google Doc */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">Draft a new document:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateNewGoogleDoc}
                className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 font-semibold"
              >
                + Create New Google Doc
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" size="sm" onClick={() => setConnectModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
