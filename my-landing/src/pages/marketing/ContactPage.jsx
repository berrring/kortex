import { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Input, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Copy, Check, Info, Mail, MapPin } from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Пожалуйста, укажите ваше имя.';
    if (!formData.email.trim()) errs.email = 'Укажите контактный email.';
    if (!formData.subject.trim()) errs.subject = 'Укажите тему обращения.';
    if (!formData.message.trim()) errs.message = 'Напишите текст сообщения.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCopyMessage = () => {
    if (!validate()) return;

    const formatted = `Имя: ${formData.name}\nEmail: ${formData.email}\nТема: ${formData.subject}\n\nСообщение:\n${formData.message}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Заголовок страницы */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="neutral" className="mb-3">
          Связь с создателями
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Напишите нам
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Есть предложение по шаблонам или вопрос о будущем запуске? Мы всегда открыты к диалогу.
        </p>
      </div>

      {/* Честное пояснение о работе формы */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-2xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-semibold block mb-0.5">
            Отправка писем с сервера пока отключена
          </span>
          Чтобы не создавать иллюзию отправленного письма без подключенного почтового сервера, заполните поля ниже и нажмите кнопку «Скопировать готовый текст». Вы сможете отправить его через привычную почту.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Форма обращения */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-xs space-y-4">
          <Input
            label="Ваше имя"
            placeholder="Иван Смирнов"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <Input
            label="Контактный email"
            type="email"
            placeholder="ivan@company.ru"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label="Тема сообщения"
            placeholder="Вопрос по интеграции с Telegram или предложение..."
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            error={errors.subject}
          />

          <Textarea
            label="Текст обращения"
            rows={5}
            placeholder="Опишите, какие процессы вы хотите автоматизировать или какой функции вам не хватает..."
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            error={errors.message}
          />

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={copied ? Check : Copy}
              onClick={handleCopyMessage}
              className="w-full sm:w-auto"
            >
              {copied ? 'Текст скопирован!' : 'Скопировать готовый текст'}
            </Button>
            <span className="text-[11px] text-neutral-400">
              Копирует оформленный текст для вставки в письмо
            </span>
          </div>
        </div>

        {/* Боковая карточка контактов */}
        <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#111215] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              Прямые контакты
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Для вопросов, предложений и сотрудничества:
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-neutral-500 block">Электронная почта:</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  contact@kortex.local
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-neutral-500 block">Разработка:</span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  Локальная рабочая область разработчика
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-500 leading-relaxed">
            Мы внимательно читаем все письма и учитываем пожелания при разработке следующих модулей.
          </div>
        </div>
      </div>
    </div>
  );
}
