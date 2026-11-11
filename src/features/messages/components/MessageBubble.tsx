import { memo, useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  ClockAlert,
  Download,
  FileText,
  MessageSquareText,
  Pin,
} from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import type { Message, User } from '../../../types';
import { formatMessageTime } from '../../../utils/dateUtils';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isGroupChat: boolean;
  sender?: User;
  currentUserId: string;
  searchQuery: string;
  isActiveSearchMatch: boolean;
  threadReplyCount: number;
  onReply: (message: Message) => void;
  onOpenThread?: (message: Message) => void;
  onTogglePin: (messageId: string) => void;
  onCopy: (content: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onPreviewImage?: (url: string, name: string) => void;
}

function highlightSegment(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.split(regex).map((part, idx) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={idx} className="rounded bg-amber-300/85 px-0.5 text-slate-950">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function renderFormattedText(text: string, query: string, isOwn: boolean): ReactNode {
  // Tokenize **bold**, `code`, and https:// links safely without dangerouslySetInnerHTML
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s]+)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold">
          {highlightSegment(part.slice(2, -2), query)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className={`rounded px-1.5 py-0.5 font-mono text-[12px] ${
            isOwn
              ? 'bg-black/25 text-white'
              : 'bg-slate-100 text-violet-700 dark:bg-white/10 dark:text-violet-300'
          }`}
        >
          {highlightSegment(part.slice(1, -1), query)}
        </code>
      );
    }
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 ${
            isOwn ? 'text-white' : 'text-violet-600 dark:text-violet-400'
          }`}
        >
          {highlightSegment(part, query)}
        </a>
      );
    }
    return highlightSegment(part, query);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusIcon({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'sending':
      return <Clock className="h-3.5 w-3.5 text-white/75" aria-label="Sending" />;
    case 'queued':
      return (
        <ClockAlert
          className="h-3.5 w-3.5 text-amber-200"
          aria-label="Queued offline"
        />
      );
    case 'sent':
      return <Check className="h-3.5 w-3.5 text-white/85" aria-label="Sent" />;
    case 'delivered':
      return (
        <CheckCheck className="h-3.5 w-3.5 text-white/85" aria-label="Delivered" />
      );
    case 'read':
      return <CheckCheck className="h-3.5 w-3.5 text-sky-200" aria-label="Read" />;
    case 'failed':
      return (
        <AlertCircle className="h-3.5 w-3.5 text-rose-200" aria-label="Failed to send" />
      );
  }
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  isGroupChat,
  sender,
  currentUserId,
  searchQuery,
  isActiveSearchMatch,
  threadReplyCount,
  onReply,
  onOpenThread,
  onTogglePin,
  onCopy,
  onEdit,
  onDelete,
  onToggleReaction,
  onPreviewImage,
}: MessageBubbleProps) {
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    if (!contextMenuPos) return;
    const closeMenu = () => setContextMenuPos(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('click', closeMenu);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('keydown', handleKey);
    };
  }, [contextMenuPos]);

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={`group flex items-end gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && isGroupChat && (
        <div className="mb-1 hidden sm:block">
          <Avatar src={sender?.avatar} name={sender?.name ?? 'User'} size="sm" />
        </div>
      )}

      <div
        className={`flex max-w-[90%] min-w-0 flex-col sm:max-w-[74%] ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`flex max-w-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-1.5 ${
            isOwn
              ? 'items-end sm:flex-row-reverse'
              : 'items-start sm:flex-row'
          }`}
        >
          <div
            onContextMenu={handleContextMenu}
            style={
              isOwn ? { backgroundColor: 'var(--nx-accent-600)' } : undefined
            }
            className={`relative max-w-full min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs transition-shadow ${
              isOwn
                ? 'rounded-br-sm text-white'
                : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-[#161A27] dark:text-slate-100'
            } ${
              isActiveSearchMatch
                ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#0B0D14]'
                : ''
            }`}
          >
            {(!isOwn && isGroupChat && sender) || message.isPinned ? (
              <div className="mb-1 flex items-center justify-between gap-3">
                {!isOwn && isGroupChat && sender ? (
                  <p
                    className="text-xs font-semibold"
                    style={{ color: 'var(--nx-accent-500)' }}
                  >
                    {sender.name}
                  </p>
                ) : (
                  <span />
                )}
                {message.isPinned && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                      isOwn ? 'text-white/80' : 'text-violet-500'
                    }`}
                  >
                    <Pin className="h-2.5 w-2.5" />
                    Pinned
                  </span>
                )}
              </div>
            ) : null}

            {message.replyTo && (
              <div
                className={`mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-xs ${
                  isOwn
                    ? 'border-white/70 bg-black/20 text-white/95'
                    : 'border-violet-500 bg-slate-100 text-slate-600 dark:bg-[#0B0D14]/70 dark:text-slate-300'
                }`}
              >
                <p className="font-semibold">{message.replyTo.senderName}</p>
                <p className="line-clamp-2 opacity-90">{message.replyTo.content}</p>
              </div>
            )}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 space-y-2">
                {message.attachments.map((att) => {
                  const isImage = att.mimeType.startsWith('image/');
                  if (isImage && att.url) {
                    return (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => onPreviewImage?.(att.url, att.name)}
                        className="block overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
                      >
                        <img
                          src={att.url}
                          alt={att.name}
                          className="max-h-56 w-full object-cover transition-transform hover:scale-[1.02]"
                        />
                      </button>
                    );
                  }

                  return (
                    <a
                      key={att.id}
                      href={att.url || undefined}
                      download={att.name}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs transition-colors ${
                        isOwn
                          ? 'border-white/20 bg-black/20 text-white hover:bg-black/30'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-[#121520] dark:text-slate-200 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{att.name}</p>
                          <p className="text-[10px] opacity-75">
                            {formatBytes(att.size)}
                          </p>
                        </div>
                      </div>
                      <Download className="h-3.5 w-3.5 shrink-0 opacity-75" />
                    </a>
                  );
                })}
              </div>
            )}

            {message.content && (
              <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                {renderFormattedText(message.content, searchQuery, isOwn)}
              </p>
            )}

            <div
              className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                isOwn ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {message.status === 'queued' && (
                <span className="font-medium text-amber-200">Queued</span>
              )}
              {message.editedAt && <span className="italic">edited</span>}
              <span>{formatMessageTime(message.timestamp)}</span>
              {isOwn && <StatusIcon status={message.status} />}
            </div>
          </div>

          <div className="shrink-0">
            <MessageActions
              isOwn={isOwn}
              isPinned={message.isPinned}
              onReply={() => onReply(message)}
              onOpenThread={onOpenThread ? () => onOpenThread(message) : undefined}
              onPin={() => onTogglePin(message.id)}
              onCopy={() => onCopy(message.content)}
              onEdit={() => onEdit(message)}
              onDelete={() => onDelete(message)}
              onReact={(emoji) => onToggleReaction(message.id, emoji)}
            />
          </div>
        </div>

        {(message.reactions.length > 0 || (threadReplyCount > 0 && onOpenThread)) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1">
            {message.reactions.map((reaction) => {
              const hasReacted = reaction.userIds.includes(currentUserId);
              return (
                <button
                  key={reaction.emoji}
                  type="button"
                  onClick={() => onToggleReaction(message.id, reaction.emoji)}
                  aria-label={`Toggle ${reaction.emoji} reaction (${reaction.userIds.length})`}
                  aria-pressed={hasReacted}
                  style={
                    hasReacted
                      ? {
                          backgroundColor: 'var(--nx-accent-soft)',
                          borderColor: 'var(--nx-accent-border)',
                        }
                      : undefined
                  }
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                    hasReacted
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#161A27] dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-[11px] font-medium">
                    {reaction.userIds.length}
                  </span>
                </button>
              );
            })}

            {threadReplyCount > 0 && onOpenThread && (
              <button
                type="button"
                onClick={() => onOpenThread(message)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-violet-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#161A27] dark:text-violet-400 dark:hover:bg-white/10"
              >
                <MessageSquareText className="h-3 w-3" />
                <span>
                  {threadReplyCount} {threadReplyCount === 1 ? 'reply' : 'replies'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {contextMenuPos && (
        <div
          role="menu"
          aria-label="Message context menu"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-xs shadow-2xl dark:border-white/10 dark:bg-[#191D2B]"
        >
          <button
            type="button"
            onClick={() => onReply(message)}
            className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Reply
          </button>
          {onOpenThread && (
            <button
              type="button"
              onClick={() => onOpenThread(message)}
              className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Reply in thread
            </button>
          )}
          <button
            type="button"
            onClick={() => onTogglePin(message.id)}
            className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            {message.isPinned ? 'Unpin message' : 'Pin message'}
          </button>
          <button
            type="button"
            onClick={() => onCopy(message.content)}
            className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Copy text
          </button>
          {isOwn && (
            <>
              <button
                type="button"
                onClick={() => onEdit(message)}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Edit message
              </button>
              <button
                type="button"
                onClick={() => onDelete(message)}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/15"
              >
                Delete message
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});
