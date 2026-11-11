import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { Message } from '../../types';
import { selectSelectedConversationId } from '../conversations/conversationSelectors';

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_TYPING_USERS: string[] = [];
const EMPTY_MATCH_IDS: string[] = [];

export const selectMessagesByConversationMap = (state: RootState) =>
  state.messages.byConversationId;

export const selectReplyingToMessage = (state: RootState) => state.messages.replyingTo;
export const selectActiveThreadMessageId = (state: RootState) =>
  state.messages.activeThreadMessageId;
export const selectMessageSearchQuery = (state: RootState) => state.messages.searchQuery;
export const selectActiveSearchMatchIndex = (state: RootState) =>
  state.messages.activeSearchMatchIndex;
export const selectIsOffline = (state: RootState) => state.messages.isOffline;
export const selectOfflineQueueCount = (state: RootState) =>
  state.messages.offlineQueue.length;

export const selectAllConversationMessages = createSelector(
  [selectMessagesByConversationMap, selectSelectedConversationId],
  (byConv, convId) => (convId ? byConv[convId] ?? EMPTY_MESSAGES : EMPTY_MESSAGES)
);

export const selectCurrentConversationMessages = createSelector(
  [selectAllConversationMessages],
  (messages) => messages.filter((m) => !m.threadParentId)
);

export const selectPinnedMessages = createSelector(
  [selectCurrentConversationMessages],
  (messages) => messages.filter((m) => m.isPinned)
);

export const selectThreadRepliesMap = createSelector(
  [selectAllConversationMessages],
  (messages) => {
    const map: Record<string, Message[]> = {};
    for (const msg of messages) {
      if (msg.threadParentId) {
        if (!map[msg.threadParentId]) {
          map[msg.threadParentId] = [];
        }
        map[msg.threadParentId].push(msg);
      }
    }
    return map;
  }
);

export const selectActiveThreadParent = createSelector(
  [selectAllConversationMessages, selectActiveThreadMessageId],
  (messages, threadId) =>
    threadId ? messages.find((m) => m.id === threadId) ?? null : null
);

export const selectCurrentMessagesStatus = createSelector(
  [(state: RootState) => state.messages.statusByConversationId, selectSelectedConversationId],
  (statusMap, convId) => (convId ? statusMap[convId] ?? 'idle' : 'idle')
);

export const selectCurrentMessagesError = createSelector(
  [(state: RootState) => state.messages.errorByConversationId, selectSelectedConversationId],
  (errorMap, convId) => (convId ? errorMap[convId] ?? null : null)
);

export const selectHasMoreOlderMessages = createSelector(
  [
    (state: RootState) => state.messages.hasMoreOlderByConversationId,
    selectSelectedConversationId,
  ],
  (map, convId) => (convId ? map[convId] ?? true : false)
);

export const selectLoadingOlderMessages = createSelector(
  [
    (state: RootState) => state.messages.loadingOlderByConversationId,
    selectSelectedConversationId,
  ],
  (map, convId) => (convId ? map[convId] ?? false : false)
);

export const selectCurrentTypingUsers = createSelector(
  [(state: RootState) => state.messages.typingByConversationId, selectSelectedConversationId],
  (typingMap, convId) => (convId ? typingMap[convId] ?? EMPTY_TYPING_USERS : EMPTY_TYPING_USERS)
);

export const selectMatchingMessageIds = createSelector(
  [selectCurrentConversationMessages, selectMessageSearchQuery],
  (messages, query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return EMPTY_MATCH_IDS;
    return messages
      .filter((m) => m.content.toLowerCase().includes(normalized))
      .map((m) => m.id);
  }
);
