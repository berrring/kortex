import { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Mic,
  Shield,
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  Save,
  Check,
  Eye,
  EyeOff,
  Volume2
} from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [aiProvider, setAiProvider] = useState('openai');
  const [aiBaseUrl, setAiBaseUrl] = useState('https://api.openai.com/v1');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [aiApiKey, setAiApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [ownerToken, setOwnerToken] = useState('');
  const [ownerTokenSet, setOwnerTokenSet] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoVoiceResponse, setAutoVoiceResponse] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await api.getSettings();
    setAiProvider(s.aiProvider || 'openai');
    setAiBaseUrl(s.aiBaseUrl || 'https://api.openai.com/v1');
    setAiModel(s.aiModel || 'gpt-4o-mini');
    setHasApiKey(Boolean(s.hasApiKey));
    setOwnerTokenSet(Boolean(s.ownerTokenSet));
    setVoiceSpeed(s.voiceSpeed || 1.0);
    setAutoVoiceResponse(Boolean(s.autoVoiceResponse));
    setMemoryEnabled(s.memoryEnabled !== false);
  };

  const handleProviderChange = (prov) => {
    setAiProvider(prov);
    if (prov === 'openai') {
      setAiBaseUrl('https://api.openai.com/v1');
      setAiModel('gpt-4o-mini');
    } else if (prov === 'openrouter') {
      setAiBaseUrl('https://openrouter.ai/api/v1');
      setAiModel('anthropic/claude-3.5-sonnet');
    } else if (prov === 'ollama') {
      setAiBaseUrl('http://localhost:11434/v1');
      setAiModel('llama3.2');
    } else if (prov === 'anthropic') {
      setAiBaseUrl('https://api.anthropic.com/v1');
      setAiModel('claude-3-5-haiku-20241022');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      aiProvider,
      aiBaseUrl,
      aiModel,
      voiceSpeed,
      autoVoiceResponse,
      memoryEnabled
    };
    if (aiApiKey) {
      payload.aiApiKey = aiApiKey;
    }
    if (ownerToken) {
      payload.ownerToken = ownerToken;
    }

    await api.saveSettings(payload);
    setAiApiKey('');
    setOwnerToken('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    loadSettings();
  };

  const handleExportData = async () => {
    const data = {
      projects: await api.getProjects(),
      tasks: await api.getTasks(),
      memories: await api.getMemories(),
      conversations: await api.getConversations(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kortex-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.projects) localStorage.setItem('kortex_projects', JSON.stringify(parsed.projects));
      if (parsed.tasks) localStorage.setItem('kortex_tasks', JSON.stringify(parsed.tasks));
      if (parsed.memories) localStorage.setItem('kortex_memories', JSON.stringify(parsed.memories));
      if (parsed.conversations) localStorage.setItem('kortex_conversations', JSON.stringify(parsed.conversations));
      alert('Данные успешно импортированы!');
      setImportModal(false);
      window.location.reload();
    } catch (err) {
      alert('Ошибка при импорте JSON: ' + err.message);
    }
  };

  const testSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('Проверка голосового синтеза Kortex. Система работает исправно.');
      u.lang = 'ru-RU';
      u.rate = voiceSpeed;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Настройки рабочей области</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Конфигурация языковой модели, голосового помощника, безопасности и резервных копий
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Сохранено!' : 'Сохранить изменения'}</span>
        </button>
      </div>

      <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Section 1: AI Provider */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-neutral-200">AI-провайдер и языковая модель</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Выберите провайдера
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'openai', label: 'OpenAI (GPT-4o)' },
                  { id: 'openrouter', label: 'OpenRouter' },
                  { id: 'ollama', label: 'Ollama (Локально)' },
                  { id: 'anthropic', label: 'Anthropic Claude' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                      aiProvider === p.id
                        ? 'bg-neutral-100 text-neutral-950 border-neutral-100 font-semibold'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Базовый URL (API Base URL)
                </label>
                <input
                  type="text"
                  value={aiBaseUrl}
                  onChange={(e) => setAiBaseUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Название модели (Model ID)
                </label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">
                  API-ключ (сохраняется строго на сервере)
                </label>
                <span className="text-[11px] text-neutral-500">
                  {hasApiKey ? 'Ключ уже установлен на сервере' : 'Ключ не задан'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={hasApiKey ? '•••••••••••••••••••••••• (введите новый для замены)' : 'sk-...'}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Ключи никогда не попадают в код браузера или Git и сохраняются только в защищенной конфигурации сервера.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Voice Preferences */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
            <Mic className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Голосовой ассистент (Jarvis)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">
                  Скорость синтеза речи ({voiceSpeed}x)
                </label>
                <button
                  type="button"
                  onClick={testSpeech}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Проверить голос</span>
                </button>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-neutral-100"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div>
                <span className="text-xs font-medium text-neutral-200 block">
                  Озвучивать ответы голосом
                </span>
                <span className="text-[11px] text-neutral-500">
                  Автоматически проговаривать ответы ассистента в голосовом режиме
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoVoiceResponse}
                onChange={(e) => setAutoVoiceResponse(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Single-Owner Security */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Безопасность владельца</h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-neutral-300">
                Мастер-токен владельца (пароль доступа)
              </label>
              <span className="text-[11px] text-neutral-500">
                {ownerTokenSet ? 'Токен активен' : 'Режим разработки (без пароля)'}
              </span>
            </div>
            <input
              type="password"
              value={ownerToken}
              onChange={(e) => setOwnerToken(e.target.value)}
              placeholder={ownerTokenSet ? '••••••••••••••••' : 'Оставьте пустым для локального режима'}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-600"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              При установке мастер-токена сервер будет требовать его для всех API-запросов и выполнения команд инструментов MCP.
            </p>
          </div>
        </div>

        {/* Section 4: Data Management */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
            <Download className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Управление данными и резервные копии</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт всех данных (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => setImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Импорт из JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100">
            <h3 className="font-semibold text-sm mb-3">Импорт данных Kortex (JSON)</h3>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Вставьте содержимое резервной копии JSON..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-neutral-600 resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleImportData}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-semibold disabled:opacity-40"
              >
                Импортировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
