import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  BookOpen,
  Search,
  ExternalLink,
  Heart,
  CheckCircle2,
  Plus,
  Play,
  RotateCcw,
  AlertTriangle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Info,
  Edit3,
  Check,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
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
import { ResourceItem } from '../types';
import { cn } from '../lib/utils';

export const FreeResourcesPage: React.FC = () => {
  const {
    resources,
    updateResource,
    addResource,
    deleteResource,
    reorderResources,
    resetResources
  } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Details & Edit Modal State
  const [detailsResource, setDetailsResource] = useState<ResourceItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editSection, setEditSection] = useState('Quant');
  const [editUsage, setEditUsage] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);
  const [editFavorited, setEditFavorited] = useState(false);

  // Delete & Reset Modals
  const [deleteConfirmResource, setDeleteConfirmResource] = useState<ResourceItem | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Form State for Adding New Resource
  const [newName, setNewName] = useState('');
  const [newSection, setNewSection] = useState('Quant');
  const [newUsage, setNewUsage] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const sections = ['All', 'Quant', 'DILR', 'VARC', 'Reading', 'PYQs', 'Mocks', 'Community'];

  const completedCount = useMemo(() => {
    return resources.filter((r) => r.isCompleted).length;
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (activeSection !== 'All' && r.section !== activeSection) return false;
      if (favoritesOnly && !r.isFavorited) return false;
      if (completedOnly && !r.isCompleted) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.resourceName.toLowerCase().includes(q) ||
          r.intendedUsage.toLowerCase().includes(q) ||
          r.section.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [resources, activeSection, favoritesOnly, completedOnly, searchQuery]);

  // Open Details Modal and populate fields
  const handleOpenDetails = (res: ResourceItem) => {
    setDetailsResource(res);
    setEditName(res.resourceName);
    setEditSection(res.section);
    setEditUsage(res.intendedUsage);
    setEditUrl(res.url);
    setEditNotes(res.personalNotes || '');
    setEditCompleted(Boolean(res.isCompleted));
    setEditFavorited(Boolean(res.isFavorited));
  };

  // Save changes from Details & Edit modal
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsResource || !editName.trim() || !editUrl.trim()) return;

    updateResource(detailsResource.id, {
      resourceName: editName.trim(),
      section: editSection,
      intendedUsage: editUsage.trim() || 'General preparation material',
      url: editUrl.trim(),
      personalNotes: editNotes.trim(),
      isCompleted: editCompleted,
      isFavorited: editFavorited
    });

    setDetailsResource(null);
  };

  // Delete from within Details Modal
  const handleDeleteFromDetails = () => {
    if (!detailsResource) return;
    const target = detailsResource;
    setDetailsResource(null);
    setDeleteConfirmResource(target);
  };

  // Shift Reordering (Next resources take the place of changed resource, no swapping)
  const handleReorder = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const fromIndex = resources.findIndex((r) => r.id === sourceId);
    const toIndex = resources.findIndex((r) => r.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const updated = [...resources];
    // Remove dragged item from its original position
    const [movedItem] = updated.splice(fromIndex, 1);
    // Find target's new position after removal
    const newTargetIndex = updated.findIndex((r) => r.id === targetId);
    if (newTargetIndex === -1) return;

    // Insert at target's position: the target item and subsequent items shift forward
    updated.splice(newTargetIndex, 0, movedItem);
    reorderResources(updated);
  };

  // Step movement (Up / Down arrows shift item into the adjacent position)
  const handleMove = (id: string, direction: -1 | 1) => {
    const currentIndex = resources.findIndex((r) => r.id === id);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= resources.length) return;

    const updated = [...resources];
    const [item] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, item);
    reorderResources(updated);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      handleReorder(sourceId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    addResource({
      resourceName: newName.trim(),
      section: newSection,
      intendedUsage: newUsage.trim() || 'General preparation material',
      url: newUrl.trim(),
      isFavorited: false,
      isCompleted: false
    });
    setNewName('');
    setNewUsage('');
    setNewUrl('');
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirmResource) {
      deleteResource(deleteConfirmResource.id);
      setDeleteConfirmResource(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Free Study Resources Library</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setResetModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Restore original curated resources in master order"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            variant="default"
            size="sm"
            className="gap-1.5 shadow-xs text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </Button>
        </div>
      </div>

      {/* Featured Video Card */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-card to-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 shrink-0">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400 tracking-wider">Featured Orientation</span>
              <h3 className="text-sm font-bold text-foreground">
                How to Crack CAT Without Coaching Using Only Free Resources
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                "Pick ONE main source per section and finish it. Don't collect playlists."
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="default"
            className="gap-1.5 shrink-0 text-xs cursor-pointer"
            onClick={() => window.open('https://www.youtube.com/watch?v=PwRfsf0m0NM', '_blank', 'noopener,noreferrer')}
          >
            <span>Watch Full Video</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
          {/* Section Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {sections.map((sec) => (
              <Button
                key={sec}
                size="sm"
                variant={activeSection === sec ? 'purple' : 'ghost'}
                className="h-8 text-xs font-semibold cursor-pointer"
                onClick={() => setActiveSection(sec)}
              >
                {sec}
              </Button>
            ))}
            <Button
              size="sm"
              variant={favoritesOnly ? 'destructive' : 'ghost'}
              className="h-8 text-xs gap-1 cursor-pointer"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Heart className={cn('h-3.5 w-3.5', favoritesOnly ? 'fill-current text-red-400' : '')} />
              <span>Favorites</span>
            </Button>
            <Button
              size="sm"
              variant={completedOnly ? 'default' : 'ghost'}
              className={cn(
                'h-8 text-xs gap-1 cursor-pointer',
                completedOnly ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold' : ''
              )}
              onClick={() => setCompletedOnly(!completedOnly)}
            >
              <CheckCircle2 className={cn('h-3.5 w-3.5', completedOnly ? 'fill-white text-emerald-600' : 'text-emerald-500')} />
              <span>Completed ({completedCount})</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search resources, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Helpful Info Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
            <span>
              Drag cards by the grip handle to insert anywhere—the next resources will shift smoothly. Click <strong><Info className="h-3 w-3 inline text-blue-500" /> Details</strong> on any card to edit its name, link, or notes.
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-foreground shrink-0 pl-2">
            {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
          </span>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No resources match your filter</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try switching sections or clearing your search filter. You can also restore original materials anytime with Reset Defaults.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 text-xs gap-1.5 cursor-pointer"
            onClick={() => {
              setActiveSection('All');
              setSearchQuery('');
              setFavoritesOnly(false);
              setCompletedOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const isDragging = draggedId === res.id;
            const isDragOver = dragOverId === res.id && draggedId !== res.id;
            const globalIndex = resources.findIndex((r) => r.id === res.id);

            return (
              <Card
                key={res.id}
                draggable
                onDragStart={(e) => handleDragStart(e, res.id)}
                onDragOver={(e) => handleDragOver(e, res.id)}
                onDrop={(e) => handleDrop(e, res.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex flex-col justify-between transition-all duration-150',
                  res.isCompleted
                    ? 'border-emerald-500/40 bg-emerald-50/15 dark:bg-emerald-950/10'
                    : 'hover:border-blue-500/40 hover:shadow-xs',
                  isDragging && 'opacity-40 ring-2 ring-blue-500 scale-[0.98]',
                  isDragOver && 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Grip Handle and Section Badge (Numbering removed per request) */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/60 hover:text-foreground rounded transition-colors"
                        title="Drag to rearrange position"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <Badge
                        variant={
                          res.section === 'Quant'
                            ? 'quant'
                            : res.section === 'DILR'
                            ? 'dilr'
                            : res.section === 'VARC'
                            ? 'varc'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {res.section}
                      </Badge>
                      {res.isCompleted && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[9px] gap-1 font-semibold px-1.5 py-0">
                          <CheckCircle2 className="h-2.5 w-2.5 fill-emerald-600 text-white dark:text-slate-900" />
                          Done
                        </Badge>
                      )}
                    </div>

                    {/* Right: Actions (Details/Edit, Step Arrows, Favorite, Mark as Done, Delete) */}
                    <div className="flex items-center gap-0.5">
                      {/* Details & Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer rounded-lg transition-colors"
                        onClick={() => handleOpenDetails(res)}
                        title="View Details & Edit Resource"
                        aria-label="View Details & Edit Resource"
                      >
                        <Info className="h-4 w-4" />
                      </Button>

                      {/* Move Up */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg disabled:opacity-30"
                        onClick={() => handleMove(res.id, -1)}
                        disabled={globalIndex === 0}
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>

                      {/* Move Down */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg disabled:opacity-30"
                        onClick={() => handleMove(res.id, 1)}
                        disabled={globalIndex === resources.length - 1}
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>

                      {/* Favorite Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer rounded-lg"
                        onClick={() => updateResource(res.id, { isFavorited: !res.isFavorited })}
                        title={res.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        aria-label="Toggle Favorite"
                      >
                        <Heart className={cn('h-3.5 w-3.5', res.isFavorited ? 'fill-red-500 text-red-500' : '')} />
                      </Button>

                      {/* Mark as Done / Completed Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-7 w-7 rounded-lg transition-colors cursor-pointer',
                          res.isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                            : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        )}
                        onClick={() => updateResource(res.id, { isCompleted: !res.isCompleted })}
                        title={res.isCompleted ? 'Marked as completed (Click to unmark)' : 'Mark as done'}
                        aria-label="Mark as done"
                      >
                        <CheckCircle2
                          className={cn(
                            'h-4 w-4',
                            res.isCompleted ? 'fill-emerald-600 text-white dark:text-slate-900' : ''
                          )}
                        />
                      </Button>

                      {/* Delete Resource Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer rounded-lg transition-colors"
                        onClick={() => setDeleteConfirmResource(res)}
                        title="Delete resource"
                        aria-label="Delete resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <CardTitle
                    className={cn(
                      'text-sm font-bold text-foreground mt-2 line-clamp-1',
                      res.isCompleted && 'text-emerald-950 dark:text-emerald-200'
                    )}
                  >
                    {res.resourceName}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {res.intendedUsage}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                    {res.url.replace('https://www.', '').replace('https://', '').split('/')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 cursor-pointer"
                      onClick={() => window.open(res.url, '_blank', 'noopener,noreferrer')}
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details & Edit Resource Modal */}
      <Dialog open={Boolean(detailsResource)} onOpenChange={(open) => !open && setDetailsResource(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <span>Resource Details & Edit</span>
              </DialogTitle>
              {editCompleted && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] gap-1">
                  <Check className="h-3 w-3" /> Completed
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              View and edit this resource's name, URL, section, and study notes. You can also delete it from here.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDetails} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Resource Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Anastasis Shankar: Advanced DILR Series"
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <Select value={editSection} onValueChange={setEditSection}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quant</SelectItem>
                    <SelectItem value="DILR">DILR</SelectItem>
                    <SelectItem value="VARC">VARC</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="PYQs">PYQs</SelectItem>
                    <SelectItem value="Mocks">Mocks</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Status Flags
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setEditCompleted(!editCompleted)}
                    className={cn(
                      'text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-medium',
                      editCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                    )}
                  >
                    <CheckCircle2 className={cn('h-3.5 w-3.5', editCompleted ? 'fill-emerald-600 text-white' : '')} />
                    <span>Done</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFavorited(!editFavorited)}
                    className={cn(
                      'text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-medium',
                      editFavorited
                        ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                    )}
                  >
                    <Heart className={cn('h-3.5 w-3.5', editFavorited ? 'fill-red-500 text-red-500' : '')} />
                    <span>Favorite</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Intended Usage / Phase
              </label>
              <Input
                value={editUsage}
                onChange={(e) => setEditUsage(e.target.value)}
                placeholder="e.g. Phase 2 advanced puzzle practice"
                className="text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Web Hyperlink (URL) <span className="text-red-500">*</span>
                </label>
                {editUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(editUrl, '_blank', 'noopener,noreferrer')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
                className="text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Personal Study Notes & Key Chapters
              </label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Write specific notes, recommended video timestamps, or key formulas to review from this source..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteFromDetails}
                className="gap-1.5 text-xs cursor-pointer bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Resource</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailsResource(null)}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  className="gap-1.5 cursor-pointer text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirmResource)} onOpenChange={(open) => !open && setDeleteConfirmResource(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-foreground">Delete Free Resource?</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove <strong>"{deleteConfirmResource?.resourceName}"</strong> from your library?
              <br /><br />
              This item will be deleted from your active resources. You can always restore the 29 original curated resources anytime using the <em>Reset Defaults</em> button.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmResource(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="gap-1.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Resource</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Defaults Confirmation Dialog */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <RotateCcw className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-foreground">Reset to Default Curated Resources?</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will reset your Free Resources library back to the 29 master preparation guide resources in their original canonical order. Any custom additions or edits will be reset.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setResetModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                resetResources();
                setResetModalOpen(false);
              }}
              className="gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Confirm Reset</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Resource Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Custom Study Resource</DialogTitle>
            <DialogDescription className="text-xs">
              Bookmark an external playlist, article series, test portal or discussion community.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddResource} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Resource Name</label>
              <Input
                placeholder="e.g. Anastasis Shankar: Advanced DILR Series"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Section</label>
              <Select value={newSection} onValueChange={setNewSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quant">Quant</SelectItem>
                  <SelectItem value="DILR">DILR</SelectItem>
                  <SelectItem value="VARC">VARC</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="PYQs">PYQs</SelectItem>
                  <SelectItem value="Mocks">Mocks</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Intended Usage / Phase</label>
              <Input
                placeholder="e.g. Phase 2 advanced puzzle practice"
                value={newUsage}
                onChange={(e) => setNewUsage(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Web Hyperlink (URL)</label>
              <Input
                type="url"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="default" size="sm">Add to Library</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
