import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workflowRepository } from '../../services/workflowRepository';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle2,
  Zap,
  Filter,
  Send,
  Clock,
  Binary,
} from 'lucide-react';

export function WorkflowEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reloadWorkflows, showToast } = useAppData();

  const [workflow, setWorkflow] = useState(() => workflowRepository.getWorkflowById(id));
  const [steps, setSteps] = useState(() => {
    const data = workflowRepository.getWorkflowById(id);
    return data?.steps || [];
  });
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Окно добавления шага
  const [addStepModalOpen, setAddStepModalOpen] = useState(false);
  const [newStepType, setNewStepType] = useState('action');
  const [newStepName, setNewStepName] = useState('');

  // Проверка наличия сценария
  useEffect(() => {
    if (!workflow) {
      showToast('Сценарий не найден.', 'error');
      navigate('/workflows');
    }
  }, [workflow, navigate, showToast]);

  // Изменение выбранного шага
  const handleUpdateSelectedStep = (field, value) => {
    setSteps((prev) => {
      const updated = [...prev];
      if (!updated[selectedStepIndex]) return prev;
      updated[selectedStepIndex] = {
        ...updated[selectedStepIndex],
        [field]: value,
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateSelectedStepConfig = (key, value) => {
    setSteps((prev) => {
      const updated = [...prev];
      if (!updated[selectedStepIndex]) return prev;
      const currentConfig = updated[selectedStepIndex].config || {};
      updated[selectedStepIndex] = {
        ...updated[selectedStepIndex],
        config: {
          ...currentConfig,
          [key]: value,
        },
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Перемещение шага вверх/вниз
  const moveStep = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    setSteps((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
    setSelectedStepIndex(targetIndex);
    setHasUnsavedChanges(true);
  };

  // Удаление шага
  const deleteStep = (index) => {
    if (steps.length <= 1) {
      showToast('В сценарии должен оставаться хотя бы один шаг.', 'error');
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setSelectedStepIndex((prev) => Math.max(0, Math.min(prev, steps.length - 2)));
    setHasUnsavedChanges(true);
  };

  // Добавление нового шага с русскими понятными параметрами по умолчанию
  const handleAddStepSubmit = (e) => {
    e.preventDefault();
    const typeDefaults = {
      trigger: {
        name: newStepName || 'Получение заявки с сайта',
        description: 'Событие, которое запускает выполнение сценария',
        config: { event: 'входящая_форма', endpoint: '/webhook/v1' },
      },
      condition: {
        name: newStepName || 'Проверка суммы заказа',
        description: 'Проверка параметров для выбора следующего действия',
        config: { field: 'payload.amount', operator: 'greater_than', value: '5000' },
      },
      action: {
        name: newStepName || 'Отправка сообщения в Telegram',
        description: 'Действие: отправка уведомления или создание записи',
        config: { channel: '@sales_chat', format: 'текст' },
      },
      delay: {
        name: newStepName || 'Пауза перед отправкой',
        description: 'Ожидание заданного времени перед следующим шагом',
        config: { duration: '15', unit: 'минут' },
      },
      transform: {
        name: newStepName || 'Очистка телефона и почты',
        description: 'Приведение контактов к единому формату',
        config: { mode: 'очистка_текста', trimWhitespace: true },
      },
    };

    const chosen = typeDefaults[newStepType];
    const newStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: newStepType,
      name: chosen.name,
      description: chosen.description,
      config: chosen.config,
    };

    setSteps((prev) => [...prev, newStep]);
    setSelectedStepIndex(steps.length);
    setHasUnsavedChanges(true);
    setAddStepModalOpen(false);
    setNewStepName('');
    showToast('Шаг добавлен в сценарий', 'success');
  };

  // Сохранение в localStorage
  const handleSave = () => {
    if (!workflow) return;

    setIsSaving(true);
    workflowRepository.updateWorkflow(workflow.id, {
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      category: workflow.category,
      steps,
    });

    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      reloadWorkflows();
      showToast('Сценарий успешно сохранен локально', 'success');
    }, 250);
  };

  const getStepTypeInfo = (type) => {
    switch (type) {
      case 'trigger':
        return {
          label: 'Событие',
          explanation: 'То, с чего начинается сценарий.',
          icon: <Zap className="w-4 h-4 text-amber-500" />,
        };
      case 'condition':
        return {
          label: 'Условие',
          explanation: 'Проверка, от которой зависит следующий шаг.',
          icon: <Filter className="w-4 h-4 text-blue-500" />,
        };
      case 'action':
        return {
          label: 'Действие',
          explanation: 'Задача, которую нужно выполнить.',
          icon: <Send className="w-4 h-4 text-emerald-500" />,
        };
      case 'delay':
        return {
          label: 'Задержка',
          explanation: 'Пауза перед следующим шагом.',
          icon: <Clock className="w-4 h-4 text-purple-500" />,
        };
      case 'transform':
        return {
          label: 'Обработка данных',
          explanation: 'Подготовка информации в нужный вид.',
          icon: <Binary className="w-4 h-4 text-indigo-500" />,
        };
      default:
        return {
          label: 'Шаг',
          explanation: 'Действие сценария.',
          icon: <Sliders className="w-4 h-4 text-neutral-400" />,
        };
    }
  };

  if (!workflow) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400">
        Загрузка редактора...
      </div>
    );
  }

  const currentStep = steps[selectedStepIndex] || null;
  const currentStepInfo = currentStep ? getStepTypeInfo(currentStep.type) : null;

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* Шапка редактора */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <Link
            to="/workflows"
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Назад ко всем сценариям"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => {
                  setWorkflow({ ...workflow, name: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="font-bold text-base sm:text-lg bg-transparent text-neutral-900 dark:text-neutral-100 border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-500 focus:outline-none transition-colors px-0.5"
                title="Нажмите, чтобы изменить название"
              />
              <Badge
                variant={workflow.status === 'active' ? 'success' : 'neutral'}
                size="sm"
              >
                {workflow.status === 'active' ? 'Активен' : 'Черновик'}
              </Badge>
            </div>
            <input
              type="text"
              value={workflow.description || ''}
              placeholder="Нажмите, чтобы добавить краткое описание сценария..."
              onChange={(e) => {
                setWorkflow({ ...workflow, description: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="text-xs text-neutral-500 dark:text-neutral-400 bg-transparent border-b border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:border-neutral-400 focus:outline-none w-full max-w-md transition-colors mt-0.5"
            />
          </div>
        </div>

        {/* Управление сохранением */}
        <div className="flex items-center gap-2.5">
          {hasUnsavedChanges && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Есть несохраненные изменения
            </span>
          )}

          <Button
            variant={hasUnsavedChanges ? 'primary' : 'secondary'}
            size="sm"
            icon={Save}
            loading={isSaving}
            onClick={handleSave}
          >
            Сохранить сценарий
          </Button>
        </div>
      </div>

      {/* Понятная плашка о демо-режиме (как запрошено в ТЗ) */}
      <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-neutral-400 shrink-0" />
        <div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Режим проектирования:
          </span>{' '}
          Настоящее выполнение сценариев станет доступно после подключения сервера автоматизации.
        </div>
      </div>

      {/* Основная рабочая область редактора: Список шагов слева, настройки справа */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Левая колонка: Список шагов с возможностью менять порядок */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Порядок шагов ({steps.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setAddStepModalOpen(true)}
            >
              Добавить шаг
            </Button>
          </div>

          <div className="space-y-2">
            {steps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const typeInfo = getStepTypeInfo(step.type);

              return (
                <div
                  key={step.id || idx}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800/90 border-neutral-900 dark:border-neutral-100 shadow-2xs'
                      : 'bg-white dark:bg-[#111215] border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      {typeInfo.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {step.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xs mt-0.5">
                        {step.description || typeInfo.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Кнопки перемещения шага выше/ниже и удаления */}
                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveStep(idx, 'up')}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 rounded-md"
                      title="Переместить выше"
                      aria-label="Переместить шаг выше"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => moveStep(idx, 'down')}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 rounded-md"
                      title="Переместить ниже"
                      aria-label="Переместить шаг ниже"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStep(idx)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md"
                      title="Удалить шаг"
                      aria-label="Удалить этот шаг"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая колонка: Настройка выбранного шага */}
        <div className="lg:col-span-7">
          {currentStep ? (
            <div className="p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    {currentStepInfo?.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Шаг #{selectedStepIndex + 1}: {currentStepInfo?.label}
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      {currentStepInfo?.explanation}
                    </p>
                  </div>
                </div>

                <Badge variant="neutral" size="sm">
                  Шаг {selectedStepIndex + 1} из {steps.length}
                </Badge>
              </div>

              {/* Название и описание шага */}
              <div className="space-y-4">
                <Input
                  label="Название шага"
                  value={currentStep.name}
                  onChange={(e) => handleUpdateSelectedStep('name', e.target.value)}
                  placeholder="Например, Отправить сообщение в Telegram"
                />

                <Input
                  label="Пояснение для команды"
                  value={currentStep.description || ''}
                  onChange={(e) => handleUpdateSelectedStep('description', e.target.value)}
                  placeholder="Что именно делает этот шаг?"
                />
              </div>

              {/* Параметры шага в зависимости от типа */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
                  Параметры шага
                </h4>

                {currentStep.type === 'trigger' && (
                  <div className="space-y-3">
                    <Select
                      label="Тип входящего события"
                      value={currentStep.config?.event || 'входящая_форма'}
                      onChange={(e) => handleUpdateSelectedStepConfig('event', e.target.value)}
                      options={[
                        { value: 'входящая_форма', label: 'Форма обратной связи на сайте' },
                        { value: 'сообщение_бота', label: 'Новое сообщение боту в Telegram' },
                        { value: 'расписание', label: 'Запуск по расписанию' },
                        { value: 'входящие_данные', label: 'Сигнал из внешней системы (Вебхук)' },
                      ]}
                    />
                    <Input
                      label="Адрес точки приема (Endpoint)"
                      value={currentStep.config?.endpoint || '/webhook/v1'}
                      onChange={(e) => handleUpdateSelectedStepConfig('endpoint', e.target.value)}
                      hint="Адрес, на который сайт или касса будет отправлять информацию."
                    />
                  </div>
                )}

                {currentStep.type === 'condition' && (
                  <div className="space-y-3">
                    <Input
                      label="Какое поле проверяем?"
                      placeholder="Например, payload.amount (сумма заказа)"
                      value={currentStep.config?.field || ''}
                      onChange={(e) => handleUpdateSelectedStepConfig('field', e.target.value)}
                    />
                    <Select
                      label="Правило проверки"
                      value={currentStep.config?.operator || 'equals'}
                      onChange={(e) => handleUpdateSelectedStepConfig('operator', e.target.value)}
                      options={[
                        { value: 'equals', label: 'В точности равно (=)' },
                        { value: 'not_equals', label: 'Не равно (!=)' },
                        { value: 'greater_than', label: 'Больше чем (>)' },
                        { value: 'less_than', label: 'Меньше чем (<)' },
                        { value: 'contains', label: 'Содержит текст' },
                      ]}
                    />
                    <Input
                      label="Значение для сравнения"
                      placeholder="Например, 5000 или Москва"
                      value={currentStep.config?.value || ''}
                      onChange={(e) => handleUpdateSelectedStepConfig('value', e.target.value)}
                    />
                  </div>
                )}

                {currentStep.type === 'action' && (
                  <div className="space-y-3">
                    <Input
                      label="Куда отправить (канал или email)?"
                      placeholder="@sales_leads или manager@company.ru"
                      value={currentStep.config?.channel || ''}
                      onChange={(e) => handleUpdateSelectedStepConfig('channel', e.target.value)}
                    />
                    <Select
                      label="Формат сообщения"
                      value={currentStep.config?.format || 'текст'}
                      onChange={(e) => handleUpdateSelectedStepConfig('format', e.target.value)}
                      options={[
                        { value: 'текст', label: 'Текстовое сообщение с деталями заявки' },
                        { value: 'карточка', label: 'Карточка с кнопками быстрого ответа' },
                        { value: 'таблица', label: 'Запись новой строки в таблицу' },
                      ]}
                    />
                  </div>
                )}

                {currentStep.type === 'delay' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Сколько ждать?"
                      type="number"
                      value={currentStep.config?.duration || '10'}
                      onChange={(e) => handleUpdateSelectedStepConfig('duration', e.target.value)}
                    />
                    <Select
                      label="Единица времени"
                      value={currentStep.config?.unit || 'минут'}
                      onChange={(e) => handleUpdateSelectedStepConfig('unit', e.target.value)}
                      options={[
                        { value: 'секунд', label: 'Секунд' },
                        { value: 'минут', label: 'Минут' },
                        { value: 'часов', label: 'Часов' },
                        { value: 'дней', label: 'Дней' },
                      ]}
                    />
                  </div>
                )}

                {currentStep.type === 'transform' && (
                  <div className="space-y-3">
                    <Select
                      label="Способ обработки данных"
                      value={currentStep.config?.mode || 'очистка_текста'}
                      onChange={(e) => handleUpdateSelectedStepConfig('mode', e.target.value)}
                      options={[
                        { value: 'очистка_текста', label: 'Удалить лишние пробелы и знаки' },
                        { value: 'выделить_домен', label: 'Выделить адрес сайта из почты клиента' },
                        { value: 'перевод_в_число', label: 'Преобразовать текст цены в рубли' },
                      ]}
                    />
                  </div>
                )}
              </div>

              {/* Статус проверки шага */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Параметры шага заполнены корректно</span>
                </div>
                <span className="font-mono text-[11px]">
                  ID: {currentStep.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-neutral-400 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
              Выберите шаг слева для настройки параметров.
            </div>
          )}
        </div>
      </div>

      {/* Окно добавления шага */}
      <Modal
        isOpen={addStepModalOpen}
        onClose={() => setAddStepModalOpen(false)}
        title="Добавить шаг в сценарий"
        description="Выберите, какого типа шаг вы хотите вставить в цепочку."
      >
        <form onSubmit={handleAddStepSubmit} className="space-y-4">
          <Select
            label="Тип шага"
            value={newStepType}
            onChange={(e) => setNewStepType(e.target.value)}
            options={[
              { value: 'trigger', label: 'Событие — то, с чего начинается сценарий' },
              { value: 'condition', label: 'Условие — проверка, определяющая следующий шаг' },
              { value: 'action', label: 'Действие — задача, которую нужно выполнить' },
              { value: 'delay', label: 'Задержка — пауза перед следующим действием' },
              { value: 'transform', label: 'Обработка данных — приведение информации в порядок' },
            ]}
          />

          <Input
            label="Название шага"
            placeholder="Например, Оповещение менеджера в Telegram"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddStepModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Добавить в сценарий
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
