export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'success' | 'warning' | 'info' | 'purple'
  size = 'md',
  className = '',
}) {
  const base = 'inline-flex items-center font-medium rounded-full border transition-colors';

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-1.5 font-semibold',
  };

  const variants = {
    neutral:
      'bg-neutral-100 text-neutral-700 border-neutral-200/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:border-neutral-700/60',
    success:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    warning:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    info:
      'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    purple:
      'bg-violet-50 text-violet-800 border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
