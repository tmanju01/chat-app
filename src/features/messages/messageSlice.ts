import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as messageService from '../../services/messageService';
import type {
  Message,
  MessageAttachment,
  MessageReplyPreview,
  MessageStatus,
} from '../../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';
import { updateConversationPreview } from '../conversations/conversationSlice';

export interface QueuedMessagePayload {
  tempId: string;
  conversationId: string;
  senderId: string;
  content: string;
  replyTo: MessageReplyPreview | null;
  threadParentId?: string | null;
  attachments?: MessageAttachment[];
}

export interface MessageState {
  byConversationId: Record<string, Message[]>;
  statusByConversationId: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  errorByConversationId: Record<string, string | null>;
  olderPageByConversationId: Record<string, number>;
  hasMoreOlderByConversationId: Record<string, boolean>;
  loadingOlderByConversationId: Record<string, boolean>;
  replyingTo: Message | null;
  activeThreadMessageId: string | null;
  typingByConversationId: Record<string, string[]>;
  searchQuery: string;
  activeSearchMatchIndex: number;
  isOffline: boolean;
  offlineQueue: QueuedMessagePayload[];
}

const initialState: MessageState = {
  byConversationId: getStorageItem<Record<string, Message[]>>(
    STORAGE_KEYS.MESSAGES,
    {}
  ),
  statusByConversationId: {},
  errorByConversationId: {},
  olderPageByConversationId: {},
  hasMoreOlderByConversationId: {},
  loadingOlderByConversationId: {},
  replyingTo: null,
  activeThreadMessageId: null,
  typingByConversationId: {},
  searchQuery: '',
  activeSearchMatchIndex: 0,
  isOffline: false,
  offlineQueue: [],
};

function buildPreviewText(content: string, attachments?: MessageAttachment[]): string {
  const trimmed = content.trim();
  if (trimmed) return trimmed;
  if (attachments && attachments.length > 0) {
    return attachments.length === 1
      ? `📎 ${attachments[0].name}`
      : `📎 ${attachments.length} attachments`;
  }
  return '';
}

export const fetchMessages = createAsyncThunk<
  { conversationId: string; messages: Message[] },
  string,
  { rejectValue: { conversationId: string; message: string } }
>('messages/fetchByConversation', async (conversationId, { rejectWithValue }) => {
  try {
    const messages = await messageService.getMessages(conversationId);
    return { conversationId, messages };
  } catch (err) {
    return rejectWithValue({
      conversationId,
      message: err instanceof Error ? err.message : 'Failed to load messages.',
    });
  }
});

export const fetchOlderMessagesThunk = createAsyncThunk<
  { conversationId: string; messages: Message[]; hasMore: boolean; nextPage: number },
  { conversationId: string; memberIds: string[] },
  { state: { messages: MessageState }; rejectValue: string }
>(
  'messages/fetchOlder',
  async ({ conversationId, memberIds }, { getState, rejectWithValue }) => {
    try {
      const currentPage =
        getState().messages.olderPageByConversationId[conversationId] ?? 0;
      const nextPage = currentPage + 1;
      const res = await messageService.getOlderMessages(
        conversationId,
        nextPage,
        memberIds
      );
      return {
        conversationId,
        messages: res.messages,
        hasMore: res.hasMore,
        nextPage,
      };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to load older messages.'
      );
    }
  }
);

export const sendMessageThunk = createAsyncThunk<
  { confirmed: Message | null; queued: QueuedMessagePayload | null },
  {
    conversationId: string;
    senderId: string;
    content: string;
    replyTo: MessageReplyPreview | null;
    threadParentId?: string | null;
    attachments?: MessageAttachment[];
  },
  { state: { messages: MessageState }; rejectValue: string }
