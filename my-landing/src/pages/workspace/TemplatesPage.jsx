import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STARTER_TEMPLATES } from '../../data/starterTemplates';
import { workflowRepository } from '../../services/workflowRepository';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Search,
  ArrowRight,
  Filter,
  Info,
} from 'lucide-react';

export function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { reloadWorkflows, showToast } = useAppData();
  const navigate = useNavigate();

  const categories = ['Все', 'Продажи и маркетинг', 'Работа с клиентами', 'Таблицы и отчеты', 'Технические задачи', 'Внутренние процессы'];

  const filteredTemplates = STARTER_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'Все' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    const created = workflowRepository.createFromTemplate(template);
    reloadWorkflows();
    showToast(`Сценарий «${template.name}» создан из шаблона`, 'success');
    navigate(`/workflows/${created.id}`);
  };

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Готовые шаблоны
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Проверенные сценарии для повседневных задач бизнеса. Выберите подходящий и настройте под себя.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/workflows')}
        >
          Вернуться к сценариям
        </Button>
      </div>

      {/* Поясняющая плашка */}
      <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-neutral-400 shrink-0" />
        <div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            О шаблонах:
          </span>{' '}
          Шаблоны задают готовую структуру шагов. Вы можете сразу отредактировать параметры под свои нужды.
        </div>
      </div>

      {/* Поиск и категории */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по шаблонам..."
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Сетка шаблонов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="neutral" size="sm">
                  {tpl.category}
                </Badge>
                <span className="font-mono text-xs text-neutral-400">
                  {tpl.steps.length} шага
                </span>
              </div>

              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {tpl.name}
              </h3>

              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[36px]">
                {tpl.description}
              </p>

              {/* Пример из реальной жизни */}
              {tpl.realWorldExample && (
                <div className="mt-3.5 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-[11px] text-neutral-500 leading-relaxed">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                    Пример из практики:
                  </span>
                  {tpl.realWorldExample}
                </div>
              )}

              {/* Теги */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Действия */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewTemplate(tpl)}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors underline cursor-pointer"
              >
                Посмотреть шаги ({tpl.steps.length})
              </button>

              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => handleUseTemplate(tpl)}
              >
                Использовать шаблон
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Окно детального просмотра шагов шаблона */}
      <Modal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name}
        description={previewTemplate?.description}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-neutral-400 font-medium">
              Категория: {previewTemplate?.category}
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => {
                if (previewTemplate) {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }
              }}
            >
              Создать сценарий
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
            Последовательность действий:
          </div>

          <div className="space-y-2.5">
            {previewTemplate?.steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {idx + 1}. {step.name}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {step.type === 'trigger'
                      ? 'Событие'
                      : step.type === 'condition'
                      ? 'Условие'
                      : step.type === 'action'
                      ? 'Действие'
                      : step.type === 'delay'
                      ? 'Задержка'
                      : 'Обработка'}
                  </Badge>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
