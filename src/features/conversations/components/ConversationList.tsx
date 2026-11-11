import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { EmptyState } from '../../../components/common/EmptyState';
import {
  ConversationListSkeleton,
  ErrorState,
} from '../../../components/common/LoadingState';
import { setInfoPanelOpen } from '../../groups/groupSlice';
import { selectCurrentUserId, selectUsersById } from '../../groups/groupSelectors';
import {
  setActiveThreadMessageId,
  setMessageSearchQuery,
  setReplyingTo,
} from '../../messages/messageSlice';
import {
  selectAllConversations,
  selectConversationsError,
  selectConversationsStatus,
  selectFilteredConversations,
  selectSelectedConversationId,
} from '../conversationSelectors';
import {
  fetchConversations,
  selectConversation,
  setFilter,
  setSearchQuery,
} from '../conversationSlice';
import { ConversationItem } from './ConversationItem';

export function ConversationList() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectFilteredConversations);
  const allConversations = useAppSelector(selectAllConversations);
  const selectedId = useAppSelector(selectSelectedConversationId);
  const status = useAppSelector(selectConversationsStatus);
  const error = useAppSelector(selectConversationsError);
  const usersById = useAppSelector(selectUsersById);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const typingByConv = useAppSelector((state) => state.messages.typingByConversationId);

  const handleSelect = useCallback(
    (id: string) => {
      dispatch(selectConversation(id));
      dispatch(setReplyingTo(null));
      dispatch(setActiveThreadMessageId(null));
      dispatch(setMessageSearchQuery(''));
      dispatch(setInfoPanelOpen(false));
    },
    [dispatch]
  );

  if (status === 'loading' && allConversations.length === 0) {
    return <ConversationListSkeleton />;
  }

  if (status === 'failed' && allConversations.length === 0) {
    return (
      <ErrorState
        message={error ?? 'Could not load inbox conversations.'}
        onRetry={() => dispatch(fetchConversations())}
      />
    );
  }

  if (allConversations.length === 0) {
    return <EmptyState variant="no-conversations" />;
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        variant="no-search-results"
        onResetSearch={() => {
          dispatch(setSearchQuery(''));
          dispatch(setFilter('all'));
        }}
      />
    );
  }

  return (
    <div
      className="nx-scrollbar flex-1 space-y-0.5 overflow-y-auto px-2 pb-3"
      role="list"
      aria-label="Conversations"
    >
      {conversations.map((conv) => {
        const peerId =
          conv.type === 'individual'
            ? conv.members.find((id) => id !== currentUserId)
            : undefined;
        const peerStatus = peerId ? usersById[peerId]?.status : undefined;
        const senderName = conv.lastMessage
          ? usersById[conv.lastMessage.senderId]?.name
          : undefined;
        const isTyping = (typingByConv[conv.id]?.length ?? 0) > 0;

        return (
          <div key={conv.id} role="listitem">
            <ConversationItem
              conversation={conv}
              isSelected={conv.id === selectedId}
              peerStatus={peerStatus}
              currentUserId={currentUserId}
              senderName={senderName}
              isTyping={isTyping}
              onSelect={handleSelect}
            />
          </div>
        );
      })}
    </div>
  );
}

