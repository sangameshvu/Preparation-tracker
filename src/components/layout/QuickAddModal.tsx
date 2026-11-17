import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAppData } from '../../context/AppDataContext';
import { SectionType, PriorityType, MistakeCategory } from '../../types';
import { format } from 'date-fns';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ open, onOpenChange }) => {
  const { addTask, addMistake, addMockTest, addStickyNote } = useAppData();
  const [activeTab, setActiveTab] = useState<'task' | 'mistake' | 'mock' | 'note'>('task');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSection, setTaskSection] = useState<SectionType>('Quant');
  const [taskPriority, setTaskPriority] = useState<PriorityType>('High');
  const [taskMinutes, setTaskMinutes] = useState(45);

  // Mistake Form State
  const [mistakeSection, setMistakeSection] = useState<SectionType>('Quant');
  const [mistakeTopic, setMistakeTopic] = useState('');
  const [mistakeSource, setMistakeSource] = useState('Daily Practice');
  const [mistakeQuestion, setMistakeQuestion] = useState('');
  const [mistakeType, setMistakeType] = useState<MistakeCategory>('Calculation error');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [ruleForNextTime, setRuleForNextTime] = useState('');

  // Mock Form State
  const [mockSeries, setMockSeries] = useState('');
  const [mockDate, setMockDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [varcAttempts, setVarcAttempts] = useState(0);
  const [varcScore, setVarcScore] = useState(0);
  const [dilrAttempts, setDilrAttempts] = useState(0);
  const [dilrScore, setDilrScore] = useState(0);
  const [qaAttempts, setQaAttempts] = useState(0);
  const [qaScore, setQaScore] = useState(0);
  const [percentile, setPercentile] = useState('');
  const [mockLesson, setMockLesson] = useState('');

  // Note Form State
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<'charcoal' | 'lavender' | 'emerald' | 'amber' | 'rose' | 'cyan'>('lavender');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      section: taskSection,
      status: 'In Progress',
      priority: taskPriority,
      estimatedMinutes: Number(taskMinutes) || 45,
      actualMinutes: 0,
      isTodayFocus: true
    });
    setTaskTitle('');
    onOpenChange(false);
  };

  const handleCreateMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mistakeTopic.trim() || !whatWentWrong.trim()) return;
    addMistake({
      date: format(new Date(), 'yyyy-MM-dd'),
      source: mistakeSource.trim() || 'Daily Practice',
      section: mistakeSection,
      topic: mistakeTopic.trim(),
      questionRef: mistakeQuestion.trim() || 'General',
      mistakeType: mistakeType,
      whatWentWrong: whatWentWrong.trim(),
      ruleForNextTime: ruleForNextTime.trim() || 'Review concept thoroughly',
      reSolved: false
    });
    setMistakeTopic('');
    setWhatWentWrong('');
    setRuleForNextTime('');
    onOpenChange(false);
  };

  const handleCreateMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockSeries.trim()) return;
    addMockTest({
      testDate: mockDate,
      seriesName: mockSeries.trim(),
      varcAttempts: Number(varcAttempts) || 0,
      varcScore: Number(varcScore) || 0,
      dilrAttempts: Number(dilrAttempts) || 0,
      dilrScore: Number(dilrScore) || 0,
      qaAttempts: Number(qaAttempts) || 0,
      qaScore: Number(qaScore) || 0,
      percentile: percentile ? Number(percentile) : undefined,
      analysisDone: Boolean(mockLesson.trim()),
      biggestLesson: mockLesson.trim(),
      isSample: false
    });
    setMockSeries('');
    setMockLesson('');
    onOpenChange(false);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addStickyNote({
      content: noteContent.trim(),
      color: noteColor,
      positionX: Math.floor(Math.random() * 200) + 50,
      positionY: Math.floor(Math.random() * 200) + 50,
      isPinned: false
    });
    setNoteContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span>Quick-Add Entry</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Quickly log study tasks, mistake reviews, mock exams, or sticky notes without leaving your current workspace.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="task">Study Task</TabsTrigger>
            <TabsTrigger value="mistake">Log Mistake</TabsTrigger>
            <TabsTrigger value="mock">Log Mock</TabsTrigger>
            <TabsTrigger value="note">Sticky Note</TabsTrigger>
          </TabsList>

          {/* Task Form */}
          <TabsContent value="task">
            <form onSubmit={handleCreateTask} className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Task Title</label>
                <Input
                  placeholder="e.g. Solve 20 Arithmetic Questions on Ratios"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Section</label>
                  <Select value={taskSection} onValueChange={(v) => setTaskSection(v as SectionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quant">Quant (QA)</SelectItem>
                      <SelectItem value="DILR">DILR</SelectItem>
                      <SelectItem value="VARC">VARC</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Priority</label>
                  <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as PriorityType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Est. Minutes</label>
                  <Input
                    type="number"
                    min="5"
                    max="300"
                    value={taskMinutes}
                    onChange={(e) => setTaskMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm">Create Task</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Mistake Form */}
          <TabsContent value="mistake">
            <form onSubmit={handleCreateMistake} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Section</label>
                  <Select value={mistakeSection} onValueChange={(v) => setMistakeSection(v as SectionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quant">Quant</SelectItem>
                      <SelectItem value="DILR">DILR</SelectItem>
                      <SelectItem value="VARC">VARC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Mistake Category</label>
                  <Select value={mistakeType} onValueChange={(v) => setMistakeType(v as MistakeCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Concept gap">Concept gap</SelectItem>
                      <SelectItem value="Calculation error">Calculation error</SelectItem>
                      <SelectItem value="Misread question">Misread question</SelectItem>
                      <SelectItem value="Time sink">Time sink</SelectItem>
                      <SelectItem value="Wrong guess">Wrong guess</SelectItem>
                      <SelectItem value="Option elimination">Option elimination</SelectItem>
                      <SelectItem value="Set selection">Set selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Topic</label>
                  <Input
                    placeholder="e.g. Remainders, Linear Seating, RC Tone"
                    value={mistakeTopic}
                    onChange={(e) => setMistakeTopic(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Source & Q Ref</label>
                  <Input
                    placeholder="e.g. SIMCAT 1 Q18 or Bodhee Prep Set 3"
                    value={mistakeSource}
                    onChange={(e) => setMistakeSource(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">What went wrong?</label>
                <Textarea
                  placeholder="Describe your conceptual or execution error..."
                  value={whatWentWrong}
                  onChange={(e) => setWhatWentWrong(e.target.value)}
                  required
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rule for next time</label>
                <Input
                  placeholder="Actionable takeaway rule to prevent recurrence..."
                  value={ruleForNextTime}
                  onChange={(e) => setRuleForNextTime(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm">Save Mistake (Auto-Revisit in 7d)</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Mock Form */}
          <TabsContent value="mock">
            <form onSubmit={handleCreateMock} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Mock Name / Series</label>
                  <Input
                    placeholder="e.g. AIMCAT 2401 or SIMCAT 2"
                    value={mockSeries}
                    onChange={(e) => setMockSeries(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
                  <Input
                    type="date"
                    value={mockDate}
                    onChange={(e) => setMockDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg border border-border/80 bg-muted/20">
                <div>
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 block mb-1">VARC</span>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder="Att (0-24)"
                      min="0"
                      max="24"
                      value={varcAttempts || ''}
                      onChange={(e) => setVarcAttempts(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Score"
                      value={varcScore || ''}
                      onChange={(e) => setVarcScore(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">DILR</span>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder="Att (0-22)"
                      min="0"
                      max="22"
                      value={dilrAttempts || ''}
                      onChange={(e) => setDilrAttempts(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Score"
                      value={dilrScore || ''}
                      onChange={(e) => setDilrScore(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-amber-400 block mb-1">Quant</span>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder="Att (0-22)"
                      min="0"
                      max="22"
                      value={qaAttempts || ''}
                      onChange={(e) => setQaAttempts(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Score"
                      value={qaScore || ''}
                      onChange={(e) => setQaScore(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-1">
                <span>Total Attempts: <strong className="text-foreground">{Number(varcAttempts) + Number(dilrAttempts) + Number(qaAttempts)}</strong></span>
                <span>Total Score: <strong className="text-purple-700 dark:text-purple-300 font-bold">{Number(varcScore) + Number(dilrScore) + Number(qaScore)}</strong></span>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Biggest Lesson from this Mock</label>
                <Input
                  placeholder="e.g. Switched sets too late; maintain 8-minute rule"
                  value={mockLesson}
                  onChange={(e) => setMockLesson(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm">Record Mock</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Sticky Note Form */}
          <TabsContent value="note">
            <form onSubmit={handleCreateNote} className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Note Content</label>
                <Textarea
                  placeholder="Jot down a quick thought, formula, reminder, or insight..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  rows={4}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Note Color</label>
                <div className="flex gap-2">
                  {(['lavender', 'emerald', 'amber', 'rose', 'cyan', 'charcoal'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteColor(color)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        noteColor === color ? 'scale-110 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor:
                          color === 'lavender' ? '#8B5CF6' :
                          color === 'emerald' ? '#10B981' :
                          color === 'amber' ? '#F59E0B' :
                          color === 'rose' ? '#F43F5E' :
                          color === 'cyan' ? '#06B6D4' : '#27272A'
                      }}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm">Pin Note to Canvas</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
