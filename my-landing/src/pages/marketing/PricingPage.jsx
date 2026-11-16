import { Link } from 'react-router-dom';
import { PROVISIONAL_PRICING_PLANS } from '../../data/marketingData';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Check, Info, ArrowRight } from 'lucide-react';

export function PricingPage() {
  return (
    <div className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Заголовок страницы */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="neutral" className="mb-3">
          Планы и условия
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Понятные тарифы без скрытых платежей
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Текущая версия Kortex доступна полностью бесплатно для изучения и построения сценариев. Ниже приведены ориентировочные тарифы для будущего облачного сервиса.
        </p>
      </div>

      {/* Честное предупреждение о демо-режиме */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-2xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-semibold block mb-0.5">
            Оплата сейчас отключена
          </span>
          Мы намеренно заблокировали прием платежей на этапе открытого демо. Вы можете свободно использовать весь конструктор в браузере без ввода данных карты.
        </div>
      </div>

      {/* Сетка тарифов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {PROVISIONAL_PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`p-7 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all ${
              plan.isCurrent
                ? 'bg-white dark:bg-[#131418] border-neutral-900 dark:border-neutral-100 shadow-lg ring-1 ring-neutral-900 dark:ring-neutral-100'
                : 'bg-neutral-50/70 dark:bg-[#101114] border-neutral-200/80 dark:border-neutral-800 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  {plan.name}
                </h3>
                <Badge
                  variant={plan.isCurrent ? 'success' : 'neutral'}
                  size="sm"
                >
                  {plan.badge}
                </Badge>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 min-h-[36px] leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  {plan.price}
                </span>
                <span className="text-xs text-neutral-500">
                  / {plan.frequency}
                </span>
              </div>

              {/* Список возможностей тарифа */}
              <div className="mt-6 pt-6 border-t border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Что входит в тариф:
                </div>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопка действия */}
            <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60">
              {plan.disabled ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl text-xs font-medium bg-neutral-200/70 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed text-center"
                >
                  {plan.cta}
                </button>
              ) : (
                <Link to={plan.ctaLink} className="block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center shadow-xs"
                    icon={ArrowRight}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Пояснение внизу */}
      <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
        Есть вопросы по тарифам или индивидуальным требованиям? Вы всегда можете задать их нам через{' '}
        <Link to="/contact" className="text-neutral-900 dark:text-neutral-100 underline font-medium">
          форму обратной связи
        </Link>.
      </div>
    </div>
  );
}
