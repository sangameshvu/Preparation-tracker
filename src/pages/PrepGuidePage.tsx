import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Compass,
  BookOpen,
  Edit2,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { PrepGuideSection } from '../types';

export const PrepGuidePage: React.FC = () => {
  const { guideSections, updateGuideSection, profile } = useAppData();
  const [editingSection, setEditingSection] = useState<PrepGuideSection | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleOpenEdit = (sec: PrepGuideSection) => {
    setEditingSection(sec);
    setEditTitle(sec.title);
    setEditContent(sec.contentMarkdown);
  };

  const handleSaveEdit = () => {
    if (!editingSection) return;
    updateGuideSection(editingSection.id, {
      title: editTitle,
      contentMarkdown: editContent,
    });
    setEditingSection(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">CAT 2027 Preparation Blueprint</h1>
            <Badge variant="purple" className="text-xs">Direct PDF Extraction</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete strategic blueprint, sectional targets, and daily study allocations extracted from `CAT Preparation.pdf`.
          </p>
        </div>
        {profile.isAdmin && (
          <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Editing Enabled
          </Badge>
        )}
      </div>

      {/* Guide Content Cards */}
      <div className="space-y-6">
        {guideSections.map((sec) => (
          <Card key={sec.id} className="border-border/80 hover:border-purple-500/40 transition-colors">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  {sec.title}
                </CardTitle>
                <span className="text-[10px] font-mono text-muted-foreground">Section Key: {sec.sectionKey}</span>
              </div>
              {profile.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => handleOpenEdit(sec)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Content</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-line font-sans">
              {sec.contentMarkdown}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Section Modal */}
      <Dialog open={Boolean(editingSection)} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Preparation Guide Section</DialogTitle>
            <DialogDescription className="text-xs">
              Modify the blueprint instructions or add new study advice. Changes persist directly into your database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Section Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Content (Markdown / Text)</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
            <Button variant="purple" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
