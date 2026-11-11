import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, History, X } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import {
  ErrorState,
  MessageListSkeleton,
} from '../../../components/common/LoadingState';
import type { Message, User } from '../../../types';
import { groupMessagesByDate } from '../../../utils/messageUtils';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  conversationId: string;
  isGroupChat: boolean;
  messages: Message[];
  threadRepliesMap: Record<string, Message[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  currentUserId: string;
  usersById: Record<string, User>;
  typingUserIds: string[];
  searchQuery: string;
  matchingMessageIds: string[];
  activeSearchMatchIndex: number;
  jumpTargetMessageId: string | null;
  onJumpHandled: () => void;
  onLoadOlder: () => void;
  onRetry: () => void;
  onReply: (message: Message) => void;
  onOpenThread: (message: Message) => void;
  onTogglePin: (messageId: string) => void;
  onCopy: (content: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export function MessageList({
  conversationId,
  isGroupChat,
  messages,
  threadRepliesMap,
  status,
  error,
  hasMoreOlder,
  loadingOlder,
  currentUserId,
  usersById,
  typingUserIds,
  searchQuery,
  matchingMessageIds,
  activeSearchMatchIndex,
  jumpTargetMessageId,
  onJumpHandled,
  onLoadOlder,
  onRetry,
  onReply,
  onOpenThread,
  onTogglePin,
  onCopy,
  onEdit,
  onDelete,
  onToggleReaction,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isNearBottomRef = useRef(true);
  const prevConvIdRef = useRef<string | null>(null);
  const prevCountRef = useRef<number>(0);
  const prevFirstIdRef = useRef<string | null>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(
    null
  );

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  const activeMatchId = matchingMessageIds[activeSearchMatchIndex] ?? null;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomSentinelRef.current?.scrollIntoView({ behavior });
    setShowScrollButton(false);
  }, []);

  const triggerLoadOlder = useCallback(() => {
    if (!hasMoreOlder || loadingOlder) return;
    const container = scrollContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }
    onLoadOlder();
  }, [hasMoreOlder, loadingOlder, onLoadOlder]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    isNearBottomRef.current = nearBottom;
    setShowScrollButton(!nearBottom && messages.length > 0);

    if (container.scrollTop < 32 && hasMoreOlder && !loadingOlder) {
      triggerLoadOlder();
    }
  }, [hasMoreOlder, loadingOlder, messages.length, triggerLoadOlder]);

  // Preserve visual scroll position when older messages are prepended
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    const firstId = messages[0]?.id ?? null;
    const convSame = prevConvIdRef.current === conversationId;
    const prepended =
      convSame &&
      prevFirstIdRef.current !== null &&
      firstId !== null &&
      firstId !== prevFirstIdRef.current &&
      messages.length > prevCountRef.current;

    if (prepended && container && prevScrollHeightRef.current > 0) {
      const delta = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += delta;
      prevScrollHeightRef.current = 0;
    }

    prevFirstIdRef.current = firstId;
  }, [conversationId, messages]);

  useEffect(() => {
    const convChanged = prevConvIdRef.current !== conversationId;
    const countIncreased = messages.length > prevCountRef.current;
    const lastMessage = messages[messages.length - 1];
    const ownNewMessage = countIncreased && lastMessage?.senderId === currentUserId;
    const prepended =
      !convChanged &&
      countIncreased &&
      prevScrollHeightRef.current > 0;

    if (convChanged) {
      isNearBottomRef.current = true;
      scrollToBottom('auto');
    } else if (!prepended && (ownNewMessage || (countIncreased && isNearBottomRef.current))) {
      scrollToBottom('smooth');
    } else if (!prepended && countIncreased && !isNearBottomRef.current) {
      setShowScrollButton(true);
    }

    prevConvIdRef.current = conversationId;
    prevCountRef.current = messages.length;
  }, [conversationId, currentUserId, messages, scrollToBottom]);

  useEffect(() => {
    if (!activeMatchId) return;
    const node = messageRefs.current.get(activeMatchId);
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeMatchId]);

  useEffect(() => {
    if (!jumpTargetMessageId) return;
    const node = messageRefs.current.get(jumpTargetMessageId);
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    onJumpHandled();
  }, [jumpTargetMessageId, onJumpHandled]);

  useEffect(() => {
    if (!previewImage) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previewImage]);

  if (status === 'loading' && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B0D14]">
        <MessageListSkeleton />
      </div>
    );
  }

  if (status === 'failed' && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-[#0B0D14]">
        <ErrorState
          message={error ?? 'Could not load messages.'}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-[#0B0D14]">
        <EmptyState variant="no-messages" />
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-slate-50 dark:bg-[#0B0D14]">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="nx-scrollbar h-full overflow-y-auto px-3 py-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-4xl flex-col space-y-5">
          {hasMoreOlder && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={triggerLoadOlder}
                disabled={loadingOlder}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:bg-[#121520] dark:text-slate-300 dark:hover:bg-white/5"
              >
                <History className="h-3.5 w-3.5" />
                <span>
                  {loadingOlder ? 'Loading earlier messages...' : 'Load earlier messages'}
                </span>
              </button>
            </div>
          )}

          {groupedMessages.map((group) => (
            <section
              key={group.dateKey}
              aria-label={group.dateLabel}
              className="space-y-3"
            >
              <div className="flex justify-center">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-2xs dark:border-white/10 dark:bg-[#121520] dark:text-slate-400">
                  {group.dateLabel}
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((message) => (
                  <div
                    key={message.id}
                    ref={(el) => {
                      if (el) {
                        messageRefs.current.set(message.id, el);
                      } else {
                        messageRefs.current.delete(message.id);
                      }
                    }}
                  >
                    <MessageBubble
                      message={message}
                      isOwn={message.senderId === currentUserId}
                      isGroupChat={isGroupChat}
                      sender={usersById[message.senderId]}
                      currentUserId={currentUserId}
                      searchQuery={searchQuery}
                      isActiveSearchMatch={message.id === activeMatchId}
                      threadReplyCount={threadRepliesMap[message.id]?.length ?? 0}
                      onReply={onReply}
                      onOpenThread={onOpenThread}
                      onTogglePin={onTogglePin}
                      onCopy={onCopy}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleReaction={onToggleReaction}
                      onPreviewImage={(url, name) => setPreviewImage({ url, name })}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <TypingIndicator userIds={typingUserIds} />
          <div ref={bottomSentinelRef} className="h-1" />
        </div>
      </div>

      {showScrollButton && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          aria-label="Scroll to latest message"
          className="absolute right-5 bottom-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-50 dark:border-white/15 dark:bg-[#191D2B] dark:text-slate-200 dark:hover:bg-white/10"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          <span>Latest</span>
        </button>
      )}

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image attachment preview"
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs"
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image preview"
            className="absolute top-4 right-4 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={previewImage.url}
            alt={previewImage.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
