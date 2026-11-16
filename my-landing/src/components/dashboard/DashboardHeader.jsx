import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

export function DashboardHeader({ onOpenMobile, onOpenNewWorkflowModal }) {
  const location = useLocation();

  // Определение названия текущего раздела по URL
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const sectionName = pathSegments[1] || 'overview';

  const titleMap = {
    overview: 'Главная',
    workflows: 'Сценарии',
    templates: 'Шаблоны',
    integrations: 'Подключения',
    activity: 'История',
    settings: 'Настройки',
  };

  const currentTitle = titleMap[sectionName] || 'Редактор сценария';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white/85 dark:bg-[#0c0d0f]/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="flex items-center gap-3">
        {/* Кнопка открытия мобильного меню */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="p-1.5 rounded-lg md:hidden text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Открыть боковое меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Навигационная цепочка */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <Link
            to="/app"
            className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Кабинет
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Кнопка создания */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenNewWorkflowModal}
          className="shadow-2xs"
        >
          Создать сценарий
        </Button>
      </div>
    </header>
  );
}
