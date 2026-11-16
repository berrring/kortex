import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { STARTER_TEMPLATES } from '../../data/starterTemplates';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import {
  GitBranch,
  Layers,
  ArrowRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Sparkles,
  History,
} from 'lucide-react';

export function OverviewPage() {
  const { workflows, activities, settings } = useAppData();
  const navigate = useNavigate();

  // Реальные показатели из локального хранилища
  const totalWorkflows = workflows.length;
  const totalSteps = workflows.reduce((sum, w) => sum + (w.steps ? w.steps.length : 0), 0);
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
  const draftWorkflows = workflows.filter((w) => w.status === 'draft').length;

  // Недавно измененные сценарии
  const recentWorkflows = [...workflows]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  // Простой чеклист для быстрого старта
  const checklist = [
    {
      id: 'has_workflows',
      title: 'Создать или открыть первый сценарий',
      done: totalWorkflows > 0,
      link: '/app/workflows',
    },
    {
      id: 'has_steps',
      title: 'Настроить последовательность шагов в сценарии',
      done: totalSteps > 0,
      link: totalWorkflows > 0 ? `/app/workflows/${workflows[0]?.id}` : '/app/workflows',
    },
    {
      id: 'explore_templates',
      title: 'Посмотреть библиотеку готовых шаблонов',
      done: false,
      link: '/app/templates',
    },
    {
      id: 'export_backup',
      title: 'Скачать резервную копию своих данных (JSON)',
      done: false,
      link: '/app/settings',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Приветствие и быстрые действия */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {settings.workspaceName || 'Рабочая область'}
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Здесь собраны ваши сценарии, готовые шаблоны и недавние действия.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/workflows">
            <Button variant="secondary" size="sm" icon={GitBranch}>
              Все сценарии
            </Button>
          </Link>
          <Link to="/app/templates">
            <Button variant="outline" size="sm" icon={BookOpen}>
              Выбрать шаблон
            </Button>
          </Link>
        </div>
      </div>

      {/* Понятные метрики (без технического мусора вроде localStorage v1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>Всего сценариев</span>
            <GitBranch className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {totalWorkflows}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {activeWorkflows} активных • {draftWorkflows} в черновиках
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>Настроенных шагов</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {totalSteps}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            События, условия и действия
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>Шаблонов доступно</span>
            <Sparkles className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {STARTER_TEMPLATES.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Готовые решения из коробки
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>Действий в истории</span>
            <History className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {activities.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Синхронизировано локально
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Недавно измененные сценарии */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              Недавние сценарии
            </h2>
            <Link
              to="/app/workflows"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Смотреть все ({totalWorkflows}) &rarr;
            </Link>
          </div>

          {recentWorkflows.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="Сценариев пока нет"
              description="Создайте свой первый сценарий с нуля или воспользуйтесь готовым шаблоном."
              action={
                <Link to="/app/templates">
                  <Button variant="primary" size="sm">
                    Выбрать готовый шаблон
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-2xs overflow-hidden">
              {recentWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => navigate(`/app/workflows/${wf.id}`)}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:underline">
                        {wf.name}
                      </span>
                      <Badge
                        variant={wf.status === 'active' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {wf.status === 'active' ? 'Активен' : 'Черновик'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate max-w-md">
                      {wf.description || 'Описание не указано.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 shrink-0 font-mono">
                    <span className="hidden sm:inline">
                      {wf.steps ? wf.steps.length : 0} шага(ов)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Правая колонка: Простые подсказки */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
            Первые шаги
          </h2>

          <div className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] space-y-3.5 shadow-2xs">
            {checklist.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-start gap-2.5 group transition-colors"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <div
                    className={`text-xs font-medium leading-snug ${
                      item.done
                        ? 'line-through text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-800 dark:text-neutral-200 group-hover:underline'
                    }`}
                  >
                    {item.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Информационная карточка */}
          <div className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              Как работает сохранение
            </div>
            <p className="text-[11px] leading-relaxed">
              Все сценарии сохраняются прямо в вашем браузере. Вы можете в любой момент скачать их файлом через раздел «Настройки» и перенести на другой компьютер.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
