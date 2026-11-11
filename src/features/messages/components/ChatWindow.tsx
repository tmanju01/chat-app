import { useCallback, useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { EmptyState } from '../../../components/common/EmptyState';
import { DeleteConfirmationModal } from '../../../components/modals/DeleteConfirmationModal';
import { EditMessageModal } from '../../../components/modals/EditMessageModal';
import { useChatSimulation } from '../../../hooks/useChatSimulation';
import type { Message, MessageAttachment, MessageReplyPreview } from '../../../types';
import { selectSelectedConversation } from '../../conversations/conversationSelectors';
import { selectCurrentUserId, selectUsersById } from '../../groups/groupSelectors';
import { setInfoPanelOpen } from '../../groups/groupSlice';
import {
  selectActiveSearchMatchIndex,
  selectCurrentConversationMessages,
  selectCurrentMessagesError,
  selectCurrentMessagesStatus,
  selectCurrentTypingUsers,
  selectHasMoreOlderMessages,
  selectIsOffline,
  selectLoadingOlderMessages,
  selectMatchingMessageIds,
  selectMessageSearchQuery,
  selectOfflineQueueCount,
  selectPinnedMessages,
  selectReplyingToMessage,
  selectThreadRepliesMap,
} from '../messageSelectors';
import {
  deleteMessageThunk,
  editMessageThunk,
  fetchMessages,
  fetchOlderMessagesThunk,
  flushOfflineQueueThunk,
  sendMessageThunk,
  setActiveThreadMessageId,
  setOfflineMode,
  setReplyingTo,
  togglePinMessage,
  toggleReaction,
} from '../messageSlice';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { PinnedMessagesBar } from './PinnedMessagesBar';

interface ChatWindowProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onShowToast: (msg: string) => void;
}

