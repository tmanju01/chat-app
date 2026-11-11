import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as conversationService from '../../services/conversationService';
import type {
  Conversation,
  ConversationFilter,
  GroupDetails,
  LastMessageSummary,
  User,
} from '../../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';

export interface ConversationState {
  items: Conversation[];
  selectedConversationId: string | null;
  searchQuery: string;
  filter: ConversationFilter;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ConversationState = {
  items: getStorageItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []),
  selectedConversationId: getStorageItem<string | null>(
    STORAGE_KEYS.SELECTED_CONVERSATION,
    null
  ),
  searchQuery: '',
  filter: 'all',
  status: 'idle',
  error: null,
};

export const fetchConversations = createAsyncThunk<
  { conversations: Conversation[]; users: User[]; groups: GroupDetails[] },
  void,
  { rejectValue: string }
>('conversations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await conversationService.getConversations();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to load conversations.'
    );
  }
});

export const startDirectConversation = createAsyncThunk<
  { conversation: Conversation; alreadyExists: boolean },
  { targetUser: User; currentUserId: string },
  { state: { conversations: ConversationState }; rejectValue: string }
>(
  'conversations/startDirect',
  async ({ targetUser, currentUserId }, { getState, rejectWithValue }) => {
    try {
      const existing = getState().conversations.items.find(
        (c) =>
          c.type === 'individual' &&
          c.members.includes(targetUser.id) &&
          c.members.includes(currentUserId)
      );

      if (existing) {
        return { conversation: existing, alreadyExists: true };
      }

      const created = await conversationService.createDirectConversation(
        targetUser,
        currentUserId
      );
      return { conversation: created, alreadyExists: false };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to start conversation.'
      );
    }
  }
);

export const createGroup = createAsyncThunk<
  { conversation: Conversation; group: GroupDetails },
  { name: string; description: string; memberIds: string[]; createdBy: string },
  { rejectValue: string }
>('conversations/createGroup', async (payload, { rejectWithValue }) => {
  try {
    return await conversationService.createGroupConversation(payload);
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to create team space.'
    );
  }
});

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.items = [...action.payload].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      state.status = 'succeeded';
      state.error = null;
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
    },
    selectConversation(state, action: PayloadAction<string | null>) {
      state.selectedConversationId = action.payload;
      setStorageItem(STORAGE_KEYS.SELECTED_CONVERSATION, action.payload);

      if (action.payload) {
        const target = state.items.find((c) => c.id === action.payload);
        if (target && target.unreadCount > 0) {
          target.unreadCount = 0;
          setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
        }
      }
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilter(state, action: PayloadAction<ConversationFilter>) {
      state.filter = action.payload;
    },
    toggleConversationPriority(state, action: PayloadAction<string>) {
      const target = state.items.find((c) => c.id === action.payload);
      if (!target) return;
      target.isPriority = !target.isPriority;
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
    },
    addConversation(state, action: PayloadAction<Conversation>) {
      state.items.unshift(action.payload);
      state.selectedConversationId = action.payload.id;
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
      setStorageItem(STORAGE_KEYS.SELECTED_CONVERSATION, action.payload.id);
    },
    updateConversationPreview(
      state,
      action: PayloadAction<{
        conversationId: string;
        lastMessage: LastMessageSummary | null;
        updatedAt?: string;
        incrementUnread?: boolean;
      }>
    ) {
      const { conversationId, lastMessage, updatedAt, incrementUnread } = action.payload;
      const target = state.items.find((c) => c.id === conversationId);
      if (!target) return;

      target.lastMessage = lastMessage;
      if (updatedAt) {
        target.updatedAt = updatedAt;
      }
      if (incrementUnread && state.selectedConversationId !== conversationId) {
        target.unreadCount += 1;
      }

      state.items.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
    },
    updateConversationMetadata(
      state,
      action: PayloadAction<{
        conversationId: string;
        name?: string;
        description?: string;
        members?: string[];
      }>
    ) {
      const { conversationId, name, description, members } = action.payload;
      const target = state.items.find((c) => c.id === conversationId);
      if (!target) return;
      if (name !== undefined) target.name = name;
      if (description !== undefined) target.description = description;
      if (members !== undefined) target.members = members;
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
    },
    clearConversationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.items = [...action.payload.conversations].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        state.status = 'succeeded';
        state.error = null;
        setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load conversations.';
      })
      .addCase(startDirectConversation.fulfilled, (state, action) => {
        const { conversation, alreadyExists } = action.payload;
        if (!alreadyExists) {
          state.items.unshift(conversation);
          setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
        }
        state.selectedConversationId = conversation.id;
        setStorageItem(STORAGE_KEYS.SELECTED_CONVERSATION, conversation.id);
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        const { conversation } = action.payload;
        state.items.unshift(conversation);
        state.selectedConversationId = conversation.id;
        setStorageItem(STORAGE_KEYS.CONVERSATIONS, state.items);
        setStorageItem(STORAGE_KEYS.SELECTED_CONVERSATION, conversation.id);
      });
  },
});

export const {
  setConversations,
  selectConversation,
  setSearchQuery,
  setFilter,
  toggleConversationPriority,
  addConversation,
  updateConversationPreview,
  updateConversationMetadata,
  clearConversationError,
} = conversationSlice.actions;

export default conversationSlice.reducer;
