import { MessageSquarePlus, SearchX, Sparkles, Users } from 'lucide-react';

type EmptyVariant =
  | 'no-selection'
  | 'no-messages'
  | 'no-conversations'
  | 'no-search-results';

interface EmptyStateProps {
  variant: EmptyVariant;
  onNewChat?: () => void;
  onNewGroup?: () => void;
  onResetSearch?: () => void;
}

export function EmptyState({
  variant,
  onNewChat,
  onNewGroup,
  onResetSearch,
}: EmptyStateProps) {
  if (variant === 'no-search-results') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          No matching conversations
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Try a different name or clear your active filter.
        </p>
        {onResetSearch && (
          <button
            type="button"
            onClick={onResetSearch}
            className="mt-4 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  if (variant === 'no-conversations') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: 'var(--nx-accent-soft)',
            color: 'var(--nx-accent-500)',
          }}
        >
          <MessageSquarePlus className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          No conversations yet
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Start a direct chat or create a group conversation.
        </p>
      </div>
    );
  }

  if (variant === 'no-messages') {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          No messages yet
        </p>
        <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
          Send a message below to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-[#0B0D14]">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#121520]">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: 'var(--nx-accent-600)' }}
        >
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Welcome to NEXORA
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Select a conversation from the sidebar or start a new individual or group chat.
        </p>
        {(onNewChat || onNewGroup) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {onNewChat && (
              <button
                type="button"
                onClick={onNewChat}
                style={{ backgroundColor: 'var(--nx-accent-600)' }}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <MessageSquarePlus className="h-4 w-4" />
                New chat
              </button>
            )}
            {onNewGroup && (
              <button
                type="button"
                onClick={onNewGroup}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-200 dark:hover:bg-white/10"
              >
                <Users className="h-4 w-4" />
                New group
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
