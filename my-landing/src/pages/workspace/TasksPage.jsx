import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Search,
  X,
  FolderKanban
} from 'lucide-react';
import { api } from '../../services/api';

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed, high
  const [projectFilter, setProjectFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tList = await api.getTasks();
    const pList = await api.getProjects();
    setTasks(tList);
    setProjects(pList);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await api.createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      projectId: projectId || null
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setProjectId('');
    setModalOpen(false);
    loadData();
  };

  const handleToggle = async (task) => {
    await api.updateTask(task.id, { completed: !task.completed });
    loadData();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Удалить эту задачу?')) {
      await api.deleteTask(id);
      loadData();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (filter === 'high' && t.priority !== 'high') return false;
    if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const priorityColors = {
    high: 'text-rose-400 bg-rose-950/40 border-rose-900/60',
    medium: 'text-amber-400 bg-amber-950/40 border-amber-900/60',
    low: 'text-neutral-400 bg-neutral-800 border-neutral-700/60'
  };

  const priorityLabels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Задачи и планирование</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Личный список дел, синхронизированный с контекстом и инструментами AI-ассистента
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Новая задача</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 max-w-5xl w-full mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Все ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'active' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Активные ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'completed' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Завершенные ({tasks.filter((t) => t.completed).length})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'high' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Высокий приоритет
            </button>
          </div>

          {/* Project dropdown filter */}
          <div className="flex items-center gap-2">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-neutral-700"
            >
              <option value="all">Все проекты</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по задачам..."
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8">
            <CheckSquare className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-300">Задач не найдено</p>
            <p className="text-xs text-neutral-500 mt-1">
              Создайте задачу или попросите Kortex в чате: «Создай задачу на завтра»
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((t) => {
              const project = projects.find((p) => p.id === t.projectId);
              return (
                <div
                  key={t.id}
                  className="group p-3.5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggle(t)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 cursor-pointer shrink-0"
                    />

                    <div className="truncate">
                      <h3
                        className={`text-xs font-medium truncate ${
                          t.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                        }`}
                      >
                        {t.title}
                      </h3>
                      {t.description && (
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Project tag */}
                    {project && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700/60">
                        <FolderKanban className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{project.name}</span>
                      </span>
                    )}

                    {/* Priority badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        priorityColors[t.priority] || priorityColors.medium
                      }`}
                    >
                      {priorityLabels[t.priority] || 'Средний'}
                    </span>

                    {/* Due date */}
                    {t.dueDate && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        <span>{t.dueDate}</span>
                      </span>
                    )}

                    {/* Delete action */}
                    <button
                      onClick={(e) => handleDelete(t.id, e)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition rounded-lg"
                      title="Удалить задачу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-semibold text-sm">Новая задача</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Название задачи *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Что необходимо сделать?"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Подробности или чек-лист
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Дополнительные детали"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Приоритет
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Срок выполнения
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Привязать к проекту
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                >
                  <option value="">Без проекта (общие дела)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition"
                >
                  Создать задачу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
