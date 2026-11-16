import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  FolderKanban,
  CheckSquare,
  Workflow,
  Cpu,
  Brain,
  History,
  Settings,
  Plus,
  Mic,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function CommandPalette({ isOpen, onClose, onOpenVoice, onNewChat }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Main Navigation
    { id: 'nav-assistant', title: 'Ассистент (Главный экран)', icon: MessageSquare, category: 'Навигация', action: () => navigate('/') },
    { id: 'nav-chats', title: 'История диалогов', icon: MessageSquare, category: 'Навигация', action: () => navigate('/chats') },
    { id: 'nav-projects', title: 'Проекты', icon: FolderKanban, category: 'Навигация', action: () => navigate('/projects') },
    { id: 'nav-tasks', title: 'Задачи и планирование', icon: CheckSquare, category: 'Навигация', action: () => navigate('/tasks') },
    { id: 'nav-workflows', title: 'Сценарии автоматизации', icon: Workflow, category: 'Навигация', action: () => navigate('/workflows') },
    { id: 'nav-connections', title: 'Подключения и MCP мост', icon: Cpu, category: 'Навигация', action: () => navigate('/connections') },
    { id: 'nav-memory', title: 'Долговременная память', icon: Brain, category: 'Навигация', action: () => navigate('/memory') },
    { id: 'nav-activity', title: 'История действий и аудит', icon: History, category: 'Навигация', action: () => navigate('/activity') },
    { id: 'nav-settings', title: 'Настройки системы и AI', icon: Settings, category: 'Навигация', action: () => navigate('/settings') },

    // Quick Actions
    {
      id: 'act-new-chat',
      title: 'Новый диалог',
      icon: Plus,
      category: 'Действия',
      action: () => {
        onNewChat?.();
        navigate('/');
      }
    },
    {
      id: 'act-voice',
      title: 'Запустить голосовой режим (Jarvis)',
      icon: Mic,
      category: 'Действия',
      action: () => {
        onClose();
        onOpenVoice?.();
      }
    },
    {
      id: 'act-theme',
      title: `Переключить тему (${theme === 'dark' ? 'Светлая' : 'Темная'})`,
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Действия',
      action: () => toggleTheme()
    }
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск разделов, действий или команд... (Esc для выхода)"
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition text-left ${
                    isSelected
                      ? 'bg-neutral-800 text-neutral-100 font-medium'
                      : 'text-neutral-300 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-800/70 bg-neutral-950/40 text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <span>↑↓ Навигация</span>
            <span>•</span>
            <span>↵ Выбрать</span>
          </div>
          <div>Kortex Командная панель</div>
        </div>
      </div>
    </div>
  );
}
