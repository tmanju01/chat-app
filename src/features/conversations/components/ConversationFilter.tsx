import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { ConversationFilter as FilterType } from '../../../types';
import {
  selectConversationFilter,
  selectTotalUnreadCount,
} from '../conversationSelectors';
import { setFilter } from '../conversationSlice';

const FILTER_OPTIONS: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'groups', label: 'Groups' },
];

export function ConversationFilter() {
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector(selectConversationFilter);
  const totalUnread = useAppSelector(selectTotalUnreadCount);

  return (
    <div
      className="flex items-center gap-1.5 px-3 pb-2.5"
      role="tablist"
      aria-label="Filter conversations"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => dispatch(setFilter(option.value))}
            style={
              isActive
                ? { backgroundColor: 'var(--nx-accent-600)' }
                : undefined
            }
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200'
            }`}
          >
            <span>{option.label}</span>
            {option.value === 'unread' && totalUnread > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                }`}
              >
                {totalUnread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
