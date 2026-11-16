import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  MessagesSquare,
  FolderKanban,
  CheckSquare,
  Workflow,
  Cpu,
  Brain,
  History,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Mic,
  Moon,
  Sun,
  Search
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';
import { CommandPalette } from '../components/workspace/CommandPalette';
import { VoiceModal } from '../components/workspace/VoiceModal';

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState({ status: 'checking', mode: 'local' });
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Check backend server health periodically
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const h = await api.health();
      if (mounted) setServerHealth(h);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { to: '/', label: 'Ассистент', icon: MessageSquare, end: true },
    { to: '/chats', label: 'Чаты', icon: MessagesSquare },
    { to: '/projects', label: 'Проекты', icon: FolderKanban },
    { to: '/tasks', label: 'Задачи', icon: CheckSquare },
    { to: '/workflows', label: 'Сценарии', icon: Workflow },
    { to: '/connections', label: 'Подключения', icon: Cpu },
    { to: '/memory', label: 'Память', icon: Brain },
    { to: '/activity', label: 'История действий', icon: History },
    { to: '/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-white">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-neutral-800/80 bg-neutral-900/90 backdrop-blur-md transition-all duration-200 z-30 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand / Logo & Collapse Button */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shrink-0">
              K
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-neutral-100">Kortex</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 leading-none">Личное пространство</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition"
            title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Voice Mode & Search Triggers */}
        <div className="p-2 space-y-1">
          <button
            onClick={() => setVoiceOpen(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Голосовой режим Jarvis"
          >
            <Mic className="w-4 h-4 shrink-0 animate-pulse text-emerald-400" />
            {!collapsed && <span>Голосовой режим</span>}
          </button>

          <button
            onClick={() => setCmdOpen(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800/40 hover:bg-neutral-800/80 border border-neutral-800/60 transition ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Командная строка (Ctrl+K)"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Поиск и команды</span>}
            </div>
            {!collapsed && (
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60 font-mono">
                Ctrl+K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Server Status & User Profile Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/40 space-y-2">
          {/* Server status pill */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] ${
              serverHealth.status === 'ok'
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                : 'bg-amber-950/30 text-amber-400 border border-amber-900/30'
            } ${collapsed ? 'justify-center' : ''}`}
            title={serverHealth.status === 'ok' ? 'Сервер подключен (MCP онлайн)' : 'Автономный режим (Сервер не подключен)'}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                serverHealth.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {!collapsed && (
              <span className="truncate">
                {serverHealth.status === 'ok' ? 'MCP Сервер онлайн' : 'Автономный режим'}
              </span>
            )}
          </div>

          {/* Theme & User Profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-xs font-medium text-neutral-200 shrink-0">
                В
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-neutral-200 truncate">Владелец</span>
                  <span className="text-[10px] text-neutral-500 truncate">Kortex Workspace</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
                title={`Тема: ${theme === 'dark' ? 'Темная' : 'Светлая'}`}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-950">
        <Outlet />
      </main>

      {/* Global Modals */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onOpenVoice={() => setVoiceOpen(true)}
      />

      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSendMessage={(text) => {
          setVoiceOpen(false);
          // Broadcast custom event or navigate to assistant with message
          window.dispatchEvent(new CustomEvent('kortex:voice-message', { detail: { text } }));
        }}
      />
    </div>
  );
}