export function ChatWindow({
  onOpenNewChat,
  onOpenNewGroup,
  onShowToast,
}: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectSelectedConversation);
  const messages = useAppSelector(selectCurrentConversationMessages);
  const threadRepliesMap = useAppSelector(selectThreadRepliesMap);
  const pinnedMessages = useAppSelector(selectPinnedMessages);
  const status = useAppSelector(selectCurrentMessagesStatus);
  const error = useAppSelector(selectCurrentMessagesError);
  const hasMoreOlder = useAppSelector(selectHasMoreOlderMessages);
  const loadingOlder = useAppSelector(selectLoadingOlderMessages);
  const replyingTo = useAppSelector(selectReplyingToMessage);
  const typingUserIds = useAppSelector(selectCurrentTypingUsers);
  const searchQuery = useAppSelector(selectMessageSearchQuery);
  const matchingIds = useAppSelector(selectMatchingMessageIds);
  const activeMatchIdx = useAppSelector(selectActiveSearchMatchIndex);
  const isOffline = useAppSelector(selectIsOffline);
  const offlineQueueCount = useAppSelector(selectOfflineQueueCount);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const usersById = useAppSelector(selectUsersById);

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [showPinnedBar, setShowPinnedBar] = useState(false);
  const [jumpTargetId, setJumpTargetId] = useState<string | null>(null);

  const { simulateOutgoingLifecycle } = useChatSimulation();

  useEffect(() => {
    if (conversation && status === 'idle' && messages.length === 0) {
      dispatch(fetchMessages(conversation.id));
    }
  }, [conversation, dispatch, messages.length, status]);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: MessageAttachment[]) => {
      if (!conversation) return;

      const replyPreview: MessageReplyPreview | null = replyingTo
        ? {
            messageId: replyingTo.id,
            senderId: replyingTo.senderId,
            senderName:
              replyingTo.senderId === currentUserId
                ? 'You'
                : usersById[replyingTo.senderId]?.name ?? 'Teammate',
            content: replyingTo.content || 'Attachment',
          }
        : null;

      try {
        const result = await dispatch(
          sendMessageThunk({
            conversationId: conversation.id,
            senderId: currentUserId,
            content,
            replyTo: replyPreview,
            attachments,
          })
        ).unwrap();

        if (result.queued) {
          onShowToast('Offline: message queued for delivery');
          return;
        }

        if (result.confirmed) {
          simulateOutgoingLifecycle(conversation, result.confirmed.id);
        }
      } catch {
        onShowToast('Failed to send message. Please try again.');
      }
    },
    [
      conversation,
      currentUserId,
      dispatch,
      onShowToast,
      replyingTo,
      simulateOutgoingLifecycle,
      usersById,
    ]
  );

  const handleReconnect = async () => {
    dispatch(setOfflineMode(false));
    const flushed = await dispatch(flushOfflineQueueThunk()).unwrap();
    if (flushed.length > 0) {
      onShowToast(`Sent ${flushed.length} queued message(s)`);
    }
  };

  const handleLoadOlder = useCallback(() => {
    if (!conversation) return;
    dispatch(
      fetchOlderMessagesThunk({
        conversationId: conversation.id,
        memberIds: conversation.members,
      })
    );
  }, [conversation, dispatch]);

  const handleCopy = useCallback(
    async (content: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(content);
        }
        onShowToast('Message copied to clipboard');
      } catch {
        onShowToast('Could not copy message');
      }
    },
    [onShowToast]
  );

  const handleReply = useCallback(
    (message: Message) => {
      dispatch(setReplyingTo(message));
    },
    [dispatch]
  );

  const handleOpenThread = useCallback(
    (message: Message) => {
      dispatch(setInfoPanelOpen(false));
      dispatch(setActiveThreadMessageId(message.id));
    },
    [dispatch]
  );

  const handleTogglePin = useCallback(
    (messageId: string) => {
      if (!conversation) return;
      dispatch(togglePinMessage({ conversationId: conversation.id, messageId }));
      onShowToast('Updated pinned messages');
    },
    [conversation, dispatch, onShowToast]
  );

  const handleToggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!conversation) return;
      dispatch(
        toggleReaction({
          conversationId: conversation.id,
          messageId,
          emoji,
          userId: currentUserId,
        })
      );
    },
    [conversation, currentUserId, dispatch]
  );

  const handleSaveEdit = async (newContent: string) => {
    if (!conversation || !editingMessage) return;
    await dispatch(
      editMessageThunk({
        conversationId: conversation.id,
        messageId: editingMessage.id,
        content: newContent,
      })
    ).unwrap();
    setEditingMessage(null);
    onShowToast('Message updated');
  };

  const handleConfirmDelete = async () => {
    if (!conversation || !deletingMessage) return;
    await dispatch(
      deleteMessageThunk({
        conversationId: conversation.id,
        messageId: deletingMessage.id,
      })
    ).unwrap();
    setDeletingMessage(null);
    onShowToast('Message deleted');
  };

  if (!conversation) {
    return (
      <EmptyState
        variant="no-selection"
        onNewChat={onOpenNewChat}
        onNewGroup={onOpenNewGroup}
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0B0D14]">
      <ChatHeader
        showPinnedBar={showPinnedBar}
        onTogglePinnedBar={() => setShowPinnedBar((prev) => !prev)}
      />

      {isOffline && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 border-b border-amber-300/60 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            <span>
              You are offline.{' '}
              {offlineQueueCount > 0
                ? `${offlineQueueCount} message(s) queued for delivery.`
                : 'New messages will queue until reconnected.'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleReconnect}
            className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
          >
            Go online
          </button>
        </div>
      )}

      {showPinnedBar && (
        <PinnedMessagesBar
          pinnedMessages={pinnedMessages}
          onJumpToMessage={(id) => setJumpTargetId(id)}
          onUnpinMessage={handleTogglePin}
          onClose={() => setShowPinnedBar(false)}
        />
      )}

      <MessageList
        conversationId={conversation.id}
        isGroupChat={conversation.type === 'group'}
        messages={messages}
        threadRepliesMap={threadRepliesMap}
        status={status}
        error={error}
        hasMoreOlder={hasMoreOlder}
        loadingOlder={loadingOlder}
        currentUserId={currentUserId}
        usersById={usersById}
        typingUserIds={typingUserIds}
        searchQuery={searchQuery}
        matchingMessageIds={matchingIds}
        activeSearchMatchIndex={activeMatchIdx}
        jumpTargetMessageId={jumpTargetId}
        onJumpHandled={() => setJumpTargetId(null)}
        onLoadOlder={handleLoadOlder}
        onRetry={() => dispatch(fetchMessages(conversation.id))}
        onReply={handleReply}
        onOpenThread={handleOpenThread}
        onTogglePin={handleTogglePin}
        onCopy={handleCopy}
        onEdit={setEditingMessage}
        onDelete={setDeletingMessage}
        onToggleReaction={handleToggleReaction}
      />

      <MessageInput
        replyingTo={replyingTo}
        usersById={usersById}
        currentUserId={currentUserId}
        onCancelReply={() => dispatch(setReplyingTo(null))}
        onSendMessage={handleSendMessage}
      />

      <EditMessageModal
        message={editingMessage}
        onClose={() => setEditingMessage(null)}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deletingMessage)}
        onClose={() => setDeletingMessage(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
