import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Bot,
  Send,
  Sparkles,
  Target,
  CheckCircle2,
  User,
  Copy,
  Check,
  Trash2,
  Plus,
  MessageSquare,
  History,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Layers,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Zap,
  HelpCircle,
  Clock,
  RotateCcw,
  Square
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { generateCoachResponse, generateAssistantResponse, AIMode } from '../utils/catCoachBrain';
import { cn } from '../lib/utils';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  mode?: AIMode;
  actionProposal?: {
    type: 'add_task' | 'revisit_mistake';
    title: string;
    details: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  mode: AIMode;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const STORAGE_KEY_SESSIONS = 'cat2027_coach_sessions';
const STORAGE_KEY_ACTIVE = 'cat2027_active_coach_session';

export const AICoachPage: React.FC = () => {
  const { stats, weeklyPlans, topics, topicProgress, addTask } = useAppData();

  // Extract weak topics
  const weakTopics = useMemo(() => {
    return topics
      .filter((t) => (topicProgress[t.id]?.confidence || 1) <= 2)
      .map((t) => `${t.topicName} (${t.section})`);
  }, [topics, topicProgress]);

  // Active week plan
  const activePlan = useMemo(() => {
    return weeklyPlans.find((p) => p.weekNumber === stats.currentWeek) || weeklyPlans[0];
  }, [weeklyPlans, stats.currentWeek]);

  // Default initial message
  const createInitialMessage = (mode: AIMode): ChatMessage => {
    if (mode === 'coach') {
      return {
        id: 'init-coach',
        sender: 'ai',
        mode: 'coach',
        text: `Hello! I am your **AI Study Coach** for CAT 2027.\n\nI have real-time diagnostic visibility into your preparation:\n• **Syllabus Mastered:** **${stats.overallCompletionPct}%** of total curriculum\n• **Active Phase:** **Phase ${stats.currentPhase.phaseNumber} (${stats.currentPhase.name})** • Week ${stats.currentWeek} of 52\n• **Days Remaining:** **${stats.daysRemaining} days**\n• **Weak Areas Backlog:** **${stats.weakTopicsCount} topics** (confidence ≤ 2★)\n• **Revision Queue:** **${stats.pendingMistakesCount} errors pending** (${stats.overdueMistakesCount} overdue)\n\nHow can I help you optimize your study plan today? Select a prompt below or ask any question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      return {
        id: 'init-assistant',
        sender: 'ai',
        mode: 'assistant',
        text: `Hello! I am your **AI Assistant**.\n\nI am ready to help you with general question answering, vocabulary definitions, concept explanations, writing, and calculations — just like ChatGPT or Claude.\n\nAsk me anything! For example:\n• *"Meaning of benevolent"*\n• *"Difference between Permutation and Combination"*\n• *"How to identify author's tone in reading comprehension"*\n• *"Tips to improve reading speed with retention"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  };

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved coach sessions:', e);
    }
    const defaultSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'CAT 2027 Planning & Strategy',
      mode: 'coach',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createInitialMessage('coach')]
    };
    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (savedId && sessions.some((s) => s.id === savedId)) return savedId;
    } catch {}
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const activeMode: AIMode = activeSession?.mode || 'coach';

  // Input & UI States
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopStreamingRef = useRef(false);
  const activeStreamDataRef = useRef<{
    fullText: string;
    actionProposal?: ChatMessage['actionProposal'];
    messageId: string;
    sessionId: string;
  } | null>(null);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
    } catch (e) {
      console.warn('Failed to persist coach sessions:', e);
    }
  }, [sessions, activeSessionId]);

  // Auto-scroll on new messages & streaming chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isThinking, streamingText]);

  // Cleanup stream interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  // Stop Generating
  const handleStopStreaming = () => {
    stopStreamingRef.current = true;
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsThinking(false);

    if (isStreaming && activeStreamDataRef.current) {
      const { messageId, sessionId } = activeStreamDataRef.current;
      const currentPartial = streamingText;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId
                  ? { ...m, text: currentPartial.trim() || 'Response stopped.' }
                  : m
              )
            };
          }
          return s;
        })
      );
    }

    setIsStreaming(false);
    setStreamingMessageId(null);
    setStreamingText('');
    activeStreamDataRef.current = null;
  };

  // Start smooth typing animation loop
  const startStreamingResponse = (
    fullText: string,
    actionProposal: ChatMessage['actionProposal'] | undefined,
    aiMsgId: string,
    targetSessionId: string
  ) => {
    setIsThinking(false);
    setIsStreaming(true);
    setStreamingMessageId(aiMsgId);
    setStreamingText('');
    stopStreamingRef.current = false;
    activeStreamDataRef.current = {
      fullText,
      actionProposal,
      messageId: aiMsgId,
      sessionId: targetSessionId
    };

    // Add placeholder message to sessions
    const placeholderAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      mode: activeMode,
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === targetSessionId ? { ...s, messages: [...s.messages, placeholderAiMsg] } : s))
    );

    let currentIndex = 0;
    // Dynamic typing chunk size: scales smoothly with content length (e.g. ~3 to 14 chars per 18ms)
    const chunkSize = Math.max(3, Math.ceil(fullText.length / 85));
    const tickMs = 18;

    streamIntervalRef.current = setInterval(() => {
      if (stopStreamingRef.current) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        return;
      }

      currentIndex += chunkSize;

      if (currentIndex >= fullText.length) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === aiMsgId ? { ...m, text: fullText, actionProposal } : m
                )
              };
            }
            return s;
          })
        );

        setIsStreaming(false);
        setStreamingMessageId(null);
        setStreamingText('');
        activeStreamDataRef.current = null;
      } else {
        const partial = fullText.slice(0, currentIndex);
        setStreamingText(partial);
      }
    }, tickMs);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputMessage]);

  // Switch Mode for Current Session
  const handleSwitchMode = (newMode: AIMode) => {
    if (newMode === activeMode) return;
    if (isStreaming) handleStopStreaming();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          // If session has only the default initial message, swap it
          const isInitialOnly = s.messages.length <= 1;
          const updatedMessages = isInitialOnly
            ? [createInitialMessage(newMode)]
            : s.messages;
          return {
            ...s,
            mode: newMode,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages
          };
        }
        return s;
      })
    );
  };

  // Create New Chat
  const handleCreateNewChat = (mode: AIMode = activeMode) => {
    if (isStreaming) handleStopStreaming();
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: mode === 'coach' ? 'New CAT Study Chat' : 'New Q&A Chat',
      mode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createInitialMessage(mode)]
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputMessage('');
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Delete Chat Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStreaming) handleStopStreaming();
    if (sessions.length <= 1) {
      // Reset the single session instead of deleting
      const resetSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: activeMode === 'coach' ? 'CAT 2027 Planning & Strategy' : 'General Assistant Chat',
        mode: activeMode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [createInitialMessage(activeMode)]
      };
      setSessions([resetSession]);
      setActiveSessionId(resetSession.id);
      return;
    }

    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Clear Messages in current session
  const handleClearCurrentSession = () => {
    if (isStreaming) handleStopStreaming();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [createInitialMessage(s.mode)],
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );
  };

  // Copy Message Text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send Message
  const handleSendMessage = async (overrideText?: string) => {
    const text = overrideText || inputMessage;
    if (!text.trim() || isThinking || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update session title on first user message if still default
    const shouldUpdateTitle = activeSession.messages.filter((m) => m.sender === 'user').length === 0;
    const newTitle = shouldUpdateTitle
      ? text.trim().slice(0, 32) + (text.trim().length > 32 ? '...' : '')
      : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMsg]
          };
        }
        return s;
      })
    );

    if (!overrideText) setInputMessage('');
    setIsThinking(true);

    try {
      // 1. If Supabase is configured and connected, attempt live edge function
      if (isSupabaseConfigured && supabase) {
        try {
          const historyPayload = activeSession.messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.text
          }));

          const { data, error } = await supabase.functions.invoke('chat-study-coach', {
            body: {
              message: text.trim(),
              history: historyPayload,
              mode: activeMode,
              context: {
                stats,
                currentPhase: stats.currentPhase,
                weakestTopics: weakTopics.slice(0, 5)
              }
            }
          });

          const isCanned = !data?.reply ||
            Boolean(data?.isFallback) ||
            data.reply.includes('Strategy Check-in:') ||
            data.reply.includes('Recommended Daily Blueprint for Week');

          if (!error && data && data.reply && !isCanned) {
            startStreamingResponse(data.reply, undefined, `ai-${Date.now()}`, activeSessionId);
            return;
          }
        } catch (edgeErr) {
          console.warn('Edge function invoke skipped, falling back to instant client engine:', edgeErr);
        }
      }

      // 2. High-performance In-Browser Pedagogical & Language Engine
      let responseResult;
      if (activeMode === 'assistant') {
        responseResult = generateAssistantResponse(text, {
          stats,
          weakTopics,
          activePlan,
          mode: 'assistant'
        });
      } else {
        responseResult = generateCoachResponse(text, {
          stats,
          weakTopics,
          activePlan,
          mode: 'coach'
        });
      }

      // Brief natural thinking pause for conversational realism
      await new Promise((resolve) => setTimeout(resolve, 250));

      startStreamingResponse(
        responseResult.text,
        responseResult.actionProposal,
        `ai-${Date.now()}`,
        activeSessionId
      );
    } catch (e) {
      console.error('Error generating AI response:', e);
      setIsThinking(false);
      setIsStreaming(false);
    }
  };

  // Apply action proposal to user study plan
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

  // Starter Prompt Suggestions
  const coachSuggestions = [
    { title: 'Plan Study Week', desc: 'Customized schedule based on active week & weak areas', query: 'Plan my study week based on my active progress and weak topics' },
    { title: 'What to Revise Today?', desc: 'Prioritize mistake log and overdue flagged topics', query: 'What should I revise today based on my mistakes and weak areas?' },
    { title: 'CAT 3-Round Mock Strategy', desc: 'Score vs percentile target & sectional time allocation', query: 'Explain the 3-round mock test taking technique for CAT' },
    { title: 'Euler\'s Totient & Remainders', desc: 'Derivation, formulas, and shortcut applications', query: 'Explain Euler\'s Totient theorem and remainders for CAT Quant' }
  ];

  const assistantSuggestions = [
    { title: 'Meaning of "Benevolent"', desc: 'Definition, root words, synonyms, antonyms & RC nuance', query: 'Meaning of benevolent' },
    { title: 'Author\'s Tone in RC', desc: 'How to detect cynical, skeptical, or pragmatic tone', query: 'How to identify author\'s tone and eliminate extreme options in RC' },
    { title: 'Permutation vs Combination', desc: 'Intuitive differences, formulas, and real examples', query: 'Difference between permutation and combination with intuitive examples' },
    { title: 'Read Faster with Retention', desc: 'Eliminate subvocalization and trace topic sentences', query: 'Give me 4 techniques to read faster with high retention' }
  ];

  const activeSuggestions = activeMode === 'coach' ? coachSuggestions : assistantSuggestions;

  return (
    <div className="flex h-[calc(100vh-6.5rem)] rounded-3xl glass-regular border border-border/80 overflow-hidden shadow-2xl relative select-none">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR: ChatGPT / Claude Style Chat History & Sessions */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={cn(
          'absolute lg:relative z-20 flex flex-col h-full glass-thick border-r border-border/60 transition-all duration-300 ease-in-out shrink-0 overflow-hidden',
          sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0'
        )}
      >
        <div className="p-3.5 border-b border-border/40 flex items-center justify-between gap-2">
          {/* New Chat Button */}
          <Button
            size="sm"
            variant="default"
            onClick={() => handleCreateNewChat(activeMode)}
            className="flex-1 gap-2 text-xs font-semibold glass-tint text-white shadow-xs cursor-pointer h-9 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>

          {/* Close Sidebar Toggle (Mobile / Desktop) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            title="Collapse sidebar"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector In Sidebar */}
        <div className="p-3 border-b border-border/40 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            AI Operating Mode
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900/50 border border-border/60">
            <button
              type="button"
              onClick={() => handleSwitchMode('coach')}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeMode === 'coach'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                <span>Coach</span>
              </div>
              <span className="text-[9px] font-normal opacity-80 mt-0.5">CAT Prep</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('assistant')}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeMode === 'assistant'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                <span>Assistant</span>
              </div>
              <span className="text-[9px] font-normal opacity-80 mt-0.5">General Q&A</span>
            </button>
          </div>
        </div>

        {/* Saved Conversations List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Conversations</span>
            <span className="font-mono">({sessions.length})</span>
          </div>

          {sessions.map((s) => {
            const isSelected = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  if (isStreaming) handleStopStreaming();
                  setActiveSessionId(s.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={cn(
                  'group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all',
                  isSelected
                    ? 'glass-thin bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold border border-blue-400/30 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')} />
                  <div className="truncate flex-1">
                    <span className="truncate block">{s.title}</span>
                    <span className="text-[10px] font-mono opacity-70 block">
                      {s.mode === 'coach' ? '🎓 Coach' : '⚡ Assistant'} • {s.messages.length} msgs
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title="Delete chat"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shrink-0 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> 100% Private Engine
          </span>
          <button
            type="button"
            onClick={handleClearCurrentSession}
            className="hover:underline hover:text-foreground cursor-pointer flex items-center gap-0.5"
          >
            <RotateCcw className="h-3 w-3" /> Clear
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT / MAIN: Full ChatGPT & Claude Style Chat Workspace */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-transparent relative">
        {/* Top Header Bar */}
        <header className="h-14 px-4 border-b border-border/40 glass-thin flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Open chat history"
                className="p-1.5 rounded-xl glass-thin text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-xs">
                  {activeSession.title}
                </span>
                <Badge
                  variant={activeMode === 'coach' ? 'blue' : 'secondary'}
                  className="text-[10px] px-2 py-0 hidden sm:inline-flex gap-1"
                >
                  {activeMode === 'coach' ? (
                    <>
                      <Target className="h-3 w-3" /> Coach Mode
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 text-emerald-500" /> Assistant Mode
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Mode Switcher Segmented Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-200/60 dark:bg-slate-900/60 border border-border/60">
            <button
              type="button"
              onClick={() => handleSwitchMode('coach')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                activeMode === 'coach'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Switch to Coach Mode (CAT 2027 Planning, Syllabus Pacing & Strategy)"
            >
              <Target className="h-3.5 w-3.5" />
              <span>Coach Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('assistant')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                activeMode === 'assistant'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Switch to Assistant Mode (General Q&A, Definitions, Chatbot & Reasoning)"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Assistant Mode</span>
            </button>
          </div>
        </header>

        {/* Mode Information Banner */}
        <div className="px-4 py-1.5 border-b border-border/30 bg-card/40 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            {activeMode === 'coach' ? (
              <>
                <Target className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">
                  <strong>Coach Mode:</strong> Tailored to CAT 2027 planning, 53 syllabus topics, weekly targets, weak areas, and mock strategy.
                </span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  <strong>Assistant Mode:</strong> General AI chatbot for questions, word meanings (e.g. <em>Meaning of benevolent</em>), grammar, math, and writing.
                </span>
              </>
            )}
          </span>
          <span className="text-[10px] font-mono shrink-0 pl-2">
            Week {stats.currentWeek} • {stats.daysRemaining}d to CAT
          </span>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Empty State / Welcome Screen when only initial message exists */}
            {activeSession.messages.length <= 1 && (
              <div className="py-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto glass-tint text-white shadow-lg">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {activeMode === 'coach' ? 'How can I guide your CAT preparation today?' : 'How can I assist you today?'}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    {activeMode === 'coach'
                      ? 'Ask about weekly pacing, formulas, weak topics, or mock test post-mortem analysis.'
                      : 'Ask any question, vocabulary definitions, conceptual proofs, essay writing, or general problem solving.'}
                  </p>
                </div>

                {/* Quick Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
                  {activeSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(sug.query)}
                      className="p-3 rounded-2xl glass-thin hover:border-blue-500/50 hover:bg-black/5 dark:hover:bg-white/5 border border-border/60 transition-all text-left cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {sug.title}
                        </span>
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {sug.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {activeSession.messages.map((m) => {
              const isAi = m.sender === 'ai';
              const isThisStreaming = isStreaming && m.id === streamingMessageId;
              const displayText = isThisStreaming ? streamingText : m.text;

              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex gap-3 text-xs leading-relaxed',
                    isAi ? 'justify-start' : 'justify-end'
                  )}
                >
                  {isAi && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl glass-tint text-white shadow-xs mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={cn('space-y-2', isAi ? 'max-w-[90%] sm:max-w-[85%]' : 'max-w-[85%] sm:max-w-[75%]')}>
                    <div
                      className={cn(
                        'p-4 rounded-2xl shadow-xs transition-all relative group',
                        isAi
                          ? 'glass-thick border border-border/70 text-foreground rounded-tl-sm'
                          : 'glass-tint text-white rounded-tr-sm shadow-md font-medium'
                      )}
                    >
                      {/* Copy Button on AI responses */}
                      {isAi && (
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[10px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80 flex items-center gap-1">
                            {m.mode === 'assistant' ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">⚡ AI Assistant</span>
                            ) : (
                              <span className="text-blue-600 dark:text-blue-400 font-bold">🎓 AI Study Coach</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(displayText, m.id)}
                            disabled={isThisStreaming}
                            title="Copy response"
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {isAi ? (
                        <div className="relative">
                          <MarkdownRenderer content={displayText} />
                          {isThisStreaming && (
                            <span
                              aria-hidden="true"
                              className="inline-block w-2 h-4 ml-1 bg-blue-600 dark:bg-blue-400 rounded-xs animate-pulse align-middle"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-line text-xs font-sans">{m.text}</div>
                      )}
                    </div>

                    {/* Action proposal card (Coach mode only) */}
                    {m.actionProposal && !isThisStreaming && (
                      <div className="p-3.5 rounded-2xl border border-blue-400/40 glass-thin text-xs space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-700 dark:text-blue-300 text-xs flex items-center gap-1.5">
                            <Target className="h-4 w-4" /> Actionable Task Recommendation
                          </span>
                          <Badge variant="blue" className="text-[10px]">1-Click Add</Badge>
                        </div>
                        <p className="text-foreground font-semibold">{m.actionProposal.title}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{m.actionProposal.details}</p>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 text-xs font-semibold gap-1.5 mt-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleApplyProposal(m.actionProposal!)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add to Today's Tasks</span>
                        </Button>
                      </div>
                    )}

                    <span className={cn('text-[10px] text-muted-foreground block px-1', isAi ? 'text-left' : 'text-right')}>
                      {m.timestamp}
                    </span>
                  </div>

                  {!isAi && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl glass-thin text-foreground shadow-xs mt-0.5 font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Streaming Indicator */}
            {isThinking && (
              <div className="flex gap-3 text-xs items-center text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl glass-tint text-white shadow-xs">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-thin border border-border/60">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span>
                    {activeMode === 'coach'
                      ? 'Analyzing preparation metrics and generating tactical advice...'
                      : 'Assistant is generating response...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM INPUT DOCK: Floating ChatGPT / Claude Style Input Bar */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 border-t border-border/40 glass-thick shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Floating Stop Generating Button */}
            {(isThinking || isStreaming) && (
              <div className="flex justify-center -mt-1 mb-2">
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold glass-thick border border-border/80 shadow-md hover:bg-red-500/10 hover:border-red-500/40 text-foreground transition-all cursor-pointer animate-in fade-in"
                >
                  <Square className="h-3 w-3 fill-red-500 text-red-500" />
                  <span>Stop generating</span>
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-end gap-2 p-1.5 rounded-2xl glass-regular border border-border/80 shadow-md focus-within:ring-2 focus-within:ring-blue-500/40 transition-all"
            >
              {/* Mode indicator pill inside the input box */}
              <button
                type="button"
                onClick={() => handleSwitchMode(activeMode === 'coach' ? 'assistant' : 'coach')}
                className={cn(
                  'h-8 px-2.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors',
                  activeMode === 'coach'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                )}
                title="Click to toggle between Coach Mode and Assistant Mode"
              >
                {activeMode === 'coach' ? (
                  <>
                    <Target className="h-3 w-3" />
                    <span>Coach</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" />
                    <span>Assistant</span>
                  </>
                )}
              </button>

              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isThinking && !isStreaming) {
                        handleSendMessage();
                      }
                    }
                  }}
                  placeholder={
                    activeMode === 'coach'
                      ? 'Ask about CAT strategy, study pacing, formulas, weak areas, mock analysis...'
                      : 'Ask anything... definitions (e.g. "Meaning of benevolent"), explanations, calculations, Q&A...'
                  }
                  className="w-full text-xs min-h-[38px] max-h-[160px] py-2 px-2 bg-transparent text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed transition-[height]"
                />
              </div>

              <Button
                type="submit"
                disabled={!inputMessage.trim() || isThinking || isStreaming}
                size="sm"
                className="h-9 px-3.5 rounded-xl font-semibold glass-tint text-white shrink-0 cursor-pointer shadow-xs disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Client-side diagnostic & language engine (100% private)</span>
              </span>
              <span>Enter to send • Shift+Enter for newline</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
