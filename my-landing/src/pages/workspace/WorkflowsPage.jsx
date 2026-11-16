import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { workflowRepository } from '../../services/workflowRepository';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import {
  GitBranch,
  Search,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

export function WorkflowsPage() {
  const { workflows, reloadWorkflows, showToast } = useAppData();
  const navigate = useNavigate();

  // Состояние поиска, фильтров и сортировки
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('updated_desc');

  // Модальные окна
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Форма сценария
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Повседневные задачи',
    status: 'draft',
  });
  const [formError, setFormError] = useState('');

  // Список категорий
  const categories = ['Все', 'Повседневные задачи', 'Продажи и маркетинг', 'Работа с клиентами', 'Технические задачи', 'Таблицы и отчеты'];

  // Фильтрация и сортировка
  const filteredWorkflows = workflows
    .filter((w) => {
      const matchesCategory = selectedCategory === 'Все' || (w.category || 'Повседневные задачи') === selectedCategory;
      const matchesSearch =
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'updated_desc') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortBy === 'updated_asc') {
        return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'ru');
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name, 'ru');
      }
      return 0;
    });

  // Обработчики
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Пожалуйста, укажите название сценария.');
      return;
    }

    const created = workflowRepository.createWorkflow({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      status: formData.status,
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
    showToast(`Сценарий «${created.name}» создан`, 'success');
    setNewModalOpen(false);
    navigate(`/workflows/${created.id}`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedWorkflow) return;
    if (!formData.name.trim()) {
      setFormError('Пожалуйста, укажите название сценария.');
      return;
    }

    workflowRepository.updateWorkflow(selectedWorkflow.id, {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      status: formData.status,
    });

    reloadWorkflows();
    showToast(`Сценарий «${formData.name}» обновлен`, 'success');
    setEditModalOpen(false);
    setSelectedWorkflow(null);
  };

  const handleDuplicate = (wf, e) => {
    e.stopPropagation();
    const cloned = workflowRepository.duplicateWorkflow(wf.id);
    if (cloned) {
      reloadWorkflows();
      showToast(`Создана копия «${wf.name}»`, 'success');
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedWorkflow) return;
    workflowRepository.deleteWorkflow(selectedWorkflow.id);
    reloadWorkflows();
    showToast(`Сценарий «${selectedWorkflow.name}» удален`, 'info');
    setDeleteModalOpen(false);
    setSelectedWorkflow(null);
  };

  const openEditModal = (wf, e) => {
    e.stopPropagation();
    setSelectedWorkflow(wf);
    setFormData({
      name: wf.name,
      description: wf.description || '',
      category: wf.category || 'Повседневные задачи',
      status: wf.status || 'draft',
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const openDeleteModal = (wf, e) => {
    e.stopPropagation();
    setSelectedWorkflow(wf);
    setDeleteModalOpen(true);
  };

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Сценарии
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Создавайте, настраивайте и упорядочивайте ваши автоматические цепочки действий.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/workflows/templates')}
          >
            Шаблоны
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                category: 'Повседневные задачи',
                status: 'draft',
              });
              setFormError('');
              setNewModalOpen(true);
            }}
          >
            Создать сценарий
          </Button>
        </div>
      </div>

      {/* Панель поиска, фильтрации и сортировки */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111215] text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Фильтр по категории */}
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

          {/* Сортировка */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111215] text-xs text-neutral-800 dark:text-neutral-200 py-2 px-3 focus:outline-none shadow-2xs"
            >
              <option value="updated_desc">Сначала новые</option>
              <option value="updated_asc">Сначала старые</option>
              <option value="name_asc">По названию (А-Я)</option>
              <option value="name_desc">По названию (Я-А)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список сценариев */}
      {filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={searchTerm ? 'Ничего не найдено' : 'Сценариев пока нет'}
          description={
            searchTerm
              ? 'Попробуйте изменить поисковый запрос или выбрать категорию «Все».'
              : 'Создайте свой первый сценарий или воспользуйтесь готовыми шаблонами.'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  category: 'Повседневные задачи',
                  status: 'draft',
                });
                setFormError('');
                setNewModalOpen(true);
              }}
            >
              Создать первый сценарий
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-2xs overflow-hidden">
          {filteredWorkflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => navigate(`/workflows/${wf.id}`)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:underline truncate">
                    {wf.name}
                  </h3>
                  <Badge
                    variant={wf.status === 'active' ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {wf.status === 'active' ? 'Активен' : 'Черновик'}
                  </Badge>
                  <span className="text-[11px] font-mono text-neutral-400">
                    • {wf.category || 'Повседневные задачи'}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-2xl">
                  {wf.description || 'Описание не указано.'}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                  <span>{wf.steps ? wf.steps.length : 0} шага(ов)</span>
                  <span>•</span>
                  <span>Изменен: {new Date(wf.updatedAt || wf.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>

              {/* Кнопки управления */}
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => openEditModal(wf, e)}
                  title="Изменить название и категорию"
                  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDuplicate(wf, e)}
                  title="Создать копию сценария"
                  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => openDeleteModal(wf, e)}
                  title="Удалить сценарий"
                  className="p-2 rounded-lg text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/workflows/${wf.id}`)}
                  className="ml-1 text-xs"
                >
                  Редактор &rarr;
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Окно создания сценария */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Создать новый сценарий"
        description="Задайте понятное название и категорию для удобного поиска."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Название сценария"
            placeholder="Например, Оповещение об оплате заказа"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (formError) setFormError('');
            }}
            error={formError}
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

          <Select
            label="Статус"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'draft', label: 'Черновик (в процессе)' },
              { value: 'active', label: 'Активен' },
            ]}
          />

          <Textarea
            label="Описание"
            placeholder="Опишите, какую задачу решает этот сценарий..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Создать и открыть редактор
            </Button>
          </div>
        </form>
      </Modal>

      {/* Окно редактирования свойств */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Параметры сценария"
        description="Измените название, категорию или статус сценария."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Название сценария"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (formError) setFormError('');
            }}
            error={formError}
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

          <Select
            label="Статус"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'draft', label: 'Черновик' },
              { value: 'active', label: 'Активен' },
            ]}
          />

          <Textarea
            label="Описание"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Сохранить изменения
            </Button>
          </div>
        </form>
      </Modal>

      {/* Окно подтверждения удаления */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Удалить сценарий?"
        description="Это действие удалит сценарий из памяти браузера."
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Вы действительно хотите удалить сценарий <span className="font-semibold text-neutral-900 dark:text-neutral-100">«{selectedWorkflow?.name}»</span>?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
            >
              Удалить сценарий
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
