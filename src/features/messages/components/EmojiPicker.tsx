import { useEffect, useRef } from 'react';

const EMOJI_LIST = [
  '👍', '❤️', '😂', '🔥', '🚀', '👏', '🎉', '✅',
  '🙌', '💯', '👀', '🤔', '😊', '🙏', '⚡', '💡',
  '🥳', '😎', '🤩', '👌', '✨', '💬', '📌', '🛠️',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Emoji picker"
      className="w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl dark:border-white/10 dark:bg-[#161A27]"
    >
      <p className="mb-2 px-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
        Quick emojis
      </p>
      <div className="grid grid-cols-6 gap-1">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            aria-label={`Select emoji ${emoji}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

