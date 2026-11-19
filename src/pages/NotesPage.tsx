import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  FileText,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Pin,
  ExternalLink,
  Check,
  FolderOpen,
  FolderCheck,
  FolderSync,
  X,
  Link as LinkIcon,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
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
import { SectionType, NoteCategoryType, StudyNoteItem } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export const NotesPage: React.FC = () => {
  const { studyNotes, addStudyNote, updateStudyNote, deleteStudyNote, topics } = useAppData();

  // Google Drive Folder URL (Stored locally in browser)
  const [googleDocsFolderLink, setGoogleDocsFolderLink] = useState<string>(() => {
    return (
      localStorage.getItem('cat2027_gdrive_folder_link') ||
      'https://drive.google.com/drive/u/0/search?q=title%3D%27CAT%20Notes%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27'
    );
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDriveSettingsOpen, setIsDriveSettingsOpen] = useState(false);
  const [customFolderInput, setCustomFolderInput] = useState('');

  // Filters for Gallery View
  const [sectionFilter, setSectionFilter] = useState<'All' | SectionType>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | NoteCategoryType>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Small Form State (Metadata Only, No Canvas)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<SectionType>('Quant');
  const [noteType, setNoteType] = useState<NoteCategoryType>('Notes');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // Relevant syllabus topics based on selected section in form
  const relevantTopics = useMemo(() => {
    if (section === 'General') return [];
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
    const qa = studyNotes.filter((n) => n.noteType === 'QA' && n.section !== 'General').length;
    const concepts = studyNotes.filter((n) => n.noteType === 'Notes' && n.section !== 'General').length;
    const quickRef = studyNotes.filter((n) => n.noteType === 'Quick Ref' && n.section !== 'General').length;
    const general = studyNotes.filter((n) => n.section === 'General').length;
    return { total, qa, concepts, quickRef, general };
  }, [studyNotes]);

  // Open Drive folder
  const handleOpenGoogleDriveFolder = () => {
    const link = googleDocsFolderLink || 'https://drive.google.com/drive/u/0/my-drive';
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Create folder in Google Drive directly
  const handleCreateFolderInGoogleDrive = () => {
    window.open('https://drive.google.com/drive/u/0/my-drive', '_blank', 'noopener,noreferrer');
    toast.info('Google Drive opened! Click "+ New" → "New folder" and name it "CAT Notes".');
  };

  // Save custom Google Drive folder URL
  const handleSaveDriveFolderLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customFolderInput.trim()) {
      toast.error('Please enter a Google Drive folder link');
      return;
    }
    const cleanLink = customFolderInput.trim();
    setGoogleDocsFolderLink(cleanLink);
    localStorage.setItem('cat2027_gdrive_folder_link', cleanLink);
    setIsDriveSettingsOpen(false);
    toast.success('Saved CAT Notes folder link!');
  };

  // Open Google Docs to draft in a new tab
  const handleDraftInGoogleDocs = () => {
    window.open('https://docs.google.com/document/create', '_blank', 'noopener,noreferrer');
    toast.info('Opened Google Docs in a new tab. Create your notes and paste the link below.');
  };

  // Read Note: Opens directly in Google Docs
  const handleReadNote = (note: StudyNoteItem) => {
    let targetUrl = note.googleDocsUrl;
    if (!targetUrl || targetUrl.includes('gdoc_cat_') || targetUrl.includes('DocId')) {
      targetUrl = 'https://docs.google.com/document/create';
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    toast.info(`Opening "${note.title}" in Google Docs...`);
  };

  // Handle Section Change in Create/Edit Form
  const handleSectionChange = (newSec: SectionType) => {
    setSection(newSec);
    if (newSec === 'General') {
      setSelectedTopic('General');
      setCustomTopic('');
      setNoteType('Notes');
    } else {
      const match = topics.find((t) => t.section === newSec)?.topicName || topics[0]?.topicName || 'Remainders';
      setSelectedTopic(match);
      setCustomTopic('');
    }
  };

  // Open Modal for New Note
  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setTitle('');
    const initialSec = sectionFilter !== 'All' ? sectionFilter : 'Quant';
    setSection(initialSec);
    setNoteType(typeFilter !== 'All' ? typeFilter : 'Notes');
    if (initialSec === 'General') {
      setSelectedTopic('General');
    } else {
      const match = topics.find((t) => t.section === initialSec)?.topicName || topics[0]?.topicName || 'Remainders';
      setSelectedTopic(match);
    }
    setCustomTopic('');
    setCreatedDate(new Date().toISOString().split('T')[0]);
    setGoogleDocsUrl('');
    setSummary('');
    setIsPinned(false);
    setIsFormModalOpen(true);
  };

  // Open Modal to Edit Existing Note
  const handleOpenEditModal = (note: StudyNoteItem) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setSection(note.section);
    setNoteType(note.noteType);
    setSelectedTopic(note.section === 'General' ? 'General' : (note.topic || 'General'));
    setCustomTopic('');
    setCreatedDate(note.createdAt);
    setGoogleDocsUrl(note.googleDocsUrl || '');
    setSummary(note.content || '');
    setIsPinned(Boolean(note.isPinned));
    setIsFormModalOpen(true);
  };

  // Save Note (Metadata Form submission)
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    const isGeneral = section === 'General';
    const finalTopic = isGeneral
      ? 'General'
      : (customTopic.trim() ? customTopic.trim() : (selectedTopic || 'General'));
    const matchedTopic = isGeneral
      ? undefined
      : topics.find((t) => t.topicName.toLowerCase() === finalTopic.toLowerCase());
    const finalDocUrl = googleDocsUrl.trim() || 'https://docs.google.com/document/create';

    if (editingNoteId) {
      updateStudyNote(editingNoteId, {
        title: title.trim(),
        section,
        noteType: isGeneral ? 'Notes' : noteType,
        topic: finalTopic,
        topicId: matchedTopic?.id,
        createdAt: createdDate,
        content: summary.trim(),
        isPinned,
        googleDocsUrl: finalDocUrl,
        syncedWithGoogleDocs: true
      });
      toast.success(isGeneral ? 'General study note updated successfully' : 'Study note metadata updated successfully');
    } else {
      addStudyNote({
        title: title.trim(),
        section,
        noteType: isGeneral ? 'Notes' : noteType,
        topic: finalTopic,
        topicId: matchedTopic?.id,
        createdAt: createdDate,
        content: summary.trim(),
        images: [],
        isPinned,
        googleDocsUrl: finalDocUrl,
        syncedWithGoogleDocs: true
      });
      toast.success(isGeneral ? 'New general note saved to knowledge base' : 'New note saved to knowledge base');
    }

    setIsFormModalOpen(false);
  };

  // Delete Note
  const handleDeleteNote = (note: StudyNoteItem) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}" from your dashboard?`)) {
      deleteStudyNote(note.id);
      toast.success('Note removed from library');
    }
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
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDriveSettingsOpen(true)}
            className="h-9 gap-1.5 text-xs border-border/80"
            title="Configure or link your Google Drive CAT Notes folder"
          >
            <FolderSync className="h-3.5 w-3.5 text-blue-600" />
            <span>Drive Settings</span>
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            variant="default"
            size="sm"
            className="h-9 gap-1.5 text-xs shadow-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Note</span>
          </Button>
        </div>
      </div>

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
                Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Folder: <strong className="text-blue-700 dark:text-blue-400 font-mono">My Drive / CAT Notes /</strong>
            </p>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
              <span>Saved notes: <strong className="text-foreground">{counts.total} documents</strong></span>
              <span>Direct Google Docs access active</span>
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
            onClick={handleDraftInGoogleDocs}
            className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            title="Create a new Google Doc in your Google account"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Draft in Google Docs</span>
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium block">All Documents</span>
          <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block">{counts.total}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs">
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium block">General Notes</span>
          <span className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5 block">{counts.general}</span>
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
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 border-border/70 shadow-xs space-y-3.5">
        {/* Top row: Search and Section Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes by title, topic, or takeaway..."
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
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl flex-wrap">
            {(['All', 'Quant', 'DILR', 'VARC', 'General'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
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
              <option value="All">All Topics ({topics.length + (counts.general > 0 ? 1 : 0)})</option>
              {counts.general > 0 && (
                <option value="General">General / All Sections</option>
              )}
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
            No documents match the current filter selection. Create your first note or link a Google Doc to build your CAT knowledge base!
          </p>
          <Button onClick={handleOpenCreateModal} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Create New Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            return (
              <div
                key={note.id}
                className={cn(
                  'flex flex-col glass-thick rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border',
                  note.isPinned && 'ring-2 ring-blue-500/50'
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
                            : note.section === 'VARC'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300'
                            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300'
                        )}
                      >
                        {note.section}
                      </span>

                      {note.section === 'General' ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/40">
                          General Note
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {note.noteType === 'QA' ? 'Solved Q&A' : note.noteType === 'Quick Ref' ? 'Quick Ref' : 'Concept'}
                        </span>
                      )}

                      {note.isPinned && (
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                          <Pin className="h-3 w-3 fill-current rotate-45" /> Pinned
                        </span>
                      )}
                    </div>

                    {/* Google Docs Tag */}
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
                    <span className="font-medium text-foreground/80 truncate max-w-[160px]">
                      {note.section === 'General' ? 'General Prep / Strategy' : note.topic}
                    </span>
                    <span>•</span>
                    <span>{note.createdAt}</span>
                  </div>
                </CardHeader>

                {/* Preview / Key Takeaway */}
                <CardContent className="p-4 pt-1 flex-1">
                  {note.content ? (
                    <div className="text-xs text-muted-foreground line-clamp-3 font-sans">
                      {note.content.replace(/#+\s/g, '').replace(/[*_~`>]/g, '').slice(0, 140)}...
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                      <LinkIcon className="h-3 w-3 text-blue-500" />
                      <span>Drafted directly in Google Docs. Click to read.</span>
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
                    <span>Open in Google Docs</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditModal(note)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Edit Note Details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete Note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* SMALL FORM MODAL (METADATA ONLY, NO CANVAS)               */}
      {/* ========================================================= */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingNoteId ? 'Edit Study Note' : 'Create New Study Note'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Draft your note directly in Google Docs, then save its metadata and link here for 1-click access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNote} className="space-y-3.5 py-1 text-xs">
            {/* 1. Note Name / Title */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Note Name / Title <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Fermat & Euler Remainder Theorems: Solved CAT Problems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-8 text-xs font-medium"
              />
            </div>

            {/* 2. Section & Document Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Section <span className="text-rose-500">*</span>
                </label>
                <Select value={section} onValueChange={(val: any) => handleSectionChange(val)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quantitative Aptitude (QA)</SelectItem>
                    <SelectItem value="DILR">Data Interpretation & LR (DILR)</SelectItem>
                    <SelectItem value="VARC">Verbal Ability & Reading (VARC)</SelectItem>
                    <SelectItem value="General">General (General for All / Strategy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Document Category {section === 'General' && <span className="text-muted-foreground/70 font-normal">(Disabled)</span>}
                </label>
                <Select
                  value={section === 'General' ? 'Notes' : noteType}
                  onValueChange={(val: any) => setNoteType(val)}
                  disabled={section === 'General'}
                >
                  <SelectTrigger
                    disabled={section === 'General'}
                    className={cn(
                      "h-8 text-xs bg-background",
                      section === 'General' && "opacity-50 cursor-not-allowed bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <SelectValue placeholder={section === 'General' ? 'General Note' : undefined} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notes">Concept Notes & Theory</SelectItem>
                    <SelectItem value="QA">Solved Questions & Answers (Q&A)</SelectItem>
                    <SelectItem value="Quick Ref">Quick Reference & Formula Sheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3. Topic Covered & Created Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Topic Covered {section === 'General' && <span className="text-muted-foreground/70 font-normal">(Disabled)</span>}
                </label>
                <Select
                  value={section === 'General' ? 'General' : selectedTopic}
                  onValueChange={setSelectedTopic}
                  disabled={section === 'General'}
                >
                  <SelectTrigger
                    disabled={section === 'General'}
                    className={cn(
                      "h-8 text-xs bg-background",
                      section === 'General' && "opacity-50 cursor-not-allowed bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <SelectValue placeholder={section === 'General' ? 'General (No specific topic)' : undefined} />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {section === 'General' ? (
                      <SelectItem value="General">General (No specific topic)</SelectItem>
                    ) : (
                      relevantTopics.map((top) => (
                        <SelectItem key={top.id} value={top.topicName}>
                          {top.topicName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {section === 'General' && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Category and topic are disabled for General notes because they apply generally to all areas.
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Created Date</label>
                <Input
                  type="date"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* 4. Draft in Google Docs Shortcut Banner */}
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FolderCheck className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="text-[11px]">
                  <span className="font-bold text-foreground block">Draft in Google Docs</span>
                  <span className="text-muted-foreground text-[10px]">Opens a new Google Doc in a new tab to write and format</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDraftInGoogleDocs}
                className="h-7 text-xs bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 shrink-0 font-semibold gap-1"
              >
                <span>Open Google Docs</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>

            {/* 5. Google Doc URL Input */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1">
                <span>Google Doc URL</span>
                <span className="text-[10px] text-muted-foreground font-normal">Paste your document or Drive link</span>
              </label>
              <Input
                placeholder="https://docs.google.com/document/d/..."
                value={googleDocsUrl}
                onChange={(e) => setGoogleDocsUrl(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* 6. Key Takeaway / Summary (Optional) */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1">
                <span>Key Takeaway / Summary (Optional)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Preview on note card</span>
              </label>
              <Textarea
                placeholder="Brief summary, key theorem, or shortcut rule for quick review..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            {/* 7. Pin to Top Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinNoteCheck"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="pinNoteCheck" className="text-xs text-foreground font-medium cursor-pointer flex items-center gap-1">
                <Pin className="h-3 w-3 text-blue-600" />
                Pin this note to the top of your dashboard
              </label>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Note</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DRIVE SETTINGS MODAL                                      */}
      {/* ========================================================= */}
      <Dialog open={isDriveSettingsOpen} onOpenChange={setIsDriveSettingsOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <FolderSync className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Google Drive "CAT Notes" Folder
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Organize your CAT study documents in a dedicated folder in your personal Google Drive.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Step 1: Open Google Drive */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
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

            {/* Step 2: Paste Folder Link */}
            <form onSubmit={handleSaveDriveFolderLink} className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Step 2: Paste Folder Link</span>
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
                onClick={handleDraftInGoogleDocs}
                className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 font-semibold"
              >
                Create New Google Doc
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDriveSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