>(
  'messages/send',
  async (payload, { dispatch, getState, requestId, rejectWithValue }) => {
    try {
      const isOffline = getState().messages.isOffline;
      const previewContent = buildPreviewText(payload.content, payload.attachments);

      if (isOffline) {
        const queued: QueuedMessagePayload = {
          tempId: requestId,
          ...payload,
        };
        if (!payload.threadParentId) {
          dispatch(
            updateConversationPreview({
              conversationId: payload.conversationId,
              lastMessage: {
                id: requestId,
                senderId: payload.senderId,
                content: previewContent,
                timestamp: new Date().toISOString(),
                status: 'queued',
              },
              updatedAt: new Date().toISOString(),
            })
          );
        }
        return { confirmed: null, queued };
      }

      const confirmed = await messageService.sendMessage(payload);
      if (!confirmed.threadParentId) {
        dispatch(
          updateConversationPreview({
            conversationId: confirmed.conversationId,
            lastMessage: {
              id: confirmed.id,
              senderId: confirmed.senderId,
              content: buildPreviewText(confirmed.content, confirmed.attachments),
              timestamp: confirmed.timestamp,
              status: confirmed.status,
            },
            updatedAt: confirmed.timestamp,
          })
        );
      }
      return { confirmed, queued: null };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to send message.'
      );
    }
  }
);

export const flushOfflineQueueThunk = createAsyncThunk<
  Array<{ tempId: string; confirmed: Message }>,
  void,
  { state: { messages: MessageState }; rejectValue: string }
>('messages/flushQueue', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const queue = getState().messages.offlineQueue;
    if (queue.length === 0) return [];

    const results: Array<{ tempId: string; confirmed: Message }> = [];
    for (const item of queue) {
      const confirmed = await messageService.sendMessage({
        conversationId: item.conversationId,
        senderId: item.senderId,
        content: item.content,
        replyTo: item.replyTo,
        threadParentId: item.threadParentId,
        attachments: item.attachments,
      });
      if (!confirmed.threadParentId) {
        dispatch(
          updateConversationPreview({
            conversationId: confirmed.conversationId,
            lastMessage: {
              id: confirmed.id,
              senderId: confirmed.senderId,
              content: buildPreviewText(confirmed.content, confirmed.attachments),
              timestamp: confirmed.timestamp,
              status: confirmed.status,
            },
            updatedAt: confirmed.timestamp,
          })
        );
      }
      results.push({ tempId: item.tempId, confirmed });
    }
    return results;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to flush queued messages.'
    );
  }
});

export const editMessageThunk = createAsyncThunk<
  { conversationId: string; messageId: string; content: string; editedAt: string },
  { conversationId: string; messageId: string; content: string },
  { state: { messages: MessageState }; rejectValue: string }
>('messages/edit', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const updated = await messageService.editMessage(payload);
    const list = (
      getState().messages.byConversationId[payload.conversationId] ?? []
    ).filter((m) => !m.threadParentId);
    const last = list[list.length - 1];
    if (last && last.id === payload.messageId) {
      dispatch(
        updateConversationPreview({
          conversationId: payload.conversationId,
          lastMessage: {
            id: last.id,
            senderId: last.senderId,
            content: updated.content,
            timestamp: last.timestamp,
            status: last.status,
          },
        })
      );
    }
    return updated;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to edit message.'
    );
  }
});

export const deleteMessageThunk = createAsyncThunk<
  { conversationId: string; messageId: string },
  { conversationId: string; messageId: string },
  { state: { messages: MessageState }; rejectValue: string }
