import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ArrowRight, Zap, Filter, Send, Play } from 'lucide-react';

export function HowItWorksPage() {
  const walkthroughSteps = [
    {
      step: 'Шаг 1',
      title: 'Выбираете стартовое событие',
      description: 'Сценарий всегда начинается с понятного триггера: клиент заполнил форму на сайте, пришло письмо с определенной темой или наступило время утренней рассылки.',
      interfaceNote: 'В демо-режиме вы сразу видите входящие параметры и можете протестировать их заполнение.',
      badge: 'Работает в демо',
      icon: Zap,
    },
    {
      step: 'Шаг 2',
      title: 'Настраиваете правила и проверки',
      description: 'Добавляете условия: например, «проверить, что сумма заказа больше 5 000 рублей» или «отсеять спам без контактного телефона».',
      interfaceNote: 'Каждое условие направляет сценарий по верной ветке, исключая человеческие ошибки.',
      badge: 'Работает в демо',
      icon: Filter,
    },
    {
      step: 'Шаг 3',
      title: 'Указываете цепочку действий',
      description: 'Что нужно сделать дальше: написать сообщение в рабочий чат Telegram, создать новую строку в таблице или поставить задачу менеджеру.',
      interfaceNote: 'Шаги можно легко менять местами, дублировать или дополнять новыми действиями.',
      badge: 'Работает в демо',
      icon: Send,
    },
    {
      step: 'Шаг 4',
      title: 'Подключаете автоматический запуск',
      description: 'На следующем этапе развития Kortex вы сможете привязать свои аккаунты сервисов, и сценарии начнут работать круглосуточно без участия человека.',
      interfaceNote: 'В демо-версии реальная отправка сообщений отключена, чтобы не расходовать ваши ресурсы.',
      badge: 'Следующий этап',
      icon: Play,
    },
  ];

  return (
    <div className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Заголовок страницы */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="neutral" className="mb-3">
          Как устроен сервис
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Понятный путь к порядку в делах
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Простое объяснение того, как Kortex помогает описать и организовать любой рабочий процесс шаг за шагом.
        </p>
      </div>

      {/* Список шагов с наглядными карточками */}
      <div className="space-y-6">
        {walkthroughSteps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-xs flex flex-col md:flex-row gap-6 items-start justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-800 dark:text-neutral-200 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {item.step}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>

                  <div className="mt-3.5 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500 flex items-start gap-2">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">Подсказка:</span>
                    <span>{item.interfaceNote}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <Badge
                  variant={item.badge.includes('демо') ? 'success' : 'warning'}
                  size="sm"
                >
                  {item.badge}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Кнопка перехода к практике */}
      <div className="text-center pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          Попробуйте собрать свой первый сценарий
        </h3>
        <p className="mt-2 text-xs text-neutral-500 max-w-md mx-auto">
          Это займет не больше пары минут и не требует технических знаний.
        </p>
        <div className="mt-6">
          <Link to="/app/workflows">
            <Button variant="primary" size="md" icon={ArrowRight}>
              Открыть редактор сценариев
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
