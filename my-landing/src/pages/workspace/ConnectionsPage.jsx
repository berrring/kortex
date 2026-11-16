import { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  Play,
  Terminal,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export function ConnectionsPage() {
  const [servers, setServers] = useState([]);
  const [tools, setTools] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [testArgs, setTestArgs] = useState('{}');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // New MCP Server form
  const [name, setName] = useState('');
  const [command, setCommand] = useState('npx');
  const [argsStr, setArgsStr] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sList = await api.getMcpServers();
    const tList = await api.getMcpTools();
    setServers(sList);
    setTools(tList);
  };

  const handleAddServer = async (e) => {
    e.preventDefault();
    if (!name.trim() || !command.trim()) return;

    const parsedArgs = argsStr.trim() ? argsStr.trim().split(/\s+/) : [];
    await api.addMcpServer({
      name: name.trim(),
      command: command.trim(),
      args: parsedArgs,
      description: description.trim()
    });

    setName('');
    setCommand('npx');
    setArgsStr('');
    setDescription('');
    setModalOpen(false);
    loadData();
  };

  const handleDeleteServer = async (id) => {
    if (confirm('Отключить и удалить этот MCP сервер?')) {
      await api.deleteMcpServer(id);
      loadData();
    }
  };

  const handleOpenTest = (tool) => {
    setSelectedTool(tool);
    setTestArgs('{}');
    setTestResult(null);
    setTestModalOpen(true);
  };

  const handleRunToolTest = async () => {
    if (!selectedTool) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(testArgs);
      } catch (e) {
        throw new Error('Некорректный JSON в параметрах');
      }
      const res = await api.callMcpTool(selectedTool.name, parsed);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const standardIntegrations = [
    {
      id: 'fs',
      name: 'Файловая система (Filesystem MCP)',
      desc: 'Предоставляет Kortex доступ к чтению и безопасной записи локальных файлов в указанной папке.',
      command: 'npx -y @modelcontextprotocol/server-filesystem C:\\Users\\user\\Desktop\\notes',
      status: 'Готово к подключению через Stdio'
    },
    {
      id: 'github',
      name: 'GitHub MCP Server',
      desc: 'Поиск репозиториев, чтение коммитов, веток, создание issues и pull requests через личный токен GitHub.',
      command: 'npx -y @modelcontextprotocol/server-github',
      status: 'Требуется GITHUB_PERSONAL_ACCESS_TOKEN'
    },
    {
      id: 'google',
      name: 'Google Workspace (Gmail & Calendar)',
      desc: 'Проверка непрочитанных писем, поиск по корреспонденции и чтение расписания в календаре.',
      command: 'node ./mcp-servers/google-workspace/index.js',
      status: 'Требуется Google Cloud Console OAuth Client'
    },
    {
      id: 'notion',
      name: 'Notion MCP Server',
      desc: 'Поиск страниц, создание заметок, управление таблицами и базами знаний в рабочей области Notion.',
      command: 'npx -y @modelcontextprotocol/server-notion',
      status: 'Требуется Notion Internal Integration Token'
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Подключения и MCP мост</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Управление серверами Model Context Protocol (MCP), обнаружение доступных инструментов и права доступа
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            title="Обновить статус"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить MCP сервер</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-6xl w-full mx-auto space-y-8">
        {/* Active MCP Servers Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Зарегистрированные серверы MCP ({servers.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {servers.map((server) => {
              const isCore = server.id === 'mcp-kortex-core';
              const serverTools = tools.filter((t) => t.serverId === server.id);

              return (
                <div
                  key={server.id}
                  className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xs text-neutral-100">{server.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              server.status === 'connected'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                : 'bg-rose-950 text-rose-400 border border-rose-900'
                            }`}
                          >
                            {server.status === 'connected' ? 'Подключен' : 'Ошибка'}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            тип: {server.type}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{server.description}</p>
                      </div>
                    </div>

                    {!isCore && (
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="self-end sm:self-center p-2 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
                        title="Удалить сервер"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Discovered Tools */}
                  <div className="mt-4">
                    <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Доступные инструменты ({serverTools.length || server.tools?.length || 0}):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(serverTools.length ? serverTools : server.tools || []).map((t) => (
                        <div
                          key={t.name}
                          className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/60 flex items-start justify-between gap-2"
                        >
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-semibold text-indigo-300 font-mono truncate">
                                {t.name}
                              </code>
                              {t.isSensitive ? (
                                <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-900/60 text-[9px]">
                                  Подтверждение
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 text-[9px]">
                                  Чтение
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                              {t.description || 'Описание отсутствует'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenTest(t)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs shrink-0 transition"
                            title="Протестировать инструмент"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Catalog & Setup Guide */}
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-neutral-200">
              Руководство по интеграциям через MCP
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kortex использует открытый стандарт Model Context Protocol. Вы можете подключить официальные MCP-серверы локально через Stdio без отправки ваших учетных данных на сторонние серверы.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardIntegrations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-xs text-neutral-200">{item.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-3">{item.desc}</p>
                </div>

                <div className="mt-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[10px] text-neutral-300 flex items-center justify-between">
                  <span className="truncate">{item.command}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.command);
                      alert('Команда скопирована в буфер обмена');
                    }}
                    className="text-neutral-500 hover:text-neutral-200 ml-2 shrink-0 text-[10px]"
                  >
                    Копировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Server Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-semibold text-sm">Добавить внешний MCP сервер</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddServer} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Название сервера *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="например: Локальные заметки"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Исполняемая команда (Command) *
                </label>
                <input
                  type="text"
                  required
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="npx, node или python"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Аргументы команды (через пробел)
                </label>
                <input
                  type="text"
                  value={argsStr}
                  onChange={(e) => setArgsStr(e.target.value)}
                  placeholder="-y @modelcontextprotocol/server-filesystem C:\Users\user\Desktop\notes"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Описание назначения
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Какие инструменты предоставляет этот сервер"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
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
                  Подключить сервер
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tool Test Modal */}
      {testModalOpen && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">Тест инструмента: {selectedTool.name}</h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Описание: {selectedTool.description}
                </label>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Параметры вызова (JSON)
                </label>
                <textarea
                  rows={4}
                  value={testArgs}
                  onChange={(e) => setTestArgs(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              {testResult && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Результат выполнения:
                  </label>
                  <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  onClick={handleRunToolTest}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold transition disabled:opacity-40"
                >
                  {isTesting ? 'Выполнение...' : 'Запустить тест'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
