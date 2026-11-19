import React, { useState, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Bot,
  Send,
  Sparkles,
  Target,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  User,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { generateCoachResponse } from '../utils/catCoachBrain';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionProposal?: {
    type: 'add_task' | 'revisit_mistake';
    title: string;
    details: string;
  };
}

export const AICoachPage: React.FC = () => {
  const { stats, weeklyPlans, topics, topicProgress, mistakes, mockTests, addTask } = useAppData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your AI Study Coach for CAT 2027. I have real-time access to your preparation data:\n\n• Current Progress: **${stats.overallCompletionPct}%** of syllabus mastered\n• Active Phase: **Phase ${stats.currentPhase.phaseNumber} (${stats.currentPhase.name})**\n• Current Week: **Week ${stats.currentWeek} of 52** (${stats.daysRemaining} days until CAT 2027)\n• Weak Topics Identified: **${stats.weakTopicsCount} topics** at confidence level ≤ 2\n• Revision Queue: **${stats.pendingMistakesCount} mistakes pending** (${stats.overdueMistakesCount} overdue)\n\nHow can I help optimize your preparation today? Select a prompt below or ask me any question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputMessage]);

  // Weak topics list
  const weakTopics = topics
    .filter((t) => (topicProgress[t.id]?.confidence || 1) <= 2)
    .map((t) => `${t.topicName} (${t.section})`);

  // Active week plan
  const activePlan = weeklyPlans.find((p) => p.weekNumber === stats.currentWeek) || weeklyPlans[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);

    try {
      // 1. If Supabase is configured, attempt secure Edge Function call
      if (isSupabaseConfigured && supabase) {
        try {
          const historyPayload = messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.text
          }));

          const { data, error } = await supabase.functions.invoke('chat-study-coach', {
            body: {
              message: text.trim(),
              history: historyPayload,
              context: {
                stats,
                currentPhase: stats.currentPhase,
                weakestTopics: weakTopics.slice(0, 5),
              }
            }
          });

          // Verify if response is genuine LLM output vs unconfigured canned fallback
          const isCannedFallback = !data?.reply ||
            Boolean(data?.isFallback) ||
            data.reply.includes('Strategy Check-in:') ||
            data.reply.includes('Here is your current status overview:') ||
            data.reply.includes('Recommended Daily Blueprint for Week') ||
            data.reply.includes('Strategic Mock Philosophy for CAT 2027') ||
            data.reply.includes('Overcoming Weak Areas (Diagnostic Framework)');

          if (!error && data && data.reply && !isCannedFallback) {
            let proposal: ChatMessage['actionProposal'] | undefined = undefined;
            if (data.actionProposals && data.actionProposals.length > 0) {
              proposal = {
                type: 'add_task',
                title: data.actionProposals[0].title,
                details: `Suggested by AI Coach based on current preparation status.`
              };
            }

            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actionProposal: proposal
            };

            setMessages((prev) => [...prev, aiMsg]);
            setIsThinking(false);
            return;
          }
        } catch (edgeErr) {
          console.warn('Edge function invoke failed, using local pedagogical brain:', edgeErr);
        }
      }

      // 2. High-performance in-browser diagnostic & pedagogical engine
      const coachResult = generateCoachResponse(text, {
        stats,
        weakTopics,
        activePlan
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: coachResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionProposal: coachResult.actionProposal
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    } catch {
      setIsThinking(false);
    }
  };

  const handleApplyProposal = (proposal: NonNullable<ChatMessage['actionProposal']>) => {
    addTask({
      title: proposal.title,
      description: proposal.details,
      section: 'Quant',
      status: 'In Progress',
      priority: 'High',
      estimatedMinutes: 60,
      actualMinutes: 0,
      isTodayFocus: true
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Study Coach & Preparation Analyst</h1>
          <Badge variant="purple" className="text-xs gap-1">
            <Sparkles className="h-3 w-3" />
            Active Context Ingestion
          </Badge>
        </div>
      </div>

      {/* Main Workspace (Grid: Chat + Live Context Dossier) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat Panel (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col h-[650px] border-border/80 shadow-md">
          <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">AI Study Coach Stream</h3>
                <span className="text-[10px] text-muted-foreground font-mono">Server-Side Shielded • Zero Hallucination Mode</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMessages([messages[0]])}
            >
              Clear Conversation
            </Button>
          </CardHeader>

          {/* Messages Stream */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'glass-tint text-white rounded-br-none shadow-md font-medium'
                        : 'glass-thin border border-white/60 dark:border-white/10 text-foreground rounded-bl-none leading-relaxed shadow-xs'
                    }`}
                  >
                    {msg.sender === 'ai' ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <div className="whitespace-pre-line text-xs font-sans">{msg.text}</div>
                    )}
                  </div>

                  {/* Non-Destructive Action Proposal Card */}
                  {msg.actionProposal && (
                    <div className="p-3 rounded-xl border border-blue-400/40 glass-thin text-xs space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" /> Action Proposal
                        </span>
                        <Badge variant="blue" className="text-[9px]">Requires Confirmation</Badge>
                      </div>
                      <p className="text-foreground font-semibold">{msg.actionProposal.title}</p>
                      <p className="text-muted-foreground text-[11px]">{msg.actionProposal.details}</p>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs w-full gap-1 mt-1 font-semibold"
                        onClick={() => handleApplyProposal(msg.actionProposal!)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Apply to Today's Tasks</span>
                      </Button>
                    </div>
                  )}

                  <span className={`text-[10px] text-muted-foreground block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg glass-thin text-foreground mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 text-xs items-center text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg glass-thin text-blue-500 border border-blue-400/40">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <span>Analyzing preparation metrics and generating tactical advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-border/40 glass-thin flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSendMessage('Analyze my current preparation progress and weak spots')}
              className="text-[11px] px-2.5 py-1 rounded-full glass-thin hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer"
            >
              📊 Progress Audit
            </button>
            <button
              onClick={() => handleSendMessage('Generate a realistic study plan for today based on my active week')}
              className="text-[11px] px-2.5 py-1 rounded-full glass-thin hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer"
            >
              📅 Plan Today's Study
            </button>
            <button
              onClick={() => handleSendMessage('Recommend what topic I should study next')}
              className="text-[11px] px-2.5 py-1 rounded-full glass-thin hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer"
            >
              🎯 Next Topic Recommendation
            </button>
            <button
              onClick={() => handleSendMessage('Audit my mock exam strategy and mistake patterns')}
              className="text-[11px] px-2.5 py-1 rounded-full glass-thin hover:bg-black/5 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer"
            >
              🔍 Mock Strategy & Mistakes
            </button>
          </div>

          {/* Input Footer */}
          <CardFooter className="p-3 border-t border-border/40 glass-thick">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full items-end gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Ask your AI coach about topics, formulas, strategies, or study pacing..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full text-xs min-h-[40px] max-h-[180px] py-2.5 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-purple-600/30 resize-none leading-relaxed transition-[height]"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isThinking}
                variant="default"
                size="sm"
                className="h-10 px-4 gap-1.5 shrink-0 mb-0.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ask Coach</span>
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Right: Live Preparation Context Dossier (1 col) */}
        <Card className="h-[650px] flex flex-col border-border/80 shadow-md">
          <CardHeader className="py-3 px-4 border-b border-border/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Live Preparation Context Stream</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Quick Metrics */}
            <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Week:</span>
                <strong className="text-purple-400 font-mono">Week {stats.currentWeek} of 52</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Preparation Phase:</span>
                <span className="font-semibold text-foreground">Phase {stats.currentPhase.phaseNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Overall Completion:</span>
                <span className="font-mono font-bold text-emerald-400">{stats.overallCompletionPct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Days Remaining:</span>
                <span className="font-mono font-bold text-foreground">{stats.daysRemaining} days</span>
              </div>
            </div>

            {/* Weak Topics */}
            <div>
              <span className="font-semibold text-foreground block mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Weak Topics (Conf ≤ 2):</span>
              </span>
              {weakTopics.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">No weak topics flagged.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {weakTopics.slice(0, 8).map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-red-500/10 text-red-300 border-red-500/20">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Active Mistake Queue */}
            <div>
              <span className="font-semibold text-foreground block mb-1.5 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                <span>Mistake Queue Status:</span>
              </span>
              <div className="p-2.5 rounded-lg border border-border/70 bg-card text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Re-solving:</span>
                  <strong className="font-mono text-foreground">{stats.pendingMistakesCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overdue (&gt;7 days):</span>
                  <strong className="font-mono text-red-400">{stats.overdueMistakesCount}</strong>
                </div>
              </div>
            </div>

            {/* Target 90% Blueprint Reminder */}
            <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1 text-[11px]">
              <strong className="text-purple-700 dark:text-purple-300 block">PDF Blueprint Target 90%+:</strong>
              <p className="text-muted-foreground">
                • VARC: 15–20 net score<br />
                • DILR: 10 net score<br />
                • QA: 5+ net score
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
