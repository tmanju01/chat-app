import { memo } from 'react';
import { Check, CheckCheck, Layers, Star } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import type { Conversation, UserStatus } from '../../../types';
import { formatConversationTime } from '../../../utils/dateUtils';
import { truncatePreview } from '../../../utils/messageUtils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  peerStatus?: UserStatus;
  currentUserId: string;
  senderName?: string;
  isTyping: boolean;
  onSelect: (id: string) => void;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  isSelected,
  peerStatus = 'offline',
  currentUserId,
  senderName,
  isTyping,
  onSelect,
}: ConversationItemProps) {
  const isGroup = conversation.type === 'group';
  const last = conversation.lastMessage;
  const isOwnLast = last?.senderId === currentUserId;

  let previewText = 'No messages yet';
  if (isTyping) {
    previewText = 'Typing...';
  } else if (last) {
    const prefix =
      isGroup && senderName && !isOwnLast ? `${senderName.split(' ')[0]}: ` : '';
    previewText = `${prefix}${truncatePreview(last.content, 40)}`;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-current={isSelected ? 'true' : undefined}
      style={
        isSelected
          ? {
              backgroundColor: 'var(--nx-accent-soft)',
              borderColor: 'var(--nx-accent-border)',
            }
          : undefined
      }
      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? 'shadow-2xs'
          : 'border-transparent hover:bg-slate-100/80 dark:hover:bg-white/5'
      }`}
    >
      <Avatar
        src={conversation.avatar}
        name={conversation.name}
        status={peerStatus}
        showStatus={!isGroup}
        size="lg"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {isGroup && (
              <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            )}
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {conversation.name}
            </span>
            {conversation.isPriority && (
              <Star
                className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400"
                aria-label="Priority conversation"
              />
            )}
          </div>
          <span
            className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500"
            style={
              conversation.unreadCount > 0
                ? { color: 'var(--nx-accent-500)', fontWeight: 600 }
                : undefined
            }
          >
            {formatConversationTime(conversation.updatedAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {!isTyping && isOwnLast && last && (
              <span className="shrink-0">
                {last.status === 'read' ? (
                  <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                ) : last.status === 'delivered' ? (
                  <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <Check className="h-3.5 w-3.5 text-slate-400" />
                )}
              </span>
            )}
            <p
              className={`truncate text-xs ${
                isTyping
                  ? 'font-medium text-violet-500 dark:text-violet-400'
                  : conversation.unreadCount > 0
                  ? 'font-medium text-slate-800 dark:text-slate-200'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {previewText}
            </p>
          </div>

          {conversation.unreadCount > 0 && (
            <span
              aria-label={`${conversation.unreadCount} unread messages`}
              style={{ backgroundColor: 'var(--nx-accent-600)' }}
              className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white"
            >
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

