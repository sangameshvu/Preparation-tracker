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
    { name: 'lavender', hex: '#8B5CF6', bg: 'bg-purple-950/40 border-purple-500/40 text-purple-200' },
    { name: 'emerald', hex: '#10B981', bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' },
    { name: 'amber', hex: '#F59E0B', bg: 'bg-amber-950/40 border-amber-500/40 text-amber-200' },
    { name: 'rose', hex: '#F43F5E', bg: 'bg-rose-950/40 border-rose-500/40 text-rose-200' },
    { name: 'cyan', hex: '#06B6D4', bg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' },
    { name: 'charcoal', hex: '#27272A', bg: 'bg-zinc-900 border-zinc-700 text-zinc-200' },
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notes & Sticky Board</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Spatial whiteboard for quick formulas, strategy takeaways, and topic bookmarks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAdd} variant="purple" size="sm" className="gap-1.5 shadow-sm">
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
                className={`p-4 rounded-xl border shadow-sm transition-all flex flex-col justify-between min-h-[180px] hover:scale-[1.02] ${getColorClass(
                  note.color
                )}`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-[10px] font-mono opacity-70">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Pinned'}
                    </span>
                    <button
                      onClick={() => updateStickyNote(note.id, { isPinned: !note.isPinned })}
                      className="text-white/70 hover:text-white transition-opacity"
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className={`h-3.5 w-3.5 ${note.isPinned ? 'fill-current text-purple-300' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  {linkedTopic ? (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-black/20 border-white/20 text-white truncate max-w-[120px]">
                      {linkedTopic.topicName}
                    </Badge>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
                      title="Edit note"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteStickyNote(note.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors text-white/70 hover:text-red-300"
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
              <Button type="submit" variant="purple" size="sm">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
