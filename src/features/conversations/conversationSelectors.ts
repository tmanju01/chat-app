import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export const selectAllConversations = (state: RootState) => state.conversations.items;
export const selectSelectedConversationId = (state: RootState) =>
  state.conversations.selectedConversationId;
export const selectConversationSearchQuery = (state: RootState) =>
  state.conversations.searchQuery;
export const selectConversationFilter = (state: RootState) => state.conversations.filter;
export const selectConversationsStatus = (state: RootState) => state.conversations.status;
export const selectConversationsError = (state: RootState) => state.conversations.error;

export const selectSelectedConversation = createSelector(
  [selectAllConversations, selectSelectedConversationId],
  (items, selectedId) => items.find((c) => c.id === selectedId) ?? null
);

export const selectTotalUnreadCount = createSelector(
  [selectAllConversations],
  (items) => items.reduce((sum, conv) => sum + conv.unreadCount, 0)
);

export const selectPriorityConversationsCount = createSelector(
  [selectAllConversations],
  (items) => items.filter((c) => c.isPriority).length
);

export const selectRecentConversations = createSelector(
  [selectAllConversations],
  (items) => items.slice(0, 4)
);

export const selectFilteredConversations = createSelector(
  [selectAllConversations, selectConversationSearchQuery, selectConversationFilter],
  (items, searchQuery, filter) => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((conv) => {
      if (filter === 'unread' && conv.unreadCount === 0) {
        return false;
      }
      if (filter === 'direct' && conv.type !== 'individual') {
        return false;
      }
      if (filter === 'groups' && conv.type !== 'group') {
        return false;
      }
      if (filter === 'priority' && !conv.isPriority) {
        return false;
      }
      if (query && !conv.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }
);
