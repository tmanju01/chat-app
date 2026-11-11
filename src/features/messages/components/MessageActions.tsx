import { useState } from 'react';
import {
  Copy,
  MessageSquareText,
  Pencil,
  Pin,
  Reply,
  SmilePlus,
  Trash2,
} from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '🚀', '👏'];

interface MessageActionsProps {
  isOwn: boolean;
  isPinned: boolean;
  onReply: () => void;
  onOpenThread?: () => void;
  onPin: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}

export function MessageActions({
  isOwn,
  isPinned,
  onReply,
  onOpenThread,
  onPin,
  onCopy,
  onEdit,
  onDelete,
  onReact,
}: MessageActionsProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div
      className={`relative flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white/95 p-0.5 shadow-sm backdrop-blur-xs transition-opacity dark:border-white/10 dark:bg-[#191D2B]/95 ${
        showReactions
          ? 'opacity-100'
          : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100'
      }`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowReactions((prev) => !prev)}
          aria-label="Add reaction"
          title="React"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>

        {showReactions && (
          <div
            role="menu"
            aria-label="Quick reactions"
            className={`absolute bottom-full z-20 mb-1.5 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-1.5 py-1 shadow-xl dark:border-white/10 dark:bg-[#191D2B] ${
              isOwn ? 'right-0' : 'left-0'
            }`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(emoji);
                  setShowReactions(false);
                }}
                aria-label={`React with ${emoji}`}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sm transition-transform hover:scale-125 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onReply}
        aria-label="Reply to message"
        title="Reply"
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Reply className="h-3.5 w-3.5" />
      </button>

      {onOpenThread && (
        <button
          type="button"
          onClick={onOpenThread}
          aria-label="Reply in thread"
          title="Open thread"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={onPin}
        aria-label={isPinned ? 'Unpin message' : 'Pin message'}
        title={isPinned ? 'Unpin' : 'Pin message'}
        className={`rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 ${
          isPinned
            ? 'text-violet-500'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Pin className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy message"
        title="Copy"
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      {isOwn && (
        <>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit message"
            title="Edit"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete message"
            title="Delete"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

