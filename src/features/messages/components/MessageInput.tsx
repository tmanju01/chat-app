import { useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { FileText, Paperclip, Send, Smile, X } from 'lucide-react';
import { generateId } from '../../../services/apiHelpers';
import type { Message, MessageAttachment, User } from '../../../types';
import { EmojiPicker } from './EmojiPicker';

interface MessageInputProps {
  replyingTo: Message | null;
  usersById: Record<string, User>;
  currentUserId: string;
  placeholder?: string;
  onCancelReply: () => void;
  onSendMessage: (content: string, attachments?: MessageAttachment[]) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageInput({
  replyingTo,
  usersById,
  currentUserId,
  placeholder = 'Write a message... (Enter to send, Shift+Enter for newline)',
  onCancelReply,
  onSendMessage,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const canSend = content.trim().length > 0 || attachments.length > 0;

  const handleSubmit = () => {
    if (!canSend) return;
    onSendMessage(content.trim(), attachments.length > 0 ? attachments : undefined);
    setContent('');
    setAttachments([]);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).slice(0, 4);
    const next: MessageAttachment[] = [];

    for (const file of files) {
      const url = await readFileAsDataUrl(file);
      next.push({
        id: generateId('att'),
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url,
      });
    }

    setAttachments((prev) => [...prev, ...next].slice(0, 4));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      await processFiles(files);
    }
  };

  const replySenderName = replyingTo
    ? replyingTo.senderId === currentUserId
      ? 'You'
      : usersById[replyingTo.senderId]?.name ?? 'Teammate'
    : '';

  return (
    <div className="relative border-t border-slate-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 dark:border-white/10 dark:bg-[#121520]">
      {replyingTo && (
        <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border-l-4 border-violet-500 bg-slate-50 px-3 py-2 dark:bg-[#191D2B]">
          <div className="min-w-0">
            <p
              className="text-xs font-semibold"
              style={{ color: 'var(--nx-accent-500)' }}
            >
              Replying to {replySenderName}
            </p>
            <p className="truncate text-xs text-slate-600 dark:text-slate-300">
              {replyingTo.content || 'Attachment'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div
          className="mb-2.5 flex flex-wrap gap-2"
          aria-label="Pending attachments"
        >
          {attachments.map((att) => {
            const isImage = att.mimeType.startsWith('image/');
            return (
              <div
                key={att.id}
                className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-7 dark:border-white/10 dark:bg-[#191D2B]"
              >
                {isImage && att.url ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="max-w-36 min-w-0">
                  <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                    {att.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(att.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((item) => item.id !== att.id))
                  }
                  aria-label={`Remove ${att.name}`}
                  className="absolute top-1 right-1 rounded-md p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-full left-3 z-30 mb-2 max-w-[calc(100vw-1.5rem)] sm:left-5">
          <EmojiPicker
            onSelect={(emoji) => {
              setContent((prev) => `${prev}${emoji}`);
              textareaRef.current?.focus();
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <div className="flex items-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          aria-label="Open emoji picker"
          aria-expanded={showEmojiPicker}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Smile className="h-5 w-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          aria-label="Attach files"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
          title="Attach image or file"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          aria-label="Message input"
          className="nx-scrollbar max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-[#0B0D14]"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          style={canSend ? { backgroundColor: 'var(--nx-accent-600)' } : undefined}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-slate-600"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
