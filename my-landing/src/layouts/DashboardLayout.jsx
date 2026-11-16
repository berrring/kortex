import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Modal } from '../components/common/Modal';
import { Input, Textarea, Select } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ToastContainer } from '../components/common/ToastContainer';
import { useAppData } from '../hooks/useAppData';
import { workflowRepository } from '../services/workflowRepository';

export function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Повседневные задачи',
  });
  const [error, setError] = useState('');

  const { reloadWorkflows, showToast } = useAppData();
  const navigate = useNavigate();

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Пожалуйста, укажите название сценария.');
      return;
    }

    const newWf = workflowRepository.createWorkflow({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      steps: [
        {
          id: `step_${Date.now()}_1`,
          name: 'Получение данных (Событие)',
          type: 'trigger',
          description: 'Событие, с которого начинается выполнение этого сценария.',
          config: { event: 'входящие_данные', endpoint: '/webhook/v1' },
        },
      ],
    });

    reloadWorkflows();
    showToast(`Сценарий «${newWf.name}» создан`, 'success');
    setCreateModalOpen(false);
    setFormData({ name: '', description: '', category: 'Повседневные задачи' });
    setError('');

    // Сразу открываем редактор созданного сценария
    navigate(`/app/workflows/${newWf.id}`);
  };

  return (
    <div className="min-h-screen flex bg-[#faf9f6] dark:bg-[#0c0d0f] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Боковая панель */}
      <DashboardSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Основная рабочая область */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onOpenNewWorkflowModal={() => {
            setError('');
            setCreateModalOpen(true);
          }}
        />

        {/* Честная и дружелюбная плашка о демо-режиме (как запрошено в ТЗ) */}
        <div className="px-4 sm:px-6 py-2.5 bg-neutral-100/90 dark:bg-neutral-900/90 border-b border-neutral-200/80 dark:border-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <strong>Вы используете демо-версию.</strong> Созданные сценарии сохраняются в этом браузере. Настоящее выполнение автоматизаций пока недоступно.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-neutral-500">
            Без внешних серверов
          </span>
        </div>

        {/* Содержимое страницы */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Модальное окно быстрого создания сценария */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Создать новый сценарий"
        description="Задайте понятное название и направление для нового сценария."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Название сценария"
            placeholder="Например, Оповещение об оплате заказа"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (error) setError('');
            }}
            error={error}
            autoFocus
          />

          <Select
            label="Категория"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'Повседневные задачи', label: 'Повседневные задачи' },
              { value: 'Продажи и маркетинг', label: 'Продажи и маркетинг' },
              { value: 'Работа с клиентами', label: 'Работа с клиентами' },
              { value: 'Технические задачи', label: 'Технические задачи' },
              { value: 'Таблицы и отчеты', label: 'Таблицы и отчеты' },
            ]}
          />

          <Textarea
            label="Краткое описание (необязательно)"
            placeholder="Опишите, для чего создается сценарий и какую рутину он должен закрывать..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Создать и открыть редактор
            </Button>
          </div>
        </form>
      </Modal>

      {/* Всплывающие уведомления */}
      <ToastContainer />
    </div>
  );
}
