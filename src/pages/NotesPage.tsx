import React, { useState, useMemo, useRef } from 'react';
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
  Columns,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  UploadCloud,
  X,
  Maximize2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  CheckCircle2
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

  // Filters
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

  // Canvas Mode: 'edit' | 'split' | 'preview'
  const [canvasMode, setCanvasMode] = useState<'edit' | 'split' | 'preview'>('split');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter topics based on active section in the editor
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
    return { total, qa, concepts, quickRef, totalImages };
  }, [studyNotes]);

  // Open Editor for New Note
  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setSection(sectionFilter !== 'All' ? sectionFilter : 'Quant');
    setNoteType(typeFilter !== 'All' ? typeFilter : 'Notes');
    setSelectedTopic(topics[0]?.topicName || 'General');
    setCustomTopic('');
    setCreatedDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setImages([]);
    setIsPinned(false);
    setCanvasMode('split');
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
    setCanvasMode('split');
    setActiveView('editor');
    if (readingNote) setReadingNote(null);
  };

  // Save Note
  const handleSaveNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    const finalTopic = customTopic.trim() ? customTopic.trim() : (selectedTopic || 'General');
    const matchedTopic = topics.find((t) => t.topicName.toLowerCase() === finalTopic.toLowerCase());

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
      });
      toast.success('Study note updated successfully');
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
      });
      toast.success('New study note saved to knowledge base');
    }

    setActiveView('gallery');
  };

  // Insert markdown shortcut at cursor position
  const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Restore focus and cursor position
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

        // Auto-insert image tag into markdown at cursor
        insertFormatting(`\n\n![${newImg.caption}](${newImg.url})\n\n`, '', '');
        toast.success(`Image "${file.name}" added to canvas`);
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Remove uploaded image
  const handleRemoveImage = (imgId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imgId));
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
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Notes & Knowledge Base</h1>
            <Badge variant="purple" className="text-xs gap-1 font-mono">
              <Sparkles className="h-3 w-3" />
              Markdown + Notebook Scans
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Topic concept dossiers, solved question & answer breakdowns, quick formula cheat sheets, and notebook photo scans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'gallery' ? (
            <Button onClick={handleOpenCreate} variant="purple" size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Create New Note</span>
            </Button>
          ) : (
            <Button onClick={() => setActiveView('gallery')} variant="outline" size="sm" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Back to Gallery</span>
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: GALLERY VIEW */}
      {activeView === 'gallery' && (
        <div className="space-y-6">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">All Notes</span>
              <span className="text-xl font-bold font-mono text-foreground mt-1 block">{counts.total}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Solved Q&As</span>
              <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1 block">{counts.qa}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Concept Notes</span>
              <span className="text-xl font-bold font-mono text-purple-700 dark:text-purple-400 mt-1 block">{counts.concepts}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground font-medium block">Quick Ref Sheets</span>
              <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">{counts.quickRef}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] text-muted-foreground font-medium block">Notebook Photos</span>
              <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1 block">{counts.totalImages}</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-4 border-border/80 shadow-xs space-y-4">
            {/* Top row: Search and Section pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search notes by title, topic, or formula..."
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
                {(['All', 'Quant', 'DILR', 'VARC'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setSectionFilter(sec);
                      setTopicFilter('All');
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer',
                      sectionFilter === sec
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {sec === 'All' ? 'All Sections' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom row: Type Filter Pills & Topic dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">Type:</span>
                {(['All', 'Notes', 'QA', 'Quick Ref'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer',
                      typeFilter === type
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {type === 'All'
                      ? 'All Types'
                      : type === 'QA'
                      ? 'QA (Solved Q&A)'
                      : type === 'Notes'
                      ? 'Notes (Concepts)'
                      : 'Quick Ref (Formulas)'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-medium shrink-0">Topic:</span>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer max-w-[200px] truncate"
                >
                  <option value="All">All Topics</option>
                  {topics
                    .filter((t) => (sectionFilter === 'All' ? true : t.section === sectionFilter))
                    .map((t) => (
                      <option key={t.id} value={t.topicName}>
                        {t.topicName} ({t.section})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No Study Notes Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No notes match your selected section, type, or search term. Click below to create your first note or reset filters.
              </p>
              <Button onClick={handleOpenCreate} variant="purple" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Create New Note</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const hasImages = note.images && note.images.length > 0;

                return (
                  <Card
                    key={note.id}
                    className={cn(
                      'flex flex-col justify-between border-border/80 hover:border-purple-500/50 transition-all duration-200 hover:shadow-md bg-card',
                      note.isPinned && 'ring-1 ring-purple-500/30'
                    )}
                  >
                    <div>
                      {/* Card Header */}
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant={note.section === 'Quant' ? 'quant' : note.section === 'DILR' ? 'dilr' : 'varc'}
                              className="text-[10px] px-1.5 py-0 font-bold"
                            >
                              {note.section}
                            </Badge>

                            <span
                              className={cn(
                                'text-[10px] font-semibold px-1.5 py-0 rounded border',
                                note.noteType === 'QA'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30'
                                  : note.noteType === 'Quick Ref'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500/30'
                                  : 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-500/30'
                              )}
                            >
                              {note.noteType === 'QA'
                                ? 'Solved Q&A'
                                : note.noteType === 'Quick Ref'
                                ? 'Quick Ref'
                                : 'Concept Note'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>{note.createdAt}</span>
                            <button
                              onClick={() => updateStudyNote(note.id, { isPinned: !note.isPinned })}
                              className="p-1 hover:text-foreground transition-colors ml-1 cursor-pointer"
                              title={note.isPinned ? 'Unpin note' : 'Pin note'}
                            >
                              <Pin className={cn('h-3.5 w-3.5', note.isPinned ? 'fill-current text-purple-600 dark:text-purple-400' : 'text-muted-foreground')} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <CardTitle
                          onClick={() => setReadingNote(note)}
                          className="text-sm font-bold text-foreground leading-snug line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                        >
                          {note.title}
                        </CardTitle>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50 truncate max-w-[180px]">
                            {note.topic}
                          </span>
                          {hasImages && (
                            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {note.images.length} scan{note.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </CardHeader>

                      {/* Attached Thumbnail Preview (if any) */}
                      {hasImages && (
                        <div className="px-4 py-1">
                          <div
                            onClick={() => setLightboxImage(note.images[0].url)}
                            className="h-28 w-full rounded-lg overflow-hidden border border-border/70 bg-black/5 dark:bg-black/30 relative group cursor-pointer"
                          >
                            <img
                              src={note.images[0].url}
                              alt={note.images[0].name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-semibold">
                              <Maximize2 className="h-3.5 w-3.5" />
                              <span>View Notebook Scan</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Excerpt */}
                      <CardContent className="p-4 pt-2">
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {note.content.replace(/[#*`>|\[\]\(\)-]/g, '').trim()}
                        </p>
                      </CardContent>
                    </div>

                    {/* Action Footer */}
                    <CardFooter className="p-4 pt-0 border-t border-border/40 flex items-center justify-between text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold px-2"
                        onClick={() => setReadingNote(note)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>Read Note</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => handleOpenEdit(note)}
                          title="Edit note"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer"
                          onClick={() => {
                            if (confirm(`Delete note "${note.title}"?`)) {
                              deleteStudyNote(note.id);
                              toast.success('Note deleted');
                            }
                          }}
                          title="Delete note"
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

      {/* VIEW 2: NOTEBOOK CANVAS & FORM EDITOR */}
      {activeView === 'editor' && (
        <div className="space-y-4">
          <Card className="border-border/80 shadow-md">
            {/* Form Fields Header */}
            <CardHeader className="p-4 border-b border-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {editingNoteId ? 'Edit Study Note' : 'Create New Study Note'}
                    </h2>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Markdown Document Canvas + Notebook Photo Scan Uploader
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('gallery')}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSaveNote()} variant="purple" size="sm" className="gap-1.5 shadow-sm">
                    <Check className="h-4 w-4" />
                    <span>Save Note</span>
                  </Button>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Note Title *
                </label>
                <Input
                  placeholder="e.g. Remainders: Euler & Wilson's Theorem Applications or DILR Knockout Tournament Sets"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-bold text-sm h-10"
                  required
                />
              </div>

              {/* Metadata Form: Section, Type, Topic, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Subject Section */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Subject Section *
                  </label>
                  <Select value={section} onValueChange={(val: SectionType) => setSection(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quant">Quant (Mathematics)</SelectItem>
                      <SelectItem value="DILR">DILR (Logic & Data)</SelectItem>
                      <SelectItem value="VARC">VARC (Verbal & RC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Note Type */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Note Category *
                  </label>
                  <Select value={noteType} onValueChange={(val: NoteCategoryType) => setNoteType(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Notes">Notes (Concept & Theory)</SelectItem>
                      <SelectItem value="QA">QA (Solved Problem Breakdown)</SelectItem>
                      <SelectItem value="Quick Ref">Quick Ref (Formulas & Cheat Sheet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Topic Being Covered */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Topic Covered *
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      if (e.target.value !== '__custom__') setCustomTopic('');
                    }}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    {relevantTopics.map((t) => (
                      <option key={t.id} value={t.topicName}>
                        {t.topicName} ({t.area})
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Topic...</option>
                  </select>

                  {selectedTopic === '__custom__' && (
                    <Input
                      placeholder="Type custom topic name..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="mt-1.5 h-8 text-xs"
                      autoFocus
                    />
                  )}
                </div>

                {/* 4. Created Date */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Date Created
                  </label>
                  <Input
                    type="date"
                    value={createdDate}
                    onChange={(e) => setCreatedDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </CardHeader>

            {/* Word-like Markdown Toolbar */}
            <div className="bg-muted/40 border-b border-border/70 p-2 flex flex-wrap items-center justify-between gap-2 select-none">
              {/* Group 1: Text formatting */}
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
                  onClick={() => insertFormatting('`', '`', 'code')}
                  title="Inline Code / Formula"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Group 2: Headings */}
              <div className="flex items-center gap-0.5 border-r border-border/60 pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('# ', '', 'Heading 1')}
                  title="Heading 1"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('## ', '', 'Heading 2')}
                  title="Heading 2"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('### ', '', 'Heading 3')}
                  title="Heading 3"
                >
                  H3
                </Button>
              </div>

              {/* Group 3: Lists & Blocks */}
              <div className="flex items-center gap-0.5 border-r border-border/60 pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('- ', '', 'Bullet item')}
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => insertFormatting('> ', '', 'Takeaway rule')}
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
                  title="Divider Line"
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
                  className="h-7 text-[11px] gap-1 px-2 font-medium"
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
                  className="h-7 text-[11px] gap-1 px-2 font-medium"
                  onClick={insertFormulaTemplate}
                  title="Insert Formula Sheet Table"
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
                  Formatted
                </button>
              </div>
            </div>

            {/* Attached Notebook Images Strip */}
            {images.length > 0 && (
              <div className="p-3 bg-muted/20 border-b border-border/60 flex items-center gap-3 overflow-x-auto">
                <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Notebook Attachments ({images.length}):
                </span>
                {images.map((img) => (
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
                      className="text-muted-foreground hover:text-red-500 p-1"
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
                {/* Editor textarea (visible in edit and split modes) */}
                {canvasMode !== 'preview' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pb-1">
                      <span>Markdown Canvas</span>
                      <span>{content.length} characters</span>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      placeholder={`Type your notes here in markdown...\n\nUse shortcuts in the toolbar above for bold, tables, Q&A blocks, and notebook image uploads.\n\nExample:\n### Core Theorem:\n- Statement\n\n| Case | Value |\n|---|---|\n| A | 100 |\n\n> Important shortcut for exam`}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[500px] font-mono text-xs leading-relaxed resize-y border-border/80 focus:border-purple-500"
                    />
                  </div>
                )}

                {/* Formatted live preview (visible in split and preview modes) */}
                {canvasMode !== 'edit' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pb-1">
                      <span>Live Formatted Word View</span>
                      <Badge variant="outline" className="text-[10px]">Formatted</Badge>
                    </div>
                    <div className="min-h-[500px] max-h-[700px] overflow-y-auto rounded-xl border border-border/80 bg-background p-6 shadow-xs">
                      {content.trim() ? (
                        <div className="space-y-4">
                          <div className="border-b border-border/60 pb-3">
                            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                              {section} • {noteType} • {selectedTopic === '__custom__' ? customTopic : selectedTopic}
                            </span>
                            <h2 className="text-xl font-extrabold text-foreground mt-0.5">
                              {title || 'Untitled Note'}
                            </h2>
                            <span className="text-xs text-muted-foreground font-mono">
                              Date: {createdDate}
                            </span>
                          </div>

                          <MarkdownRenderer content={content} />
                        </div>
                      ) : (
                        <div className="h-full py-28 text-center text-xs text-muted-foreground">
                          Start typing in the canvas to see your live formatted document here.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <CardFooter className="p-4 border-t border-border/70 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setActiveView('gallery')}>
                Back to Gallery
              </Button>

              <div className="flex items-center gap-2">
                <Button onClick={() => handleSaveNote()} variant="purple" size="sm" className="gap-1.5 shadow-sm">
                  <Check className="h-4 w-4" />
                  <span>Save Note</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* VIEW 3: FULL DOCUMENT READER MODAL */}
      <Dialog open={Boolean(readingNote)} onOpenChange={(open) => !open && setReadingNote(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {readingNote && (
            <div className="space-y-5">
              <DialogHeader className="border-b border-border/60 pb-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={readingNote.section === 'Quant' ? 'quant' : readingNote.section === 'DILR' ? 'dilr' : 'varc'}>
                    {readingNote.section}
                  </Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-500/30">
                    {readingNote.noteType === 'QA' ? 'Solved Q&A' : readingNote.noteType === 'Quick Ref' ? 'Quick Ref' : 'Concept Note'}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    {readingNote.topic}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground ml-auto">
                    {readingNote.createdAt}
                  </span>
                </div>

                <DialogTitle className="text-xl font-extrabold text-foreground pt-1">
                  {readingNote.title}
                </DialogTitle>
              </DialogHeader>

              {/* Attached Notebook Scans Carousel / Gallery */}
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
                  onClick={() => handleOpenEdit(readingNote)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Note</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReadingNote(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal for high-res notebook scans */}
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
