import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  GitBranch,
  Sliders,
  Layers,
  Search,
  Download,
  Boxes,
  Zap,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export function FeaturesPage() {
  const currentFeatures = [
    {
      icon: GitBranch,
      title: 'Управление сценариями',
      description: 'Создание, переименование, настройка, копирование и удаление сценариев. Все сохраняется в вашем браузере.',
      badge: 'Работает сейчас',
    },
    {
      icon: Sliders,
      title: 'Настройка шагов по цепочке',
      description: 'Добавляйте события, проверки условий, задержки по времени и действия. У каждого шага есть простое окно параметров.',
      badge: 'Работает сейчас',
    },
    {
      icon: Layers,
      title: 'Готовые шаблоны для старта',
      description: 'Берите за основу проверенные сценарии для приема заявок, знакомства с клиентами и напоминаний сотрудникам.',
      badge: 'Работает сейчас',
    },
    {
      icon: Search,
      title: 'Поиск и разделение по папкам',
      description: 'Быстрый поиск по названиям, сортировка по дате обновления и фильтр по направлениям работы компании.',
      badge: 'Работает сейчас',
    },
    {
      icon: Download,
      title: 'Экспорт и импорт в один клик',
      description: 'Скачивайте свои сценарии на компьютер в файл JSON и загружайте их на других устройствах без привязки к серверу.',
      badge: 'Работает сейчас',
    },
    {
      icon: ShieldCheck,
      title: 'Настоящая история действий',
      description: 'Точный журнал того, что вы делали в приложении: когда был создан сценарий, что изменилось и что удалено.',
      badge: 'Работает сейчас',
    },
  ];

  const upcomingFeatures = [
    {
      icon: Zap,
      title: 'Сервер круглосуточного запуска',
      description: 'Подключение надежного движка (n8n или фоновый рабочий сервер), который будет запускать сценарии без открытого браузера.',
      badge: 'Скоро появится',
    },
    {
      icon: Boxes,
      title: 'Прямые подключения к программам',
      description: 'Готовые интеграции с Telegram, Google Таблицами, почтой Gmail, Notion и CRM-системами без ручной настройки.',
      badge: 'Скоро появится',
    },
    {
      icon: Clock,
      title: 'Запуск по дням недели и часам',
      description: 'Сценарии смогут срабатывать автоматически по расписанию: например, каждое утро в 9:00 или по пятницам.',
      badge: 'Скоро появится',
    },
    {
      icon: Sparkles,
      title: 'Умная помощь в составлении шагов',
      description: 'Подсказки при заполнении параметров и автоматическая проверка на пропущенные контакты или ошибки.',
      badge: 'Скоро появится',
    },
  ];

  return (
    <div className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Заголовок страницы */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="neutral" className="mb-3">
          Возможности платформы
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Инструменты для понятной работы
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Познакомьтесь с функциями, которые уже работают в текущей демо-версии, и узнайте о возможностях, которые мы готовим к следующему обновлению.
        </p>
      </div>

      {/* Раздел: Доступно прямо сейчас */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Доступно в текущей демо-версии
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] flex flex-col justify-between shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="success" size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Раздел: Следующий этап */}
      <div className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            В разработке к следующему обновлению
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            (Автоматический запуск)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="warning" size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Плашка призыва */}
      <div className="p-8 rounded-3xl bg-neutral-100 dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Хотите протестировать редактор прямо сейчас?
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Создайте свой первый сценарий в локальном демо-кабинете без регистрации.
          </p>
        </div>
        <Link to="/app">
          <Button variant="primary" size="md" icon={ArrowRight}>
            Открыть демо-кабинет
          </Button>
        </Link>
      </div>
    </div>
  );
}
