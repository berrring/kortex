import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  Square,
  Sparkles,
  Bot,
  User,
  FolderKanban,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Settings,
  Cpu,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';

export function AssistantPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('c');
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [activeToolCall, setActiveToolCall] = useState(null);
  const [providerConfigured, setProviderConfigured] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Load conversation and project context on mount / URL change
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // 1. Check health / provider config
      const health = await api.health();
      if (mounted) {
        setProviderConfigured(health.aiConfigured || health.mode === 'local');
      }

      // 2. Load projects for context selector
      const pList = await api.getProjects();
      if (mounted) setProjects(pList);

      // 3. Load or create conversation
      const convs = await api.getConversations();
      if (!mounted) return;

      if (activeConvId) {
        const found = convs.find((c) => c.id === activeConvId);
        if (found) {
          setConversation(found);
          setMessages(found.messages || []);
          return;
        }
      }

      if (convs.length > 0) {
        setConversation(convs[0]);
        setMessages(convs[0].messages || []);
        setSearchParams({ c: convs[0].id }, { replace: true });
      } else {
        // Create initial conversation
        const newConv = await api.createConversation('Новый диалог');
        if (mounted) {
          setConversation(newConv);
          setMessages(newConv.messages || []);
          setSearchParams({ c: newConv.id }, { replace: true });
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [activeConvId]);

  // Listen for voice messages from Jarvis mode
  useEffect(() => {
    const handleVoiceMessage = (e) => {
      if (e.detail?.text) {
        handleSendMessage(e.detail.text);
      }
    };
    window.addEventListener('kortex:voice-message', handleVoiceMessage);
    return () => window.removeEventListener('kortex:voice-message', handleVoiceMessage);
  }, [conversation, selectedProjectId, messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, activeToolCall, pendingApproval]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleNewConversation = async () => {
    const newConv = await api.createConversation('Новый диалог');
    setConversation(newConv);
    setMessages([]);
    setPendingApproval(null);
    setActiveToolCall(null);
    setErrorBanner(null);
    setSearchParams({ c: newConv.id });
  };

  const handleSendMessage = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setErrorBanner(null);
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Update conversation title if first message
    if (conversation && messages.length === 0) {
      const summaryTitle = trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed;
      await api.updateConversation(conversation.id, { title: summaryTitle });
      setConversation((prev) => ({ ...prev, title: summaryTitle }));
    }

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    let assistantMsgId = `msg-${Date.now() + 1}`;
    let streamedContent = '';

    await api.streamChat({
      messages: newMessages,
      conversationId: conversation?.id,
      projectId: selectedProjectId,
      abortSignal: abortControllerRef.current.signal,
      onChunk: (chunk) => {
        streamedContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.id === assistantMsgId) {
            return [...prev.slice(0, -1), { ...last, content: streamedContent }];
          }
          return [
            ...prev,
            {
              id: assistantMsgId,
              role: 'assistant',
              content: streamedContent,
              timestamp: new Date().toISOString()
            }
          ];
        });
      },
      onToolCall: (toolData) => {
        setActiveToolCall(toolData);
        if (toolData.status === 'completed' || toolData.status === 'error') {
          setTimeout(() => setActiveToolCall(null), 3000);
        }
      },
      onApprovalRequired: (approvalData) => {
        setPendingApproval(approvalData);
        setIsStreaming(false);
      },
      onDone: (finalContent) => {
        setIsStreaming(false);
        setActiveToolCall(null);
        if (conversation && (finalContent || streamedContent)) {
          api.updateConversation(conversation.id, {
            messages: [
              ...newMessages,
              {
                id: assistantMsgId,
                role: 'assistant',
                content: finalContent || streamedContent,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        setActiveToolCall(null);
        if (err.code === 'AI_PROVIDER_NOT_CONFIGURED') {
          setProviderConfigured(false);
        } else {
          setErrorBanner(err.message || 'Произошла ошибка при обращении к AI-провайдеру.');
        }
      }
    });
  };

  const handleApproveTool = async (approved) => {
    if (!pendingApproval) return;
    const approvalData = pendingApproval;
    setPendingApproval(null);

    const res = await api.approveTool({
      toolCallId: approvalData.toolCallId,
      toolName: approvalData.toolName,
      arguments: approvalData.arguments,
      conversationId: conversation?.id,
      approved
    });

    if (approved && res.success) {
      // Append confirmation note and resume response
      const toolNotice = `*(Действие "${approvalData.toolName}" выполнено: ${res.result})*`;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: toolNotice,
          timestamp: new Date().toISOString()
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `*(Выполнение действия "${approvalData.toolName}" было отклонено пользователем)*`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Какие у меня задачи с высоким приоритетом на сегодня?',
    'Сколько сейчас времени и какой сегодня день?',
    'Найди информацию по проекту Kortex в заметках',
    'Сохрани в память: я предпочитаю краткие ответы на русском'
  ];

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-neutral-300" />
            <h1 className="font-semibold text-sm text-neutral-100 truncate max-w-xs">
              {conversation?.title || 'Ассистент'}
            </h1>
          </div>

          {/* Project Context Pill Selector */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-neutral-800">
            <FolderKanban className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="bg-neutral-800/80 text-neutral-300 text-xs px-2 py-1 rounded-lg border border-neutral-700/60 focus:outline-none focus:border-neutral-500"
            >
              <option value="">Контекст: Общий</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Проект: {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
            title="Создать новый диалог"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Новый диалог</span>
          </button>
        </div>
      </header>

      {/* Unconfigured Provider Banner */}
      {!providerConfigured && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-900/60 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-100">
                AI-провайдер не настроен (или работает в локальном режиме)
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Для выполнения реальных запросов укажите API-ключ в Настройках или запустите локальную модель через Ollama (без ключа).
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Настроить AI</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorBanner && (
        <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center justify-between gap-2">
          <span>{errorBanner}</span>
          <button onClick={() => setErrorBanner(null)} className="p-1 text-rose-400 hover:text-rose-200">
            ×
          </button>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto py-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-400 text-neutral-950 flex items-center justify-center font-bold text-xl shadow-lg mb-4">
              K
            </div>
            <h2 className="text-lg font-semibold text-neutral-100">Чем я могу помочь вам сегодня?</h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-md leading-relaxed">
              Я Kortex — персональный AI-ассистент с доступом к вашим задачам, проектам, долговременной памяти и инструментам MCP.
            </p>

            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 w-full">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 text-left rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 hover:text-neutral-100 transition group flex flex-col justify-between"
                >
                  <span className="leading-snug">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 self-end mt-2 transition" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`group relative rounded-2xl p-4 text-xs leading-relaxed max-w-2xl ${
                    isUser
                      ? 'bg-neutral-100 text-neutral-950 font-normal shadow-sm'
                      : 'bg-neutral-900/90 border border-neutral-800/80 text-neutral-200'
                  }`}
                >
                  {/* Markdown formatted content */}
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                  {/* Copy button */}
                  {!isUser && msg.content && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition"
                      title="Скопировать ответ"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Active Tool Call Indicator Card */}
        {activeToolCall && (
          <div className="max-w-3xl mx-auto flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 animate-in fade-in duration-200">
            <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
            <div className="flex-1">
              <span className="font-semibold text-neutral-200">Вызов инструмента MCP: </span>
              <code className="px-1.5 py-0.5 rounded bg-neutral-800 text-indigo-300 font-mono text-[11px]">
                {activeToolCall.toolName}
              </code>
              <span className="ml-2 text-neutral-400">
                {activeToolCall.status === 'running' ? 'Выполняется...' : 'Завершено'}
              </span>
            </div>
          </div>
        )}

        {/* Human-In-The-Loop Approval Card */}
        {pendingApproval && (
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-neutral-900 border-2 border-amber-500/50 shadow-xl text-neutral-200 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-amber-300 uppercase tracking-wider">
                    Требуется подтверждение действия
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-1">
                  Ассистент запросил выполнение операции, изменяющей данные:
                </p>

                <div className="mt-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] font-mono text-neutral-300 space-y-1">
                  <div>
                    <span className="text-neutral-500">Инструмент: </span>
                    <span className="text-indigo-400 font-semibold">{pendingApproval.toolName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Параметры: </span>
                    <span>{JSON.stringify(pendingApproval.arguments, null, 2)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleApproveTool(true)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition shadow"
                  >
                    Подтвердить и выполнить
                  </button>
                  <button
                    onClick={() => handleApproveTool(false)}
                    className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <footer className="p-4 sm:p-6 border-t border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md shrink-0">
        <div className="max-w-3xl mx-auto relative flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-2.5 transition focus-within:border-neutral-600">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Спросите Kortex или дайте поручение... (Enter для отправки)"
            className="w-full bg-transparent text-xs text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none p-1.5 leading-relaxed max-h-44"
          />

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 mt-1">
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="hidden sm:inline">Shift + Enter — новая строка</span>
              {selectedProjectId && (
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 text-[10px]">
                  Контекст активен
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={handleStopStreaming}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Остановить</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed shadow"
                >
                  <span>Отправить</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
