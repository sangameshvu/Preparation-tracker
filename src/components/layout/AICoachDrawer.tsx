import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlideOver } from '../ui/SlideOver';
import { useAppData } from '../../context/AppDataContext';
import {
  Bot,
  Send,
  Sparkles,
  Target,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { generateCoachResponse } from '../../utils/catCoachBrain';

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

interface AICoachDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { stats, weeklyPlans, topics, topicProgress, mistakes, mockTests, addTask } = useAppData();
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I am your **AI Study Coach** for CAT 2027.\n\nI have real-time diagnostic visibility into your preparation:\n- **Syllabus Mastered:** ${stats.overallCompletionPct}%\n- **Active Stage:** Phase ${stats.currentPhase.phaseNumber} (${stats.currentPhase.name}) • Week ${stats.currentWeek}\n- **Days Remaining:** ${stats.daysRemaining} days\n- **Weak Topics Identified:** ${stats.weakTopicsCount} topics (confidence ≤ 2★)\n- **Pending Mistakes:** ${stats.pendingMistakesCount} (${stats.overdueMistakesCount} overdue)\n\nWhat would you like to focus on today? Click a quick strategy chip below or ask any question.`,
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
    if (open) {
      setTimeout(scrollToBottom, 150);
    }
  }, [open, messages, isThinking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);

  // Extract weak topics
  const weakTopics = topics
    .filter((t) => (topicProgress[t.id]?.confidence || 1) <= 2)
    .map((t) => `${t.topicName} (${t.section})`);

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
      // 1. If Supabase is configured, call secure Edge Function
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
                weakestTopics: weakTopics.slice(0, 5)
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
            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsThinking(false);
            return;
          }
        } catch (edgeErr) {
          console.warn('Edge function invoke failed, using local pedagogical brain:', edgeErr);
        }
      }

      // 2. High-performance in-browser diagnostic engine (Zero data egress)
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
      status: 'Not Started',
      priority: 'High',
      estimatedMinutes: 45,
      actualMinutes: 0,
      isTodayFocus: true
    });
  };

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      size={isMaximized ? 'fullscreen' : 'lg'}
      headerActions={
        <div className="flex items-center gap-1 mr-1">
          <button
            type="button"
            onClick={() => setIsMaximized((prev) => !prev)}
            title={isMaximized ? "Restore drawer size" : "Maximize coach panel"}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isMaximized ? "Restore drawer size" : "Maximize coach panel"}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate('/ai-coach');
            }}
            title="Open dedicated coach page"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open dedicated coach page"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      }
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <span>AI Study Coach</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
            CAT 2027
          </span>
        </div>
      }
      description="Personalized diagnostic mentor & strategy assistant"
    >
      {/* Quick Prompts Bar */}
      <div className="space-y-1.5 pb-2 border-b border-border/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Suggested Inquiries
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleSendMessage('Plan my week based on current progress')}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-foreground transition-colors border border-border/50 text-left cursor-pointer"
          >
            📅 Plan my week
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('What should I revise today?')}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-foreground transition-colors border border-border/50 text-left cursor-pointer"
          >
            🎯 What should I revise today?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Analyse my mock test performance')}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-foreground transition-colors border border-border/50 text-left cursor-pointer"
          >
            📊 Analyse my mocks
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div key={m.id} className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isAi
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-foreground'
                }`}
              >
                {isAi ? <Bot className="h-3.5 w-3.5" /> : 'You'}
              </div>

              <div className={`space-y-2 max-w-[85%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAi
                      ? 'bg-slate-100/80 dark:bg-slate-800/80 border border-border/60 text-foreground'
                      : 'bg-blue-600 text-white shadow-xs font-medium'
                  }`}
                >
                  <MarkdownRenderer content={m.text} />
                </div>

                {/* Proposal action card */}
                {m.actionProposal && (
                  <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-3 text-xs space-y-1.5">
                    <span className="font-bold text-blue-900 dark:text-blue-200 block">
                      Recommended Task:
                    </span>
                    <p className="text-blue-800 dark:text-blue-300">{m.actionProposal.title}</p>
                    <Button
                      size="sm"
                      onClick={() => handleApplyProposal(m.actionProposal!)}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mt-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add to Today's Tasks
                    </Button>
                  </div>
                )}

                <span className="text-[10px] text-muted-foreground block px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic px-2">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Coach is analyzing your metrics...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field (Footer slot) */}
      <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-card/95 backdrop-blur border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about formulas, DILR heuristics, VARC tone, syllabus, mocks..."
              className="w-full text-xs min-h-[40px] max-h-[160px] py-2.5 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 resize-none leading-relaxed transition-[height]"
            />
          </div>
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isThinking}
            size="sm"
            className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shrink-0 cursor-pointer mb-0.5"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Client-side diagnostic engine (100% private)
          </span>
          <span>Enter to send • Shift+Enter for newline</span>
        </div>
      </div>
    </SlideOver>
  );
};
