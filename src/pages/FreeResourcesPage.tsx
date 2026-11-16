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
  Bookmark
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
  const { resources, updateResource, addResource } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Free Study Resources Library</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Handpicked, verified unsponsored resources from the master preparation guide. All 29 original URLs preserved.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} variant="purple" size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Resource</span>
        </Button>
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
            variant="purple"
            className="gap-1.5 shrink-0 text-xs"
            onClick={() => window.open('https://www.youtube.com/watch?v=PwRfsf0m0NM', '_blank', 'noopener,noreferrer')}
          >
            <span>Watch Full Video</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-sm">
        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {sections.map((sec) => (
            <Button
              key={sec}
              size="sm"
              variant={activeSection === sec ? 'purple' : 'ghost'}
              className="h-8 text-xs font-semibold"
              onClick={() => setActiveSection(sec)}
            >
              {sec}
            </Button>
          ))}
          <Button
            size="sm"
            variant={favoritesOnly ? 'destructive' : 'ghost'}
            className="h-8 text-xs gap-1"
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

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <Card key={res.id} className="flex flex-col justify-between hover:border-purple-500/40 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant={
                    res.section === 'Quant' ? 'quant' : res.section === 'DILR' ? 'dilr' : res.section === 'VARC' ? 'varc' : 'secondary'
                  }
                  className="text-[10px]"
                >
                  {res.section}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-400"
                    onClick={() => updateResource(res.id, { isFavorited: !res.isFavorited })}
                    title="Toggle Favorite"
                  >
                    <Heart className={`h-3.5 w-3.5 ${res.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
                    onClick={() => updateResource(res.id, { isCompleted: !res.isCompleted })}
                    title="Mark Completed"
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${res.isCompleted ? 'text-emerald-400' : ''}`} />
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
              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                {res.url.replace('https://www.', '').replace('https://', '').split('/')[0]}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={() => window.open(res.url, '_blank', 'noopener,noreferrer')}
              >
                <span>Open Resource</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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
              <Button type="submit" variant="purple" size="sm">Add to Library</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
