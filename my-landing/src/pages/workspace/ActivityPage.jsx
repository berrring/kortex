import { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  CheckSquare,
  FolderKanban,
  Brain,
  Terminal,
  Search
} from 'lucide-react';
import { api } from '../../services/api';

export function ActivityPage() {
  const [activity, setActivity] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    const list = await api.getActivity();
    setActivity(list);
  };

  const handleClear = async () => {
    if (confirm('Очистить журнал истории действий?')) {
      await api.clearActivity();
      setActivity([]);
    }
  };

  const typeIcons = {
    task: CheckSquare,
    project: FolderKanban,
    memory: Brain,
    approval: ShieldAlert,
    mcp: Cpu,
    system: Terminal
  };

  const filtered = activity.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.action.toLowerCase().includes(q) ||
        (item.target || '').toLowerCase().includes(q) ||
        (item.details || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">История действий и аудит</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Прозрачный журнал всех вызовов инструментов, подтверждений операций и изменений данных
          </p>
        </div>

        {activity.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить журнал</span>
          </button>
        )}
      </div>

      <div className="p-6 max-w-5xl w-full mx-auto space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === 'all' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Все ({activity.length})
            </button>
            <button
              onClick={() => setFilterType('approval')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === 'approval' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Одобрения
            </button>
            <button
              onClick={() => setFilterType('task')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === 'task' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Задачи
            </button>
            <button
              onClick={() => setFilterType('memory')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === 'memory' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Память
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === 'system' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Система
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по событиям..."
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
            />
          </div>
        </div>

        {/* Activity Timeline List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8">
            <History className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-300">Журнал событий пуст</p>
            <p className="text-xs text-neutral-500 mt-1">
              Действия и вызовы инструментов MCP автоматически логируются здесь
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const Icon = typeIcons[item.type] || History;
              const isSuccess = item.status === 'success';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 transition flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-neutral-400" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-200">
                          {item.action}
                        </span>
                        {item.target && (
                          <code className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] text-neutral-400 font-mono">
                            {item.target}
                          </code>
                        )}
                      </div>

                      {item.details && (
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate leading-relaxed">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 text-right">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status || 'успешно'}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString('ru-RU')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
