import { useAppSelector } from '../../../app/hooks';
import { selectUsersById } from '../../groups/groupSelectors';

interface TypingIndicatorProps {
  userIds: string[];
}

export function TypingIndicator({ userIds }: TypingIndicatorProps) {
  const usersById = useAppSelector(selectUsersById);

  if (userIds.length === 0) return null;

  const names = userIds
    .map((id) => usersById[id]?.name)
    .filter((name): name is string => Boolean(name));

  const label =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length > 1
      ? `${names.join(', ')} are typing...`
      : 'Someone is typing...';

  return (
    <div
      className="flex items-center gap-2 px-1 py-1.5 text-xs text-slate-500 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xs dark:border-white/10 dark:bg-[#161A27]">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.25s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.12s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
      </div>
      <span>{label}</span>
    </div>
  );
}

