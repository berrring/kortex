import { Link, useLocation } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  GitBranch,
  BookOpen,
  Boxes,
  History,
  Settings,
  Sun,
  Moon,
  ExternalLink,
  Layers,
  ChevronRight,
  Database,
} from 'lucide-react';

export function DashboardSidebar({ mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { workflows, settings } = useAppData();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Главная', href: '/app', icon: LayoutDashboard },
    { name: 'Сценарии', href: '/app/workflows', icon: GitBranch, count: workflows.length },
    { name: 'Шаблоны', href: '/app/templates', icon: BookOpen },
    { name: 'Подключения', href: '/app/integrations', icon: Boxes },
    { name: 'История', href: '/app/activity', icon: History },
    { name: 'Настройки', href: '/app/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#101114] border-r border-neutral-200/80 dark:border-neutral-800/80 select-none transition-colors">
      {/* Шапка рабочей области */}
      <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <Link to="/app" className="flex items-center justify-between group">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="font-semibold text-xs tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                {settings.workspaceName || 'Моя рабочая область'}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Демо-режим
              </span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
        </Link>
      </div>

      {/* Основное меню */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-200/70 text-neutral-950 dark:bg-neutral-800 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                <span>{item.name}</span>
              </div>
              {typeof item.count === 'number' && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                      : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Ненавязчивая плашка демо-режима */}
      <div className="p-3 mx-3 mb-2 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-[11px] text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200 mb-0.5">
          <Database className="w-3.5 h-3.5 text-neutral-500" />
          <span>Память браузера</span>
        </div>
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
          Все сценарии сохраняются локально на этом устройстве.
        </p>
      </div>

      {/* Подвал боковой панели */}
      <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Сменить тему оформления"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5" />
              <span>Светлая</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5" />
              <span>Темная</span>
            </>
          )}
        </button>

        <Link
          to="/"
          className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          title="Вернуться на главную страницу сайта"
        >
          <span>На сайт</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Десктопная панель */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Мобильная панель */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
