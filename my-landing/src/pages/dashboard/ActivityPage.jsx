import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { activityRepository } from '../../services/activityRepository';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  History,
  Trash2,
  Clock,
  PlusCircle,
  Edit,
  Copy,
  Download,
  Filter,
} from 'lucide-react';

export function ActivityPage() {
  const { activities, reloadActivities, showToast } = useAppData();
  const [filterAction, setFilterAction] = useState('all');
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const filtered = activities.filter((act) => {
    if (filterAction === 'all') return true;
    return act.action === filterAction;
  });

  const handleClearConfirm = () => {
    activityRepository.clearActivities();
    reloadActivities();
    showToast('История действий очищена.', 'info');
    setClearModalOpen(false);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'created':
        return <Badge variant="success" size="sm">Создан</Badge>;
      case 'updated':
        return <Badge variant="neutral" size="sm">Изменен</Badge>;
      case 'duplicated':
        return <Badge variant="info" size="sm">Скопирован</Badge>;
      case 'deleted':
        return <Badge variant="warning" size="sm">Удален</Badge>;
      case 'imported':
        return <Badge variant="purple" size="sm">Загружен</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{action}</Badge>;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-neutral-500" />;
      case 'duplicated':
        return <Copy className="w-4 h-4 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'imported':
        return <Download className="w-4 h-4 text-purple-500" />;
      default:
        return <History className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            История действий
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Хронологический журнал создания и изменения сценариев в этой рабочей области.
          </p>
        </div>

        {activities.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={() => setClearModalOpen(true)}
          >
            Очистить журнал
          </Button>
        )}
      </div>

      {/* Фильтрация */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Filter className="w-3.5 h-3.5" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111215] text-xs text-neutral-800 dark:text-neutral-200 py-2 px-3 focus:outline-none shadow-2xs"
          >
            <option value="all">Все события ({activities.length})</option>
            <option value="created">Создание</option>
            <option value="updated">Изменение</option>
            <option value="duplicated">Копирование</option>
            <option value="deleted">Удаление</option>
            <option value="imported">Загрузка из файла</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-neutral-400">
          Показано {filtered.length} из {activities.length} записей
        </span>
      </div>

      {/* Список событий */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="История действий пуста"
          description={
            filterAction === 'all'
              ? 'Когда вы создаете или настраиваете сценарии, здесь сохраняются подробные отметки.'
              : 'Нет событий, соответствующих выбранному фильтру.'
          }
        />
      ) : (
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-2xs overflow-hidden">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="p-4 sm:p-5 flex items-start justify-between gap-4 text-xs hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getActionIcon(act.action)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {act.targetName}
                    </span>
                    {getActionBadge(act.action)}
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                    {act.details || 'Действие выполнено успешно.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px] shrink-0">
                <Clock className="w-3 h-3" />
                <span>{new Date(act.timestamp).toLocaleString('ru-RU')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Окно подтверждения очистки */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Очистить историю действий?"
        description="Вы уверены, что хотите удалить записи журнала?"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Будут удалены все {activities.length} записей из журнала этого браузера. Сами сценарии затронуты не будут.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearConfirm}
            >
              Очистить журнал
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
