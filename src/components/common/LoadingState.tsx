import { AlertCircle, RefreshCw } from 'lucide-react';

export function ConversationListSkeleton() {
  return (
    <div className="space-y-1.5 p-2" aria-label="Loading conversations">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-white/5" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
              <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
            </div>
            <div className="h-3 w-44 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6" aria-label="Loading messages">
      <div className="flex justify-start">
        <div className="h-12 w-60 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />
      </div>
      <div className="flex justify-end">
        <div className="h-14 w-72 animate-pulse rounded-2xl bg-violet-200/50 dark:bg-violet-500/15" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-52 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />
      </div>
      <div className="flex justify-end">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-violet-200/50 dark:bg-violet-500/15" />
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-6 py-10 text-center"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <AlertCircle className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Unable to load data
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{ backgroundColor: 'var(--nx-accent-600)' }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

