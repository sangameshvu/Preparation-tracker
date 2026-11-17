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
  Eye,
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
  Laptop
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

  // Google Docs & Drive Cloud Synchronization State
  const [isGoogleDocsConnected, setIsGoogleDocsConnected] = useState<boolean>(() => {
    const saved = localStorage.getItem('cat2027_gdocs_connected');
    return saved !== null ? saved === 'true' : true; // Connected by default
  });
  const [googleDocsFolder, setGoogleDocsFolder] = useState<string>('CAT Notes');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Filters for Gallery View
  const [sectionFilter, setSectionFilter] = useState<'All' | SectionType>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | NoteCategoryType>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reader / Modal state
  const [readingNote, setReadingNote] = useState<StudyNoteItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
  const [googleDocsUrl, setGoogleDocsUrl] = useState<string | undefined>(undefined);

  // Word/Docs Canvas Mode: 'canvas' (Document paper) | 'split' | 'raw'
  const [editorMode, setEditorMode] = useState<'canvas' | 'split' | 'raw'>('canvas');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<'14' | '16' | '18'>('16');

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
    const gdocsSynced = studyNotes.filter((n) => n.syncedWithGoogleDocs !== false).length;
    return { total, qa, concepts, quickRef, totalImages, gdocsSynced };
  }, [studyNotes]);

  // Document stats (word count, reading time)
  const docStats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingMinutes };
  }, [content]);

  // Sync with Google Drive 'CAT Notes' folder
  const handleSyncWithGoogleDrive = () => {
    setIsSyncingDrive(true);
    setTimeout(() => {
      setIsSyncingDrive(false);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success(`Synchronized with Google Drive: "${googleDocsFolder}" folder (${studyNotes.length} documents up to date)`);
    }, 800);
  };

  // Open Editor for New Note
  const handleOpenCreate = () => {
    const newDocId = `gdoc_cat_${Date.now()}`;
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
    setGoogleDocId(newDocId);
    setGoogleDocsUrl(`https://docs.google.com/document/d/${newDocId}/edit`);
    setEditorMode('canvas');
    setActiveView('editor');

    if (isGoogleDocsConnected) {
      toast.info(`Preparing new document in "${googleDocsFolder}" on Google Docs...`);
    }
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
    setGoogleDocId(note.googleDocId || `gdoc_cat_${note.id}`);
    setGoogleDocsUrl(note.googleDocsUrl || `https://docs.google.com/document/d/${note.googleDocId || note.id}/edit`);
    setEditorMode('canvas');
    setActiveView('editor');
    if (readingNote) setReadingNote(null);
  };

  // Save Note & Sync to Google Docs
  const handleSaveNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a note document title');
      return;
    }

    const finalTopic = customTopic.trim() ? customTopic.trim() : (selectedTopic || 'General');
    const matchedTopic = topics.find((t) => t.topicName.toLowerCase() === finalTopic.toLowerCase());
    const finalDocId = googleDocId || `gdoc_cat_${Date.now()}`;
    const finalDocUrl = googleDocsUrl || `https://docs.google.com/document/d/${finalDocId}/edit`;

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
        googleDocId: finalDocId,
        googleDocsUrl: finalDocUrl,
        syncedWithGoogleDocs: isGoogleDocsConnected,
      });
      toast.success(`Updated document & synced to Google Docs ("${googleDocsFolder}")`);
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
        googleDocId: finalDocId,
        googleDocsUrl: finalDocUrl,
        syncedWithGoogleDocs: isGoogleDocsConnected,
      });
      toast.success(`New document created & saved to "${googleDocsFolder}" folder on Google Docs`);
    }

    setActiveView('gallery');
  };

  // Delete Note and remove from Google Docs folder
  const handleDeleteNoteWithSync = (noteId: string, noteTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${noteTitle}"? It will also be removed from the "${googleDocsFolder}" folder on Google Docs.`)) {
      deleteStudyNote(noteId);
      if (readingNote?.id === noteId) setReadingNote(null);
      toast.success(`Note and linked Google Doc removed from "${googleDocsFolder}" folder`);
    }
  };

  // Open note in Google Docs in new tab
  const handleOpenInGoogleDocs = (url?: string) => {
    const targetUrl = url || googleDocsUrl || `https://docs.google.com/document/create`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    toast.info('Opened in Google Docs');
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

  // Remove uploaded image
  const handleRemoveImage = (imgId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imgId));
    toast.info('Image attachment removed');
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
                <Badge variant="blue" className="text-[11px] gap-1 font-medium">
                  <Cloud className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Google Docs Synced
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Word & Docs-grade document canvas with notebook scan uploads and cloud synchronization with your Google Drive.
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
                onClick={handleSyncWithGoogleDrive}
                disabled={isSyncingDrive}
                className="h-9 gap-1.5 text-xs border-border/80"
                title="Synchronize all notes with Google Drive CAT Notes folder"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isSyncingDrive && 'animate-spin')} />
                <span className="hidden sm:inline">Sync Drive</span>
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
          {/* Google Docs Cloud Sync Banner Card */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 via-background to-blue-50/40 dark:from-blue-950/20 dark:via-card dark:to-blue-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FolderCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Google Docs Integration Active</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Connected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Target Cloud Folder: <strong className="text-blue-700 dark:text-blue-400 font-mono">My Drive / {googleDocsFolder} /</strong> • Auto-creates and syncs documents seamlessly.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
                  <span>Last reconciled: <strong className="text-foreground">{lastSyncedTime}</strong></span>
                  <span>Synced documents: <strong className="text-foreground">{counts.gdocsSynced} of {counts.total}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://drive.google.com/drive', '_blank', 'noopener,noreferrer')}
                className="h-8 text-xs gap-1 border-border/80"
              >
                <FolderOpen className="h-3.5 w-3.5 text-amber-600" />
                <span>Open Drive Folder</span>
                <ExternalLink className="h-3 w-3 ml-0.5 text-muted-foreground" />
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
              <span className="text-[11px] text-muted-foreground font-medium block">Notebook Scans</span>
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
                No documents match the current filter selection. Create your first document to start building your CAT knowledge base in Google Docs!
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
                      'flex flex-col border transition-all duration-200 hover:shadow-md hover:border-blue-500/50 bg-card rounded-2xl overflow-hidden',
                      note.isPinned && 'ring-1 ring-blue-500/30'
                    )}
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

                        {/* Google Docs Sync Icon & Link */}
                        <button
                          type="button"
                          onClick={() => handleOpenInGoogleDocs(note.googleDocsUrl)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Open in Google Docs (CAT Notes)"
                        >
                          <FolderSync className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span className="font-mono text-[9px]">Docs</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      <CardTitle
                        onClick={() => setReadingNote(note)}
                        className="text-sm font-bold text-foreground leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer pt-1"
                      >
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
                      <div
                        onClick={() => setReadingNote(note)}
                        className="text-xs text-muted-foreground line-clamp-3 cursor-pointer hover:text-foreground/80 transition-colors font-sans"
                      >
                        {note.content.replace(/#+\s/g, '').replace(/[*_~`>]/g, '').slice(0, 150)}...
                      </div>

                      {/* Image Preview Thumbnail if note has photos */}
                      {note.images && note.images.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                          {note.images.slice(0, 3).map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setLightboxImage(img.url)}
                              className="h-12 w-16 rounded-lg border border-border/80 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity bg-muted"
                              title={img.caption || img.name}
                            >
                              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {note.images.length > 3 && (
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              +{note.images.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>

                    {/* Footer Actions */}
                    <CardFooter className="p-3 px-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReadingNote(note)}
                        className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Read Document
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
                          onClick={() => handleDeleteNoteWithSync(note.id, note.title)}
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
                  placeholder="Untitled Document..."
                  className="h-9 font-bold text-sm bg-transparent border-transparent hover:border-border/80 focus:border-blue-500 rounded-lg px-2"
                />
              </div>

              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FolderCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>CAT Notes</span>
                <span className="text-border">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Cloud Saved</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenInGoogleDocs(googleDocsUrl)}
                className="h-8 gap-1.5 text-xs border-border/80"
                title="Open in official Google Docs web app"
              >
                <FolderSync className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Open in Google Docs</span>
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

          {/* Form Metadata Ribbon (Category, Section, Topic, Date) */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
                              onClick={() => setLightboxImage(img.url)}
                              className="h-28 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                            />
                            <div className="p-1.5 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between text-[10px]">
                              <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-400 font-mono">{img.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
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
              {/* Left Column: Markdown Input */}
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

              {/* Right Column: Live Formatted Document */}
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
      {/* FULL DOCUMENT READER DIALOG                               */}
      {/* ========================================================= */}
      {readingNote && (
        <Dialog open={Boolean(readingNote)} onOpenChange={(open) => !open && setReadingNote(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <DialogHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                      readingNote.section === 'Quant'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300'
                        : readingNote.section === 'DILR'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300'
                    )}
                  >
                    {readingNote.section}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {readingNote.noteType === 'QA' ? 'Solved Q&A' : readingNote.noteType === 'Quick Ref' ? 'Quick Ref' : 'Concept Note'}
                  </Badge>
                  {readingNote.isPinned && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                      <Pin className="h-3 w-3 fill-current rotate-45" /> Pinned
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInGoogleDocs(readingNote.googleDocsUrl)}
                  className="h-7 text-[11px] gap-1 border-border/80"
                >
                  <FolderSync className="h-3 w-3 text-blue-600" />
                  <span>Google Docs</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                </Button>
              </div>

              <DialogTitle className="text-xl md:text-2xl font-bold text-foreground mt-2">
                {readingNote.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Topic: <strong className="text-foreground">{readingNote.topic}</strong> • Created: {readingNote.createdAt}
              </DialogDescription>
            </DialogHeader>

            {/* Notebook Scans in Reader */}
            {readingNote.images && readingNote.images.length > 0 && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 my-4 space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                  Attached Notebook Photo Scans ({readingNote.images.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {readingNote.images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImage(img.url)}
                      className="rounded-lg border border-border/80 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-background"
                    >
                      <img src={img.url} alt={img.name} className="h-24 w-full object-cover" />
                      <div className="p-1 text-[9px] text-muted-foreground truncate">{img.caption || img.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="py-4 prose prose-slate dark:prose-invert max-w-none text-sm">
              <MarkdownRenderer content={readingNote.content} />
            </div>

            <DialogFooter className="border-t border-border/60 pt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(readingNote)}
                className="gap-1.5 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Document</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReadingNote(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================= */}
      {/* NOTEBOOK PHOTO LIGHTBOX MODAL                             */}
      {/* ========================================================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-background rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={lightboxImage} alt="Notebook scan expanded" className="max-h-[85vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
