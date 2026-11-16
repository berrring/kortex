import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CORE_CAPABILITIES,
  REAL_WORLD_USE_CASES,
  HOW_IT_WORKS_STEPS,
  FAQ_ITEMS,
} from '../../data/marketingData';
import { STARTER_TEMPLATES } from '../../data/starterTemplates';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Zap,
  Filter,
  Send,
  Binary,
} from 'lucide-react';

export function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('editor');

  return (
    <div className="space-y-24 sm:space-y-36 py-12 sm:py-20">
      {/* 1. Секция Hero: Понятный заголовок, четкие действия и интерактивный макет реального сценария */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Мягкий бейдж */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-6 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Платформа для наведения порядка в рабочих процессах</span>
        </div>

        {/* Главный заголовок */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 dark:text-white max-w-4xl mx-auto leading-[1.12]">
          Меньше рутины.{' '}
          <span className="text-neutral-500 dark:text-neutral-400 font-normal">
            Больше времени на важное.
          </span>
        </h1>

        {/* Подзаголовок на человеческом языке */}
        <p className="mt-6 text-base sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Создавайте понятные сценарии для повседневных задач. Настраивайте шаги, используйте готовые шаблоны и готовьтесь к автоматизации рабочих процессов.
        </p>

        {/* Кнопки призыва к действию */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/app" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto shadow-sm">
              Попробовать в демо-режиме
            </Button>
          </Link>
          <Link to="/how-it-works" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Посмотреть, как это устроено
            </Button>
          </Link>
        </div>

        <p className="mt-3.5 text-xs text-neutral-400 dark:text-neutral-500">
          Без регистрации и банковских карт. Работает прямо в вашем браузере.
        </p>

        {/* Реалистичный предпросмотр сценария (Не терминал!) */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden bg-white dark:bg-[#111215] text-left">
          {/* Верхняя панель окна */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-[#0e0f11]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="ml-2 font-mono text-xs text-neutral-500">
                kortex/сценарии/обработка-заявок
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">Демо-режим</Badge>
              <Badge variant="success" size="sm">5 шагов настроено</Badge>
            </div>
          </div>

          {/* Содержимое окна с наглядным отображением цепочки шагов */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Рабочий сценарий
                </div>
                <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 mt-0.5">
                  Прием заявки с сайта → Оповещение в Telegram → Запись в таблицу
                </h3>
              </div>
              <Link to="/app/workflows">
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  Открыть в редакторе
                </Button>
              </Link>
            </div>

            {/* Наглядные шаги со стрелками перехода */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
              <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1.5 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>1. Событие</span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Заявка с сайта
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Клиент заполнил форму
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1.5 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>2. Условие</span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Проверка заявки
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Номер телефона заполнен
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1.5 text-xs font-semibold">
                  <Send className="w-3.5 h-3.5" />
                  <span>3. Действие</span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Чат в Telegram
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Мгновенное уведомление
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1.5 text-xs font-semibold">
                  <Binary className="w-3.5 h-3.5" />
                  <span>4. Сохранение</span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Google Таблица
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Новая строка в учете
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Раздел: Простое объяснение сути Kortex (Сплит-композиция вместо скучных однотипных карточек) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="neutral">Простота и порядок</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white leading-tight">
              Никакого кода.{' '}
              <span className="text-neutral-500 dark:text-neutral-400 block font-normal">
                Только понятные шаги.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Вам не нужно быть программистом, чтобы настроить нужный процесс. Вы связываете программы так, как обычно объясняете задачу помощнику: «Когда клиент напишет сюда — сделай вот это».
            </p>
            <div className="pt-2">
              <Link to="/features">
                <Button variant="outline" size="md" icon={ArrowRight}>
                  Посмотреть все возможности
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CORE_CAPABILITIES.slice(0, 4).map((cap) => (
              <div
                key={cap.id}
                className="p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121316] flex flex-col justify-between shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">
                      {cap.tag}
                    </span>
                    <Badge variant="success" size="sm">
                      {cap.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Интерактивная витрина интерфейса (Редактор, шаблоны, сохранение в JSON) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40 p-6 sm:p-10">
          <div className="max-w-2xl mb-6">
            <h2 className="text-xl sm:text-3xl font-bold text-neutral-950 dark:text-white">
              Попробуйте интерфейс в деталях
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Переключайте вкладки, чтобы увидеть, как выглядит настройка шагов, выбор шаблона и экспорт данных.
            </p>
          </div>

          {/* Вкладки переключения */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-200/80 dark:border-neutral-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('editor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeShowcaseTab === 'editor'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Конструктор шагов
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('templates')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeShowcaseTab === 'templates'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Готовые шаблоны
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('export')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeShowcaseTab === 'export'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Резервная копия (JSON)
            </button>
          </div>

          {/* Интерактивный блок предпросмотра */}
          <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-[#111215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
            {activeShowcaseTab === 'editor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Наглядный порядок выполнения
                  </span>
                  <Link to="/app/workflows" className="text-neutral-600 dark:text-neutral-400 hover:underline">
                    Перейти в конструктор &rarr;
                  </Link>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">Новое сообщение с формы</div>
                        <div className="text-neutral-500 text-[11px]">Принимает имя, телефон и пожелания клиента</div>
                      </div>
                    </div>
                    <Badge variant="warning" size="sm">Событие</Badge>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">Проверка: срочный заказ?</div>
                        <div className="text-neutral-500 text-[11px]">Если заказ нужен сегодня, подключается старший дежурный</div>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">Условие</Badge>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'templates' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Библиотека проверенных решений
                  </span>
                  <Link to="/app/templates" className="text-neutral-600 dark:text-neutral-400 hover:underline">
                    Все шаблоны &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">Обработка новых заявок</div>
                    <p className="text-neutral-500 text-[11px] mt-1">Оповещение менеджеров и запись в таблицу за секунды.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">Знакомство с клиентом</div>
                    <p className="text-neutral-500 text-[11px] mt-1">Письма с инструкциями и напоминания менеджеру о звонке.</p>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'export' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Ваши данные всегда у вас под контролем
                  </span>
                  <Link to="/app/settings" className="text-neutral-600 dark:text-neutral-400 hover:underline">
                    Раздел настроек &rarr;
                  </Link>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Вы можете в один клик скачать все свои сценарии в виде файла и открыть на любом другом компьютере:
                </p>
                <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-950 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                  kortex-workflows-export-2026.json (Резервная копия готова к скачиванию)
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Раздел: Три реальных примера из жизни (Разнообразный сторителлинг вместо одинаковых карточек) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="neutral" className="mb-3">
            Реальные примеры
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Как Kortex помогает в ежедневной работе
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Три понятные ситуации, с которыми каждый день сталкивается любой предприниматель и руководитель.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {REAL_WORLD_USE_CASES.map((uc) => (
            <div
              key={uc.id}
              className="p-7 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] flex flex-col justify-between shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="neutral" size="sm">{uc.category}</Badge>
                  <span className="text-[11px] font-mono text-neutral-400">{uc.badge}</span>
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {uc.title}
                </h3>

                <div className="mt-4 space-y-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-300">
                    <span className="font-semibold block mb-0.5">Было:</span>
                    {uc.problem}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300">
                    <span className="font-semibold block mb-0.5">Стало с Kortex:</span>
                    {uc.solution}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{uc.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Пошаговый процесс: Как создать сценарий */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="neutral" className="mb-3">
            Простой процесс
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Четыре понятных шага
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            От первой идеи до готового и протестированного сценария.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] flex flex-col justify-between shadow-2xs"
            >
              <div>
                <span className="font-mono text-3xl font-extrabold text-neutral-200 dark:text-neutral-800 block mb-3">
                  {step.number}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Badge
                  variant={step.badge.includes('сейчас') ? 'success' : 'neutral'}
                  size="sm"
                >
                  {step.badge}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Предпросмотр популярных готовых шаблонов */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="neutral" className="mb-2">Готовые решения</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white">
              Начните с готового шаблона
            </h2>
          </div>
          <Link to="/app/templates">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              Вся библиотека шаблонов
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STARTER_TEMPLATES.slice(0, 3).map((tpl) => (
            <div
              key={tpl.id}
              className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] flex flex-col justify-between shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant="neutral" size="sm">{tpl.category}</Badge>
                  <span className="text-xs font-mono text-neutral-400">{tpl.steps.length} шага</span>
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {tpl.name}
                </h3>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed min-h-[40px]">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">Бесплатный шаблон</span>
                <Link to="/app/templates">
                  <Button variant="secondary" size="sm">
                    Открыть
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Частые вопросы и ответы */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <Badge variant="neutral" className="mb-2">
            Справка
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white">
            Часто задаваемые вопросы
          </h2>
          <p className="mt-2 text-xs text-neutral-500">
            Честные и прямые ответы о возможностях платформы.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.slice(0, 4).map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/faq"
            className="text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
          >
            Смотреть все вопросы и ответы &rarr;
          </Link>
        </div>
      </section>

      {/* 8. Финальный аккуратный призыв к действию */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-900 text-white dark:bg-[#121316] p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Готовы навести порядок в рабочих процессах?
          </h2>
          <p className="mt-3 text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
            Откройте локальный редактор и соберите свой первый сценарий за несколько минут без регистрации.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/app" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-white dark:text-neutral-900"
                icon={ArrowRight}
              >
                Открыть демо-кабинет
              </Button>
            </Link>
            <Link to="/templates" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-neutral-700 text-neutral-200 hover:bg-neutral-800"
              >
                Выбрать готовый шаблон
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
