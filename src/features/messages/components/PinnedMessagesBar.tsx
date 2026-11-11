import { Pin, X } from 'lucide-react';
import type { Message } from '../../../types';

interface PinnedMessagesBarProps {
  pinnedMessages: Message[];
  onJumpToMessage: (messageId: string) => void;
  onUnpinMessage: (messageId: string) => void;
  onClose: () => void;
}

export function PinnedMessagesBar({
  pinnedMessages,
  onJumpToMessage,
  onUnpinMessage,
  onClose,
}: PinnedMessagesBarProps) {
  if (pinnedMessages.length === 0) return null;

  return (
    <div className="border-b border-slate-200 bg-violet-50/70 px-4 py-2.5 dark:border-white/10 dark:bg-[#17182B]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
          <Pin className="h-3.5 w-3.5" />
          <span>Pinned Messages ({pinnedMessages.length})</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pinned messages bar"
          className="rounded p-0.5 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 space-y-1.5">
        {pinnedMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-violet-200/70 bg-white px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-[#121520]"
          >
            <button
              type="button"
              onClick={() => onJumpToMessage(msg.id)}
              className="min-w-0 flex-1 truncate text-left text-slate-700 hover:underline dark:text-slate-200"
            >
              {msg.content}
            </button>
            <button
              type="button"
              onClick={() => onUnpinMessage(msg.id)}
              aria-label="Unpin message"
              className="shrink-0 text-[11px] font-medium text-slate-400 hover:text-rose-500"
            >
              Unpin
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

