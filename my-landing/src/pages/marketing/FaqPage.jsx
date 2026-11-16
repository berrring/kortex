import { useState } from 'react';
import { FAQ_ITEMS } from '../../data/marketingData';
import { Badge } from '../../components/common/Badge';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';

export function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [openIndex, setOpenIndex] = useState(0);

  const categories = [
    'Все',
    'О продукте и возможностях',
    'Безопасность и данные',
    'Тарифы и оплата',
    'Удобство и перенос',
  ];

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Заголовок страницы */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="neutral" className="mb-3">
          База знаний
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Ответы на частые вопросы
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Всё, что полезно знать о работе в демо-режиме, сохранении ваших данных и наших ближайших планах.
        </p>
      </div>

      {/* Поле поиска */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Поиск по вопросам (например, сохранение, оплата, безопасность)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111215] text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/20 transition-colors shadow-2xs"
        />
      </div>

      {/* Категории */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Список раскрывающихся вопросов */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8">
            <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              По вашему запросу ничего не найдено
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              Попробуйте изменить формулировку или выбрать категорию «Все».
            </p>
          </div>
        ) : (
          filteredItems.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#111215] overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
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
                    <div className="mb-2">
                      <Badge variant="neutral" size="sm">
                        {faq.category}
                      </Badge>
                    </div>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
