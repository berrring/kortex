import { useState } from 'react';
import { INTEGRATIONS, INTEGRATION_CATEGORIES } from '../../data/integrationsData';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Search, Filter, ShieldAlert } from 'lucide-react';

export function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [activeModalIntegration, setActiveModalIntegration] = useState(null);

  const filtered = INTEGRATIONS.filter((item) => {
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Подключения
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Здесь вы сможете подключать сервисы, которыми пользуетесь каждый день.
          </p>
        </div>
      </div>

      {/* Честное пояснение о безопасности */}
      <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-3 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-neutral-500 shrink-0" />
        <div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Безопасность данных:
          </span>{' '}
          Все интеграции сейчас находятся в статусе «Скоро появится». Чтобы не подвергать риску ваши данные, мы не запрашиваем пароли и API-ключи до запуска защищенного сервера.
        </div>
      </div>

      {/* Поиск и категории */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск сервиса (например, Telegram, Google)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111215] text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Filter className="w-3.5 h-3.5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111215] text-xs text-neutral-800 dark:text-neutral-200 py-2 px-3 focus:outline-none shadow-2xs"
          >
            {INTEGRATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Каталог сервисов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalIntegration(item)}
            className="p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  {item.category}
                </span>
                <Badge
                  variant={item.badge === 'Готово к подключению' ? 'info' : 'neutral'}
                  size="sm"
                >
                  {item.badge}
                </Badge>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 group-hover:underline">
                {item.name}
              </h3>

              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed min-h-[40px]">
                {item.description}
              </p>

              {item.simpleUse && (
                <div className="mt-3 p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 block mb-0.5">
                    Где пригодится:
                  </span>
                  {item.simpleUse}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>{item.authType}</span>
              <span className="text-neutral-600 dark:text-neutral-300 group-hover:underline">
                Подробнее &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Окно детальной информации о сервисе */}
      <Modal
        isOpen={Boolean(activeModalIntegration)}
        onClose={() => setActiveModalIntegration(null)}
        title={activeModalIntegration?.name}
        description={activeModalIntegration?.description}
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveModalIntegration(null)}
          >
            Закрыть
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
              Как это будет работать:
            </span>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {activeModalIntegration?.docSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                События для запуска
              </span>
              <ul className="space-y-1 text-neutral-500">
                {activeModalIntegration?.supportedEvents.map((ev) => (
                  <li key={ev}>• {ev}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                Возможные действия
              </span>
              <ul className="space-y-1 text-neutral-500">
                {activeModalIntegration?.supportedActions.map((ac) => (
                  <li key={ac}>• {ac}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-amber-900 dark:text-amber-300">
            <span className="font-semibold block mb-0.5">Статус подключения: В разработке</span>
            Прямое подключение аккаунта станет доступно в следующем релизе после интеграции защищенного сервера.
          </div>
        </div>
      </Modal>
    </div>
  );
}
