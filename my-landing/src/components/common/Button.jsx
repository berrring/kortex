export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 font-medium',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 font-medium',
  };

  const variants = {
    // Высококонтрастный первичный стиль (Linear / Vercel)
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-sm border border-transparent focus-visible:ring-neutral-900 dark:focus-visible:ring-white',
    // Спокойный вторичный стиль
    secondary:
      'bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 border border-neutral-200/80 dark:bg-neutral-800/90 dark:text-neutral-200 dark:hover:bg-neutral-700/80 dark:border-neutral-700/70 focus-visible:ring-neutral-400',
    // Аккуратный контурный стиль
    outline:
      'bg-transparent text-neutral-700 hover:bg-neutral-100/80 border border-neutral-300/90 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:border-neutral-700/80 focus-visible:ring-neutral-400',
    // Деструктивный для удалений
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500 border border-transparent',
    // Прозрачный
    ghost:
      'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60 focus-visible:ring-neutral-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
