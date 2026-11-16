import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Trash2,
  CheckSquare,
  ArrowRight,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('indigo');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pList = await api.getProjects();
    const tList = await api.getTasks();
    setProjects(pList);
    setTasks(tList);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createProject({
      name: name.trim(),
      description: description.trim(),
      notes: notes.trim(),
      color
    });
    setName('');
    setDescription('');
    setNotes('');
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Удалить этот проект?')) {
      await api.deleteProject(id);
      loadData();
    }
  };

  const colors = [
    { id: 'indigo', bg: 'bg-indigo-500' },
    { id: 'emerald', bg: 'bg-emerald-500' },
    { id: 'amber', bg: 'bg-amber-500' },
    { id: 'rose', bg: 'bg-rose-500' },
    { id: 'sky', bg: 'bg-sky-500' }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Проекты и рабочие области</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Организуйте задачи, заметки и контекст, к которому Kortex может обращаться при решении задач
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Новый проект</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="p-6 max-w-6xl w-full mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8">
            <FolderKanban className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-300">Проектов пока нет</p>
            <p className="text-xs text-neutral-500 mt-1">
              Создайте проект, чтобы объединять связанные задачи, заметки и контекст для ассистента
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium inline-flex items-center gap-2 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать первый проект</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const completedTasks = projTasks.filter((t) => t.completed).length;

              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="group relative p-5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 transition flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full bg-${proj.color || 'indigo'}-500`} />
                        <h3 className="font-semibold text-sm text-neutral-100 group-hover:text-white transition">
                          {proj.name}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="p-1 text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition rounded"
                        title="Удалить проект"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                      {proj.description || 'Описание отсутствует'}
                    </p>

                    {proj.notes && (
                      <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/60 text-[11px] text-neutral-400 line-clamp-2 italic mb-4">
                        «{proj.notes}»
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-neutral-500" />
                      <span>
                        {completedTasks}/{projTasks.length} задач
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-neutral-400 group-hover:text-neutral-200 transition">
                      <span>Открыть</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-semibold text-sm">Новый проект</h3>
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
                  Название проекта *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="например: Разработка личного сайта"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Краткое описание
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Главная цель и границы проекта"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Заметки и контекст для ассистента
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Технический стек, ссылки, важные ориентиры"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Цветовой маркер
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-6 h-6 rounded-full ${c.bg} transition ${
                        color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
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
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