>('messages/delete', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const result = await messageService.deleteMessage(payload);
    const list = getState().messages.byConversationId[payload.conversationId] ?? [];
    const remainingTopLevel = list.filter(
      (m) => m.id !== payload.messageId && !m.threadParentId
    );
    const nextLast = remainingTopLevel[remainingTopLevel.length - 1] ?? null;

    dispatch(
      updateConversationPreview({
        conversationId: payload.conversationId,
        lastMessage: nextLast
          ? {
              id: nextLast.id,
              senderId: nextLast.senderId,
              content: buildPreviewText(nextLast.content, nextLast.attachments),
              timestamp: nextLast.timestamp,
              status: nextLast.status,
            }
          : null,
      })
    );
    return result;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to delete message.'
    );
  }
});

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessagesForConversation(
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) {
      const { conversationId, messages } = action.payload;
      state.byConversationId[conversationId] = messages;
      state.statusByConversationId[conversationId] = 'succeeded';
      state.errorByConversationId[conversationId] = null;
      setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
    },
    addMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload;
      if (!state.byConversationId[msg.conversationId]) {
        state.byConversationId[msg.conversationId] = [];
      }
      state.byConversationId[msg.conversationId].push(msg);
      setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        status: MessageStatus;
      }>
    ) {
      const { conversationId, messageId, status } = action.payload;
      const list = state.byConversationId[conversationId];
      if (!list) return;
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.status = status;
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      }
    },
    editMessageContent(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        content: string;
        editedAt: string;
      }>
    ) {
      const { conversationId, messageId, content, editedAt } = action.payload;
      const list = state.byConversationId[conversationId];
      if (!list) return;
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.content = content;
        msg.editedAt = editedAt;
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      }
    },
    deleteMessageById(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string }>
    ) {
      const { conversationId, messageId } = action.payload;
      const list = state.byConversationId[conversationId];
      if (!list) return;
      state.byConversationId[conversationId] = list.filter(
        (m) => m.id !== messageId && m.threadParentId !== messageId
      );
      if (state.activeThreadMessageId === messageId) {
        state.activeThreadMessageId = null;
      }
      setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
    },
    togglePinMessage(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string }>
    ) {
      const { conversationId, messageId } = action.payload;
      const list = state.byConversationId[conversationId];
      if (!list) return;
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.isPinned = !msg.isPinned;
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      }
    },
    toggleReaction(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        emoji: string;
        userId: string;
      }>
    ) {
      const { conversationId, messageId, emoji, userId } = action.payload;
      const list = state.byConversationId[conversationId];
      if (!list) return;
      const msg = list.find((m) => m.id === messageId);
      if (!msg) return;

      const existing = msg.reactions.find((r) => r.emoji === emoji);
      if (!existing) {
        msg.reactions.push({ emoji, userIds: [userId] });
      } else if (existing.userIds.includes(userId)) {
        existing.userIds = existing.userIds.filter((id) => id !== userId);
        if (existing.userIds.length === 0) {
          msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        existing.userIds.push(userId);
      }

      setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
    },
    setReplyingTo(state, action: PayloadAction<Message | null>) {
      state.replyingTo = action.payload;
    },
    setActiveThreadMessageId(state, action: PayloadAction<string | null>) {
      state.activeThreadMessageId = action.payload;
    },
    setTypingUsers(
      state,
      action: PayloadAction<{ conversationId: string; userIds: string[] }>
    ) {
      state.typingByConversationId[action.payload.conversationId] =
        action.payload.userIds;
    },
    setMessageSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.activeSearchMatchIndex = 0;
    },
    setActiveSearchMatchIndex(state, action: PayloadAction<number>) {
      state.activeSearchMatchIndex = action.payload;
    },
    setOfflineMode(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const convId = action.meta.arg;
        state.statusByConversationId[convId] = 'loading';
        state.errorByConversationId[convId] = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.byConversationId[conversationId] = messages;
        state.statusByConversationId[conversationId] = 'succeeded';
        state.errorByConversationId[conversationId] = null;
        if (state.hasMoreOlderByConversationId[conversationId] === undefined) {
          state.hasMoreOlderByConversationId[conversationId] = true;
        }
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const convId = action.payload?.conversationId ?? action.meta.arg;
        state.statusByConversationId[convId] = 'failed';
        state.errorByConversationId[convId] =
          action.payload?.message ?? 'Failed to load messages.';
      })
      .addCase(fetchOlderMessagesThunk.pending, (state, action) => {
        state.loadingOlderByConversationId[action.meta.arg.conversationId] = true;
      })
      .addCase(fetchOlderMessagesThunk.fulfilled, (state, action) => {
        const { conversationId, messages, hasMore, nextPage } = action.payload;
        const existing = state.byConversationId[conversationId] ?? [];
        const existingIds = new Set(existing.map((m) => m.id));
        const uniqueOlder = messages.filter((m) => !existingIds.has(m.id));
        state.byConversationId[conversationId] = [...uniqueOlder, ...existing];
        state.olderPageByConversationId[conversationId] = nextPage;
        state.hasMoreOlderByConversationId[conversationId] = hasMore;
        state.loadingOlderByConversationId[conversationId] = false;
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      })
      .addCase(fetchOlderMessagesThunk.rejected, (state, action) => {
        state.loadingOlderByConversationId[action.meta.arg.conversationId] = false;
      })
      .addCase(sendMessageThunk.pending, (state, action) => {
        const {
          conversationId,
          senderId,
          content,
          replyTo,
          threadParentId,
          attachments,
        } = action.meta.arg;
        const optimistic: Message = {
          id: action.meta.requestId,
          conversationId,
          senderId,
          content: content.trim(),
          timestamp: new Date().toISOString(),
          status: state.isOffline ? 'queued' : 'sending',
          type: 'text',
          replyTo,
          threadParentId: threadParentId ?? null,
          reactions: [],
          editedAt: null,
          isPinned: false,
          attachments,
        };
        if (!state.byConversationId[conversationId]) {
          state.byConversationId[conversationId] = [];
        }
        state.byConversationId[conversationId].push(optimistic);
        if (!threadParentId) {
          state.replyingTo = null;
        }
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const { confirmed, queued } = action.payload;
        if (queued) {
          state.offlineQueue.push(queued);
          setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
          return;
        }
        if (!confirmed) return;

        const list = state.byConversationId[confirmed.conversationId] ?? [];
        const idx = list.findIndex((m) => m.id === action.meta.requestId);
        if (idx !== -1) {
          list[idx] = confirmed;
        } else {
          list.push(confirmed);
        }
        state.byConversationId[confirmed.conversationId] = list;
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        const { conversationId } = action.meta.arg;
        const list = state.byConversationId[conversationId];
        if (!list) return;
        const msg = list.find((m) => m.id === action.meta.requestId);
        if (msg) {
          msg.status = 'failed';
        }
      })
      .addCase(flushOfflineQueueThunk.fulfilled, (state, action) => {
        for (const { tempId, confirmed } of action.payload) {
          const list = state.byConversationId[confirmed.conversationId];
          if (!list) continue;
          const idx = list.findIndex((m) => m.id === tempId);
          if (idx !== -1) {
            list[idx] = confirmed;
          }
        }
        state.offlineQueue = [];
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      })
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        const { conversationId, messageId, content, editedAt } = action.payload;
        const list = state.byConversationId[conversationId];
        if (!list) return;
        const msg = list.find((m) => m.id === messageId);
        if (msg) {
          msg.content = content;
          msg.editedAt = editedAt;
          setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
        }
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        const list = state.byConversationId[conversationId];
        if (!list) return;
        state.byConversationId[conversationId] = list.filter(
          (m) => m.id !== messageId && m.threadParentId !== messageId
        );
        if (state.activeThreadMessageId === messageId) {
          state.activeThreadMessageId = null;
        }
        setStorageItem(STORAGE_KEYS.MESSAGES, state.byConversationId);
      });
  },
});

export const {
  setMessagesForConversation,
  addMessage,
  updateMessageStatus,
  editMessageContent,
  deleteMessageById,
  togglePinMessage,
  toggleReaction,
  setReplyingTo,
  setActiveThreadMessageId,
  setTypingUsers,
  setMessageSearchQuery,
  setActiveSearchMatchIndex,
  setOfflineMode,
} = messageSlice.actions;

export default messageSlice.reducer;
