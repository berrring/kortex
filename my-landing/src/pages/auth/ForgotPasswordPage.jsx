import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Восстановление пароля
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Укажите адрес почты для получения ссылки на сброс пароля.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-300">
        <div className="flex items-center gap-1.5 font-semibold mb-1">
          <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>Справка о восстановлении</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Отправка писем с сервера пока отключена, так как Kortex работает в ознакомительном режиме. Вы можете перейти в демо-кабинет сразу.
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Форма проверена
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            В боевой версии ссылка на сброс пароля была бы отправлена на адрес <span className="font-mono">{email}</span>.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app')}
              icon={ArrowRight}
            >
              Перейти в демо-кабинет
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSimulatedSubmit} className="space-y-4">
          <Input
            label="Рабочая почта"
            type="email"
            placeholder="name@company.ru"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            variant="secondary"
            size="md"
            loading={loading}
            className="w-full justify-center"
          >
            Отправить ссылку (тест)
          </Button>

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center shadow-xs"
            icon={ArrowRight}
            onClick={() => navigate('/app')}
          >
            Продолжить в демо-режиме
          </Button>
        </form>
      )}

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
        Вспомнили пароль?{' '}
        <Link to="/login" className="text-neutral-900 dark:text-neutral-100 font-medium underline">
          Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
