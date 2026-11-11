import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { CURRENT_USER_ID } from '../../data/mockUsers';
import * as groupService from '../../services/groupService';
import type { GroupDetails, User, UserStatus } from '../../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';
import {
  createGroup,
  fetchConversations,
  updateConversationMetadata,
} from '../conversations/conversationSlice';

export interface GroupState {
  currentUserId: string;
  usersById: Record<string, User>;
  groupsById: Record<string, GroupDetails>;
  isInfoPanelOpen: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GroupState = {
  currentUserId: CURRENT_USER_ID,
  usersById: {},
  groupsById: getStorageItem<Record<string, GroupDetails>>(STORAGE_KEYS.GROUPS, {}),
  isInfoPanelOpen: false,
  status: 'idle',
  error: null,
};

export const updateGroupDetailsThunk = createAsyncThunk<
  { groupId: string; name: string; description: string },
  { groupId: string; name: string; description: string },
  { rejectValue: string }
>('groups/updateDetails', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const updated = await groupService.updateGroupDetails(payload);
    dispatch(
      updateConversationMetadata({
        conversationId: updated.groupId,
        name: updated.name,
        description: updated.description,
      })
    );
    return updated;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to update space details.'
    );
  }
});

export const addGroupMemberThunk = createAsyncThunk<
  { groupId: string; userId: string },
  { groupId: string; userId: string },
  { state: { groups: GroupState }; rejectValue: string }
>('groups/addMember', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const result = await groupService.addGroupMember(payload);
    const existingGroup = getState().groups.groupsById[payload.groupId];
    if (existingGroup) {
      const nextMembers = existingGroup.members.includes(payload.userId)
        ? existingGroup.members
        : [...existingGroup.members, payload.userId];
      dispatch(
        updateConversationMetadata({
          conversationId: payload.groupId,
          members: nextMembers,
        })
      );
    }
    return result;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to add member.'
    );
  }
});

export const removeGroupMemberThunk = createAsyncThunk<
  { groupId: string; userId: string },
  { groupId: string; userId: string },
  { state: { groups: GroupState }; rejectValue: string }
>('groups/removeMember', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const result = await groupService.removeGroupMember(payload);
    const existingGroup = getState().groups.groupsById[payload.groupId];
    if (existingGroup) {
      const nextMembers = existingGroup.members.filter((id) => id !== payload.userId);
      dispatch(
        updateConversationMetadata({
          conversationId: payload.groupId,
          members: nextMembers,
        })
      );
    }
    return result;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to remove member.'
    );
  }
});

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      const map: Record<string, User> = {};
      for (const user of action.payload) {
        map[user.id] = user;
      }
      state.usersById = map;
    },
    setUserStatus(
      state,
      action: PayloadAction<{ userId: string; status: UserStatus; lastSeen?: string }>
    ) {
      const user = state.usersById[action.payload.userId];
      if (!user) return;
      user.status = action.payload.status;
      if (action.payload.lastSeen) {
        user.lastSeen = action.payload.lastSeen;
      }
    },
    setGroups(state, action: PayloadAction<GroupDetails[]>) {
      const map: Record<string, GroupDetails> = {};
      for (const group of action.payload) {
        map[group.id] = group;
      }
      state.groupsById = map;
      state.status = 'succeeded';
      setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
    },
    upsertGroup(state, action: PayloadAction<GroupDetails>) {
      state.groupsById[action.payload.id] = action.payload;
      setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
    },
    updateGroupDetailsLocal(
      state,
      action: PayloadAction<{ groupId: string; name: string; description: string }>
    ) {
      const group = state.groupsById[action.payload.groupId];
      if (!group) return;
      group.name = action.payload.name;
      group.description = action.payload.description;
      setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
    },
    addGroupMemberLocal(
      state,
      action: PayloadAction<{ groupId: string; userId: string }>
    ) {
      const group = state.groupsById[action.payload.groupId];
      if (!group) return;
      if (!group.members.includes(action.payload.userId)) {
        group.members.push(action.payload.userId);
        setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
      }
    },
    removeGroupMemberLocal(
      state,
      action: PayloadAction<{ groupId: string; userId: string }>
    ) {
      const group = state.groupsById[action.payload.groupId];
      if (!group) return;
      group.members = group.members.filter((id) => id !== action.payload.userId);
      setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
    },
    toggleInfoPanel(state) {
      state.isInfoPanelOpen = !state.isInfoPanelOpen;
    },
    setInfoPanelOpen(state, action: PayloadAction<boolean>) {
      state.isInfoPanelOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        const userMap: Record<string, User> = {};
        for (const user of action.payload.users) {
          userMap[user.id] = user;
        }
        state.usersById = userMap;

        const groupMap: Record<string, GroupDetails> = {};
        for (const group of action.payload.groups) {
          groupMap[group.id] = group;
        }
        state.groupsById = groupMap;
        state.status = 'succeeded';
        setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        const { group } = action.payload;
        state.groupsById[group.id] = group;
        setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
      })
      .addCase(updateGroupDetailsThunk.fulfilled, (state, action) => {
        const group = state.groupsById[action.payload.groupId];
        if (!group) return;
        group.name = action.payload.name;
        group.description = action.payload.description;
        setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
      })
      .addCase(addGroupMemberThunk.fulfilled, (state, action) => {
        const group = state.groupsById[action.payload.groupId];
        if (!group) return;
        if (!group.members.includes(action.payload.userId)) {
          group.members.push(action.payload.userId);
          setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
        }
      })
      .addCase(removeGroupMemberThunk.fulfilled, (state, action) => {
        const group = state.groupsById[action.payload.groupId];
        if (!group) return;
        group.members = group.members.filter((id) => id !== action.payload.userId);
        setStorageItem(STORAGE_KEYS.GROUPS, state.groupsById);
      });
  },
});

export const {
  setUsers,
  setUserStatus,
  setGroups,
  upsertGroup,
  updateGroupDetailsLocal,
  addGroupMemberLocal,
  removeGroupMemberLocal,
  toggleInfoPanel,
  setInfoPanelOpen,
} = groupSlice.actions;

export default groupSlice.reducer;
