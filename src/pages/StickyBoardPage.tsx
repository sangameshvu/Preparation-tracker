import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Search,
  Check,
  Link as LinkIcon
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
import { StickyNoteItem } from '../types';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';

export const StickyBoardPage: React.FC = () => {
  const { stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote, topics } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNoteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [content, setContent] = useState('');
  const [color, setColor] = useState<StickyNoteItem['color']>('lavender');
  const [isPinned, setIsPinned] = useState(false);
  const [linkedTopicId, setLinkedTopicId] = useState('');

  const colors = [
    {
      name: 'lavender',
      hex: '#8B5CF6',
      bg: 'glass-regular bg-purple-500/12 border-purple-400/40 text-purple-950 dark:bg-purple-500/20 dark:border-purple-400/30 dark:text-purple-100 shadow-md',
    },
    {
      name: 'emerald',
      hex: '#10B981',
      bg: 'glass-regular bg-emerald-500/12 border-emerald-400/40 text-emerald-950 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-100 shadow-md',
    },
    {
      name: 'amber',
      hex: '#F59E0B',
      bg: 'glass-regular bg-amber-500/12 border-amber-400/40 text-amber-950 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-100 shadow-md',
    },
    {
      name: 'rose',
      hex: '#F43F5E',
      bg: 'glass-regular bg-rose-500/12 border-rose-400/40 text-rose-950 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-100 shadow-md',
    },
    {
      name: 'cyan',
      hex: '#06B6D4',
      bg: 'glass-regular bg-cyan-500/12 border-cyan-400/40 text-cyan-950 dark:bg-cyan-500/20 dark:border-cyan-400/30 dark:text-cyan-100 shadow-md',
    },
    {
      name: 'charcoal',
      hex: '#27272A',
      bg: 'glass-regular bg-slate-500/12 border-slate-400/40 text-slate-950 dark:bg-slate-500/20 dark:border-slate-400/30 dark:text-slate-100 shadow-md',
    },
  ] as const;

  const getColorClass = (col: StickyNoteItem['color']) => {
    const found = colors.find((c) => c.name === col);
    return found ? found.bg : 'bg-card border-border text-foreground';
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setContent('');
    setColor('lavender');
    setIsPinned(false);
    setLinkedTopicId('');
    setModalOpen(true);
  };

  const handleOpenEdit = (n: StickyNoteItem) => {
    setEditingNote(n);
    setContent(n.content);
    setColor(n.color);
    setIsPinned(n.isPinned);
    setLinkedTopicId(n.linkedTopicId || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingNote) {
      updateStickyNote(editingNote.id, {
        content: content.trim(),
        color,
        isPinned,
        linkedTopicId: linkedTopicId || undefined,
      });
    } else {
      addStickyNote({
        content: content.trim(),
        color,
        isPinned,
        linkedTopicId: linkedTopicId || undefined,
        positionX: Math.floor(Math.random() * 200) + 50,
        positionY: Math.floor(Math.random() * 200) + 50,
      });
    }
    setModalOpen(false);
  };

  const filteredNotes = stickyNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    return n.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sticky Board</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAdd} variant="default" size="sm" className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Add Sticky Note</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search sticky notes by text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {filteredNotes.length} notes
        </span>
      </div>

      {/* Sticky Notes Canvas / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No sticky notes yet. Click "Add Sticky Note" to pin your first thought!
          </div>
        ) : (
          filteredNotes.map((note) => {
            const linkedTopic = topics.find((t) => t.id === note.linkedTopicId);

            return (
              <div
                key={note.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between min-h-[190px] hover:scale-[1.02] ${getColorClass(
                  note.color
                )}`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/15">
                    <span className="text-[10px] font-mono opacity-75">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Pinned'}
                    </span>
                    <button
                      onClick={() => updateStickyNote(note.id, { isPinned: !note.isPinned })}
                      className="opacity-75 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className={`h-3.5 w-3.5 ${note.isPinned ? 'fill-current text-purple-600 dark:text-purple-400' : ''}`} />
                    </button>
                  </div>

                  <div className="text-xs leading-relaxed font-medium">
                    <MarkdownRenderer content={note.content} />
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-current/15 flex items-center justify-between text-[10px]">
                  {linkedTopic ? (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-current/10 border-current/25 text-current truncate max-w-[130px] font-medium">
                      {linkedTopic.topicName}
                    </Badge>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors opacity-75 hover:opacity-100 cursor-pointer"
                      title="Edit note"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteStickyNote(note.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-75 hover:opacity-100 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Sticky Note Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingNote ? 'Edit Sticky Note' : 'Create Sticky Note'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Jot down thoughts, formulas, or reminders. Select a theme color and optional topic link.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Note Content</label>
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Color Palette</label>
              <div className="flex gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      color === c.name ? 'scale-110 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="default" size="sm">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
