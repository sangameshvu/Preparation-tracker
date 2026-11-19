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
  Layers,
  Sparkles,
  Bookmark,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  RotateCcw,
  ArrowUpDown,
  AlertTriangle,
  Move
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  const [modalOpen, setModalOpen] = useState(false);

  // Reorder & Delete state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [deleteConfirmResource, setDeleteConfirmResource] = useState<ResourceItem | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [jumpResource, setJumpResource] = useState<ResourceItem | null>(null);
  const [jumpTargetIndex, setJumpTargetIndex] = useState<number>(1);

  // Form State for Adding New Resource
  const [newName, setNewName] = useState('');
  const [newSection, setNewSection] = useState('Quant');
  const [newUsage, setNewUsage] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const sections = ['All', 'Quant', 'DILR', 'VARC', 'Reading', 'PYQs', 'Mocks', 'Community'];

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (activeSection !== 'All' && r.section !== activeSection) return false;
      if (favoritesOnly && !r.isFavorited) return false;
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
  }, [resources, activeSection, favoritesOnly, searchQuery]);

  // Reordering helpers
  const handleMove = (id: string, direction: -1 | 1) => {
    const filteredIdx = filteredResources.findIndex((r) => r.id === id);
    if (filteredIdx === -1) return;
    const targetFilteredIdx = filteredIdx + direction;
    if (targetFilteredIdx < 0 || targetFilteredIdx >= filteredResources.length) return;

    const targetItem = filteredResources[targetFilteredIdx];
    const globalSrcIdx = resources.findIndex((r) => r.id === id);
    const globalTargetIdx = resources.findIndex((r) => r.id === targetItem.id);
    if (globalSrcIdx === -1 || globalTargetIdx === -1) return;

    const newOrder = [...resources];
    const [item] = newOrder.splice(globalSrcIdx, 1);
    newOrder.splice(globalTargetIdx, 0, item);
    reorderResources(newOrder);
  };

  const handleMoveToTop = (id: string) => {
    const globalSrcIdx = resources.findIndex((r) => r.id === id);
    if (globalSrcIdx <= 0) return;
    const newOrder = [...resources];
    const [item] = newOrder.splice(globalSrcIdx, 1);
    newOrder.unshift(item);
    reorderResources(newOrder);
  };

  const handleMoveToBottom = (id: string) => {
    const globalSrcIdx = resources.findIndex((r) => r.id === id);
    if (globalSrcIdx === -1 || globalSrcIdx === resources.length - 1) return;
    const newOrder = [...resources];
    const [item] = newOrder.splice(globalSrcIdx, 1);
    newOrder.push(item);
    reorderResources(newOrder);
  };

  const handleJumpToPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumpResource) return;
    const clampedPos = Math.max(1, Math.min(jumpTargetIndex, resources.length));
    const srcIdx = resources.findIndex((r) => r.id === jumpResource.id);
    if (srcIdx !== -1) {
      const newOrder = [...resources];
      const [item] = newOrder.splice(srcIdx, 1);
      newOrder.splice(clampedPos - 1, 0, item);
      reorderResources(newOrder);
    }
    setJumpResource(null);
  };

  // Drag and drop handlers
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
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const srcIdx = resources.findIndex((r) => r.id === sourceId);
    const targetIdx = resources.findIndex((r) => r.id === targetId);
    if (srcIdx !== -1 && targetIdx !== -1) {
      const newOrder = [...resources];
      const [item] = newOrder.splice(srcIdx, 1);
      newOrder.splice(targetIdx, 0, item);
      reorderResources(newOrder);
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
          <p className="text-xs text-muted-foreground mt-1">
            Handpicked, verified unsponsored resources. Arrange in any custom order and delete unwanted items as needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setResetModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Restore original 29 curated resources"
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

      {/* Filter, Search, and Reorder Toolbar */}
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
              <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? 'fill-current text-red-400' : ''}`} />
              <span>Favorites</span>
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

        {/* Reordering helper hint bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
            <span>
              <strong>Custom arrangement:</strong> Drag cards by the grip handle (<GripVertical className="h-3 w-3 inline" />) or click <strong>↑ / ↓</strong> on any card to arrange in any order. Click <strong>#rank</strong> to jump to a specific position.
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
            Try switching sections or clearing your search query. You can also restore deleted curated items anytime with Reset Defaults.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 text-xs gap-1.5 cursor-pointer"
            onClick={() => {
              setActiveSection('All');
              setSearchQuery('');
              setFavoritesOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res, index) => {
            const globalIndex = resources.findIndex((r) => r.id === res.id);
            const isDragging = draggedId === res.id;
            const isDragOver = dragOverId === res.id && draggedId !== res.id;

            return (
              <Card
                key={res.id}
                draggable
                onDragStart={(e) => handleDragStart(e, res.id)}
                onDragOver={(e) => handleDragOver(e, res.id)}
                onDrop={(e) => handleDrop(e, res.id)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col justify-between transition-all duration-150 ${
                  isDragging
                    ? 'opacity-40 ring-2 ring-blue-500 scale-[0.98]'
                    : isDragOver
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'hover:border-blue-500/40 hover:shadow-sm'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Grip Handle, Position Badge, and Section Badge */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/60 hover:text-foreground rounded transition-colors"
                        title="Drag to rearrange"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setJumpResource(res);
                          setJumpTargetIndex(globalIndex + 1);
                        }}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer font-bold"
                        title="Click to jump to a specific order position"
                      >
                        #{globalIndex + 1}
                      </button>
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
                    </div>

                    {/* Right: Reorder & Action Controls */}
                    <div className="flex items-center gap-0.5">
                      {/* Move Up */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
                        onClick={() => handleMove(res.id, -1)}
                        disabled={index === 0}
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>

                      {/* Move Down */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
                        onClick={() => handleMove(res.id, 1)}
                        disabled={index === filteredResources.length - 1}
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>

                      {/* Favorite Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500 cursor-pointer"
                        onClick={() => updateResource(res.id, { isFavorited: !res.isFavorited })}
                        title="Toggle Favorite"
                      >
                        <Heart className={`h-3.5 w-3.5 ${res.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>

                      {/* Completed Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-emerald-500 cursor-pointer"
                        onClick={() => updateResource(res.id, { isCompleted: !res.isCompleted })}
                        title="Mark Completed"
                      >
                        <CheckCircle2 className={`h-3.5 w-3.5 ${res.isCompleted ? 'text-emerald-500' : ''}`} />
                      </Button>

                      {/* Delete Resource */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
                        onClick={() => setDeleteConfirmResource(res)}
                        title="Delete unwanted resource"
                        aria-label="Delete resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <CardTitle className="text-sm font-bold text-foreground mt-2 line-clamp-1">
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
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

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
              This item will be deleted from your active resources. You can always restore all 29 original curated resources using the <em>Reset Defaults</em> button.
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
              This will reset your Free Resources library back to the 29 master preparation guide resources in their original canonical order. Any custom order or deleted defaults will be reset.
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

      {/* Jump to Position Dialog */}
      <Dialog open={Boolean(jumpResource)} onOpenChange={(open) => !open && setJumpResource(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Move to Position</DialogTitle>
            <DialogDescription className="text-xs">
              Arrange <strong>"{jumpResource?.resourceName}"</strong> to position (1 to {resources.length}):
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJumpToPosition} className="space-y-3 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Position #:</span>
              <Input
                type="number"
                min={1}
                max={resources.length}
                value={jumpTargetIndex}
                onChange={(e) => setJumpTargetIndex(Number(e.target.value))}
                className="w-24 h-8 text-xs font-mono"
                autoFocus
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setJumpResource(null)}>Cancel</Button>
              <Button type="submit" variant="default" size="sm">Move</Button>
            </DialogFooter>
          </form>
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
