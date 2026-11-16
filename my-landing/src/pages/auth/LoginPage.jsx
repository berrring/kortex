import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Пожалуйста, введите адрес почты и пароль.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/app');
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Вход в Kortex.ai
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Войдите или сразу перейдите в демонстрационную версию.
        </p>
      </div>

      {/* Честное пояснение о демо-режиме */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300">
        <div className="flex items-center gap-1.5 font-semibold mb-1">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Авторизация на сервере отключена</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Настоящая регистрация будет запущена вместе с сервером. Нажмите кнопку ниже, чтобы сразу открыть полный кабинет.
        </p>
      </div>

      {/* Прямой переход в кабинет */}
      <Button
        variant="primary"
        size="md"
        className="w-full justify-center shadow-xs"
        icon={ArrowRight}
        onClick={() => navigate('/app')}
      >
        Продолжить в демо-режиме
      </Button>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
        <span className="flex-shrink mx-3 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
          Или протестируйте форму
        </span>
        <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
      </div>

      <form onSubmit={handleSimulatedSubmit} className="space-y-4">
        <Input
          label="Рабочая почта"
          type="email"
          placeholder="name@company.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Пароль
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-3 py-2 pr-10 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={loading}
          className="w-full justify-center"
        >
          Войти (демо-вход)
        </Button>
      </form>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
        Впервые здесь?{' '}
        <Link to="/signup" className="text-neutral-900 dark:text-neutral-100 font-medium underline">
          Создать демо-профиль
        </Link>
      </p>
    </div>
  );
}
