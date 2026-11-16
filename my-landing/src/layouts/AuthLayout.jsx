import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Layers, Sun, Moon, ArrowLeft } from 'lucide-react';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#faf9f6] dark:bg-[#0c0d0f] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Верхняя панель */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>На главную страницу</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
          title="Сменить тему оформления"
          aria-label="Сменить тему оформления"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Центральная карточка формы */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Логотип */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                Kortex<span className="text-neutral-400 dark:text-neutral-500">.ai</span>
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-lg p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Простой подвал */}
      <footer className="p-4 sm:p-6 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        Kortex.ai • Демо-режим с локальным сохранением данных
      </footer>
    </div>
  );
}
