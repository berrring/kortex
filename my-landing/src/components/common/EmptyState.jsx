export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-neutral-300/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/20 ${className}`}
    >
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 mb-3.5 shadow-2xs">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h4>
      {description && (
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
