import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { workflowRepository } from '../../services/workflowRepository';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Download,
  Upload,
  Trash2,
  Save,
  Moon,
  Sun,
} from 'lucide-react';

export function SettingsPage() {
  const { settings, updateSettings, reloadWorkflows, reloadActivities, showToast } = useAppData();
  const { theme, setTheme } = useTheme();

  const [profileName, setProfileName] = useState(settings.profileName || '');
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName || '');
  const [importJsonText, setImportJsonText] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({
      profileName,
      workspaceName,
    });
    showToast('Настройки рабочей области сохранены', 'success');
  };

  const handleExportJSON = () => {
    const jsonStr = workflowRepository.exportWorkflowsAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kortex-сценарии-резервная-копия-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Резервная копия сценариев скачана на компьютер', 'success');
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setImportError('');

    if (!importJsonText.trim()) {
      setImportError('Пожалуйста, вставьте текст JSON или выберите файл.');
      return;
    }

    const result = workflowRepository.importWorkflowsFromJSON(importJsonText);
    if (result.success) {
      reloadWorkflows();
      reloadActivities();
      showToast(`Успешно загружено ${result.count} сценариев из файла`, 'success');
      setImportModalOpen(false);
      setImportJsonText('');
    } else {
      setImportError(result.error || 'Ошибка при разборе файла JSON.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleClearAllConfirm = () => {
    workflowRepository.clearAllData();
    reloadWorkflows();
    reloadActivities();
    showToast('Все локальные сценарии и история сброшены', 'info');
    setClearDataModalOpen(false);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Шапка раздела */}
      <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Настройки
        </h1>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Управление параметрами рабочей области, внешним видом и резервным копированием данных.
        </p>
      </div>

      {/* Название профиля и рабочей области */}
      <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs space-y-5">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
          Профиль и рабочая область
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Имя пользователя или роль"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Например, Руководитель проектов"
          />

          <Input
            label="Название рабочей области (компании)"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Например, Мой интернет-магазин"
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Сохранить данные
            </Button>
          </div>
        </form>
      </div>

      {/* Оформление (Тема) */}
      <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
          Внешний вид
        </h2>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Тема оформления интерфейса
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                theme === 'light'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Светлая тема</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                theme === 'dark'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Темная тема</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 pt-1">
            Выбранная тема сохраняется в памяти вашего браузера.
          </p>
        </div>
      </div>

      {/* Резервное копирование и перенос */}
      <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
          Резервное копирование и перенос
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Все ваши сценарии хранятся локально в браузере. Вы можете в любой момент сохранить резервную копию в файл JSON, чтобы не потерять наработки или открыть их на другом компьютере.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportJSON}
          >
            Скачать копию сценариев (JSON)
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Upload}
            onClick={() => {
              setImportJsonText('');
              setImportError('');
              setImportModalOpen(true);
            }}
          >
            Загрузить из файла (JSON)
          </Button>
        </div>
      </div>

      {/* Опасная зона: Сброс данных */}
      <div className="p-6 sm:p-7 rounded-3xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-mono">
          Опасная зона
        </h2>
        <p className="text-xs text-red-700/90 dark:text-red-300 leading-relaxed">
          Очистить все созданные сценарии и журнал действий из этого браузера. Это действие нельзя отменить, если вы заранее не сохранили копию в файл.
        </p>

        <div>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setClearDataModalOpen(true)}
          >
            Сбросить все данные рабочей области
          </Button>
        </div>
      </div>

      {/* Модальное окно импорта */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Загрузка сценариев из файла"
        description="Выберите файл резервной копии .json или вставьте его содержимое."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Выбрать файл с компьютера
            </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-900 dark:file:text-white hover:file:cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Или вставьте текст JSON напрямую
            </label>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                if (importError) setImportError('');
              }}
              placeholder='{"schema": "kortex_workflow_export_v1", "workflows": [...] }'
              className="w-full rounded-2xl p-3 font-mono text-[11px] bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {importError && (
            <p className="text-xs text-red-600 dark:text-red-400">{importError}</p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Проверить и загрузить
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модальное окно подтверждения очистки */}
      <Modal
        isOpen={clearDataModalOpen}
        onClose={() => setClearDataModalOpen(false)}
        title="Сбросить все сценарии?"
        description="Вы уверены, что хотите удалить все сохраненные сценарии из памяти браузера?"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Это действие удалит все сценарии и журнал действий из этого браузера. Вы вернетесь к первоначальному чистому состоянию платформы.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDataModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAllConfirm}
            >
              Сбросить все данные
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
