import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  MessageSquare,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  Check
} from 'lucide-react';
import { api } from '../../services/api';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const pList = await api.getProjects();
    const current = pList.find((p) => p.id === id);
    if (current) {
      setProject(current);
      setName(current.name);
      setDescription(current.description || '');
      setNotes(current.notes || '');
    }

    const tList = await api.getTasks();
    setTasks(tList.filter((t) => t.projectId === id));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await api.updateProject(id, {
      name: name.trim(),
      description: description.trim(),
      notes: notes.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await api.createTask({
      title: newTaskTitle.trim(),
      projectId: id,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setNewTaskTitle('');
    loadData();
  };

  const handleToggleTask = async (task) => {
    await api.updateTask(task.id, { completed: !task.completed });
    loadData();
  };

  const handleDeleteTask = async (taskId) => {
    await api.deleteTask(taskId);
    loadData();
  };

  if (!project) {
    return (
      <div className="p-8 text-center text-neutral-400 text-xs">
        Загрузка данных проекта...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Top Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-100">{project.name}</h1>
            <span className="text-[11px] text-neutral-500">Контекстная область проекта</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/?c=new`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Открыть чат с ассистентом</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Сохранено' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Project Details */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Название проекта
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-semibold text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Краткое описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Рабочие заметки и системный контекст для AI
            </label>
            <p className="text-[11px] text-neutral-500 mb-2">
              Этот текст автоматически подмешивается в контекст системного промпта Kortex при общении в рамках данного проекта.
            </p>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 font-mono leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Linked Tasks Section */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-200">
                Связанные задачи ({tasks.length})
              </h2>
            </div>
          </div>

          {/* Add quick task */}
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Добавить новую задачу в этот проект..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-white text-neutral-950 rounded-xl text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </form>

          {/* Task list */}
          <div className="space-y-1.5">
            {tasks.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4 text-center">
                Задач по этому проекту пока нет
              </p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-800/60 transition group"
                >
                  <label className="flex items-center gap-3 cursor-pointer select-none truncate">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTask(t)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                    />
                    <span
                      className={`text-xs truncate ${
                        t.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {t.title}
                    </span>
                  </label>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1 text-neutral-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
