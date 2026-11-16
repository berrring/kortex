import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

const CURRENT_YEAR = 2026;

export function MarketingFooter() {
  const footerLinks = {
    product: [
      { label: 'Обзор платформы', href: '/' },
      { label: 'Возможности', href: '/features' },
      { label: 'Как это работает', href: '/how-it-works' },
      { label: 'Тарифы и планы', href: '/pricing' },
    ],
    platform: [
      { label: 'Главная дашборда', href: '/app' },
      { label: 'Редактор сценариев', href: '/app/workflows' },
      { label: 'Готовые шаблоны', href: '/app/templates' },
      { label: 'Каталог подключений', href: '/app/integrations' },
    ],
    support: [
      { label: 'Вопросы и ответы', href: '/faq' },
      { label: 'Связаться с нами', href: '/contact' },
      { label: 'Настройки области', href: '/app/settings' },
      { label: 'История действий', href: '/app/activity' },
    ],
  };

  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#090a0c] text-neutral-600 dark:text-neutral-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* О проекте */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-white">
                Kortex.ai
              </span>
            </Link>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              Наглядная платформа для организации бизнес-процессов. Помогает соединить рабочие программы и автоматизировать повторяющиеся дела.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ознакомительный демо-режим • Сохранение в браузере
              </span>
            </div>
          </div>

          {/* Разделы: Продукт */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-3">
              Продукт
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Разделы: Демо */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-3">
              Демо-платформа
            </h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Разделы: Помощь */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-3">
              Справка и связь
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя строчка копирайта */}
        <div className="mt-12 pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400 dark:text-neutral-500">
          <div>
            &copy; {CURRENT_YEAR} Kortex.ai. Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-500">Внешние трекеры и куки не используются</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
