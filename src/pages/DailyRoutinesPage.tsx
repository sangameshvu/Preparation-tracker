import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Clock,
  Calendar,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Copy,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SectionType, DailyRoutineTemplate } from '../types';

export const DailyRoutinesPage: React.FC = () => {
  const { routines, updateRoutine, profile, updateProfile } = useAppData();
  const [activeTemplateId, setActiveTemplateId] = useState<string>(routines[0]?.id || 'routine-1');
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);

  // New Block State
  const [newTimeRange, setNewTimeRange] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newSection, setNewSection] = useState<SectionType>('Quant');

  const selectedRoutine = routines.find((r) => r.id === activeTemplateId) || routines[0];

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeRange.trim() || !newActivity.trim()) return;
    const updatedBlocks = [
      ...selectedRoutine.timeBlocks,
      {
        timeRange: newTimeRange.trim(),
        activity: newActivity.trim(),
        section: newSection
      }
    ];
    updateRoutine(selectedRoutine.id, { timeBlocks: updatedBlocks });
    setNewTimeRange('');
    setNewActivity('');
  };

  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = selectedRoutine.timeBlocks.filter((_, i) => i !== index);
    updateRoutine(selectedRoutine.id, { timeBlocks: updatedBlocks });
  };

  const handleSetActiveRoutine = () => {
    updateProfile({ preferredRoutine: selectedRoutine.classification });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Routine Architect</h1>
      </div>

      {/* Routine Templates Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routines.map((routine) => {
          const isSelected = routine.id === activeTemplateId;
          const isUserDefault = profile.preferredRoutine === routine.classification;

          return (
            <Card
              key={routine.id}
              onClick={() => setActiveTemplateId(routine.id)}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/20'
                  : 'hover:border-purple-500/40'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {routine.classification.includes('professional') ? (
                      <Briefcase className="h-4 w-4 text-purple-400" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-emerald-400" />
                    )}
                    <CardTitle className="text-sm font-bold text-foreground">{routine.title}</CardTitle>
                  </div>
                  {isUserDefault && (
                    <Badge variant="purple" className="text-[10px]">Active</Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1">
                  Target: <strong className="font-mono text-foreground">{routine.targetHours} hrs/day</strong> • {routine.timeBlocks.length} scheduled blocks
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Active Routine Details */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
                {selectedRoutine.title}
              </CardTitle>
              <Badge variant="outline" className="font-mono text-xs">
                ≈ {selectedRoutine.targetHours} hrs/day
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Customize time ranges and activities. Changes persist in your personal database.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={profile.preferredRoutine === selectedRoutine.classification ? 'secondary' : 'purple'}
              onClick={handleSetActiveRoutine}
              className="text-xs h-8 gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{profile.preferredRoutine === selectedRoutine.classification ? 'Currently Selected' : 'Set as My Default Routine'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Timeline Blocks */}
          <div className="space-y-2.5">
            {selectedRoutine.timeBlocks.map((block, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-28 font-mono text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{block.timeRange}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">{block.activity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      block.section === 'Quant' ? 'quant' : block.section === 'DILR' ? 'dilr' : block.section === 'VARC' ? 'varc' : 'secondary'
                    }
                    className="text-[10px]"
                  >
                    {block.section}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-400"
                    onClick={() => handleDeleteBlock(idx)}
                    title="Remove Block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Time Block Form */}
          <form onSubmit={handleAddBlock} className="pt-4 border-t border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Add Custom Time Block:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input
                placeholder="Time range (e.g. 06:30–07:15)"
                value={newTimeRange}
                onChange={(e) => setNewTimeRange(e.target.value)}
                className="text-xs"
                required
              />
              <Input
                placeholder="Activity description..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                className="text-xs sm:col-span-2"
                required
              />
              <div className="flex gap-2">
                <Select value={newSection} onValueChange={(v) => setNewSection(v as SectionType)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quant</SelectItem>
                    <SelectItem value="DILR">DILR</SelectItem>
                    <SelectItem value="VARC">VARC</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="default" size="sm" className="h-9 gap-1 text-xs shrink-0">
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
