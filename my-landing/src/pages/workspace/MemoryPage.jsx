import { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Search,
  X,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  FolderKanban
} from 'lucide-react';
import { api } from '../../services/api';

export function MemoryPage() {
  const [memories, setMemories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState({ memoryEnabled: true });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New memory form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('preferences');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const mList = await api.getMemories();
    const pList = await api.getProjects();
    const s = await api.getSettings();
    setMemories(mList);
    setProjects(pList);
    setSettings(s);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await api.createMemory({
      title: title.trim(),
      content: content.trim(),
      category,
      projectId: projectId || null
    });

    setTitle('');
    setContent('');
    setCategory('preferences');
    setProjectId('');
    setModalOpen(false);
    loadData();
  };

  const handleToggleGlobalMemory = async () => {
    const nextState = !settings.memoryEnabled;
    setSettings((prev) => ({ ...prev, memoryEnabled: nextState }));
    await api.saveSettings({ memoryEnabled: nextState });
  };

  const handleToggleItem = async (memory) => {
    await api.updateMemory(memory.id, { enabled: !memory.enabled });
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить эту запись из памяти?')) {
      await api.deleteMemory(id);
      loadData();
    }
  };

  const categories = [
    { id: 'all', label: 'Все категории' },
    { id: 'preferences', label: 'Предпочтения' },
    { id: 'context', label: 'Контекст' },
    { id: 'facts', label: 'Факты' },
    { id: 'goals', label: 'Цели' }
  ];

  const categoryLabels = {
    preferences: 'Предпочтения',
    context: 'Контекст',
    facts: 'Факты',
    goals: 'Цели'
  };

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Долговременная память ассистента</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Факты, пользовательские предпочтения и правила, которые Kortex помнит между диалогами
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Toggle */}
          <button
            onClick={handleToggleGlobalMemory}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
              settings.memoryEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <span>{settings.memoryEnabled ? 'Память активна' : 'Память выключена'}</span>
            {settings.memoryEnabled ? (
              <ToggleRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-neutral-500" />
            )}
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить воспоминание</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl w-full mx-auto space-y-6">
        {/* Privacy Note */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-400 leading-relaxed">
            Вся информация хранится локально в вашем файле данных на сервере и никогда не отправляется на сторонние платформы аналитики. Память передается только в качестве контекста системного промпта при ваших запросах к AI.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedCategory === c.id ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по памяти..."
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
            />
          </div>
        </div>

        {/* Memories List */}
        {filteredMemories.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8">
            <Brain className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-300">В памяти пока ничего не сохранено</p>
            <p className="text-xs text-neutral-500 mt-1">
              Вы можете добавить запись вручную или попросить Kortex в диалоге: «Запомни, что я...»
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMemories.map((m) => {
              const project = projects.find((p) => p.id === m.projectId);
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                    m.enabled
                      ? 'bg-neutral-900/80 border-neutral-800'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 font-medium">
                          {categoryLabels[m.category] || m.category}
                        </span>
                        {project && (
                          <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <FolderKanban className="w-3 h-3" />
                            <span>{project.name}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleItem(m)}
                          className="p-1 text-neutral-400 hover:text-neutral-200 transition"
                          title={m.enabled ? 'Отключить' : 'Включить'}
                        >
                          {m.enabled ? (
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-neutral-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 transition"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs font-semibold text-neutral-100 mb-1">{m.title}</h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">{m.content}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500 flex items-center justify-between">
                    <span>Сохранено: {new Date(m.createdAt).toLocaleDateString('ru-RU')}</span>
                    <span>{m.enabled ? 'Включено в контекст' : 'Не используется'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-semibold text-sm">Новая запись в памяти</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Заголовок (тема или правило) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="например: Формат ответов по коду"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Содержимое *
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Опишите факт, предпочтение или указание для ассистента"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Категория
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                  >
                    <option value="preferences">Предпочтения</option>
                    <option value="context">Контекст</option>
                    <option value="facts">Факты</option>
                    <option value="goals">Цели</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Привязать к проекту
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                  >
                    <option value="">Общая память</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
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
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
