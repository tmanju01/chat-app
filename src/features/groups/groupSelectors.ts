import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { User } from '../../types';
import { selectSelectedConversation } from '../conversations/conversationSelectors';

export const selectCurrentUserId = (state: RootState) => state.groups.currentUserId;
export const selectUsersById = (state: RootState) => state.groups.usersById;
export const selectGroupsById = (state: RootState) => state.groups.groupsById;
export const selectIsInfoPanelOpen = (state: RootState) => state.groups.isInfoPanelOpen;

export const selectCurrentUser = createSelector(
  [selectUsersById, selectCurrentUserId],
  (usersById, currentUserId) => usersById[currentUserId] ?? null
);

export const selectAllOtherUsers = createSelector(
  [selectUsersById, selectCurrentUserId],
  (usersById, currentUserId) =>
    Object.values(usersById).filter((u) => u.id !== currentUserId)
);

export const selectOnlineUsers = createSelector(
  [selectUsersById],
  (usersById) => Object.values(usersById).filter((u) => u.status === 'online')
);

export const selectAllGroups = createSelector(
  [selectGroupsById],
  (groupsById) => Object.values(groupsById)
);

export const selectActiveGroupDetails = createSelector(
  [selectSelectedConversation, selectGroupsById],
  (conversation, groupsById) => {
    if (!conversation || conversation.type !== 'group') return null;
    return groupsById[conversation.id] ?? null;
  }
);

export const selectActiveGroupMembers = createSelector(
  [selectActiveGroupDetails, selectUsersById],
  (group, usersById): User[] => {
    if (!group) return [];
    return group.members
      .map((id) => usersById[id])
      .filter((u): u is User => Boolean(u));
  }
);

export const selectDirectChatPeer = createSelector(
  [selectSelectedConversation, selectUsersById, selectCurrentUserId],
  (conversation, usersById, currentUserId): User | null => {
    if (!conversation || conversation.type !== 'individual') return null;
    const peerId = conversation.members.find((id) => id !== currentUserId);
    return peerId ? usersById[peerId] ?? null : null;
  }
);
