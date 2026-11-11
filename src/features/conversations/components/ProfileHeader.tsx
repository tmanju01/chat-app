import { MessageSquarePlus, Search, Users } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/common/Avatar';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { selectCurrentUser } from '../../groups/groupSelectors';
import {
  selectIsOffline,
  selectOfflineQueueCount,
} from '../../messages/messageSelectors';

interface ProfileHeaderProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenCommandPalette: () => void;
}

export function ProfileHeader({
  onOpenNewChat,
  onOpenNewGroup,
  onOpenCommandPalette,
}: ProfileHeaderProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const isOffline = useAppSelector(selectIsOffline);
  const queuedCount = useAppSelector(selectOfflineQueueCount);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          src={currentUser?.avatar}
          name={currentUser?.name ?? 'Alex Morgan'}
          status={isOffline ? 'offline' : currentUser?.status ?? 'online'}
          showStatus
          size="md"
        />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            {currentUser?.name ?? 'Alex Morgan'}
          </h1>
          <p
            className={`truncate text-xs ${
              isOffline
                ? 'font-medium text-amber-500'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isOffline
              ? `Offline${queuedCount > 0 ? ` • ${queuedCount} queued` : ''}`
              : 'Online'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Quick command palette"
          title="Quick jump (Ctrl+K)"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:h-9 sm:w-9 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onOpenNewChat}
          aria-label="New conversation"
          title="New conversation"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:h-9 sm:w-9 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onOpenNewGroup}
          aria-label="New group conversation"
          title="New group"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:h-9 sm:w-9 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Users className="h-4 w-4" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
