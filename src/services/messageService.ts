import { mockMessages } from '../data/mockMessages';
import type { Message, MessageAttachment, MessageReplyPreview } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../utils/storage';
import { generateId, simulateLatency } from './apiHelpers';

export async function getMessages(conversationId: string): Promise<Message[]> {
  await simulateLatency(170);

  const stored = getStorageItem<Record<string, Message[]>>(
    STORAGE_KEYS.MESSAGES,
    {}
  );

  if (stored[conversationId]) {
    return stored[conversationId];
  }

  const seeded = mockMessages[conversationId] ?? [];
  setStorageItem(STORAGE_KEYS.MESSAGES, { ...stored, [conversationId]: seeded });
  return seeded;
}

export async function getOlderMessages(
  conversationId: string,
  page: number,
  memberIds: string[]
): Promise<{ messages: Message[]; hasMore: boolean }> {
  await simulateLatency(220);

  if (page > 2) {
    return { messages: [], hasMore: false };
  }

  const baseDays = 5 + page * 3;
  const senderA = memberIds[0] ?? 'user-me';
  const senderB = memberIds.find((id) => id !== 'user-me') ?? senderA;

  const older: Message[] = [
    {
      id: `${conversationId}-hist-${page}-1`,
      conversationId,
      senderId: senderB,
      content: `Archived sprint note (#${page}): reviewed API contract and latency budgets.`,
      timestamp: new Date(Date.now() - (baseDays + 1) * 86_400_000).toISOString(),
      status: 'read',
      type: 'text',
      replyTo: null,
      threadParentId: null,
      reactions: [],
      editedAt: null,
      isPinned: false,
    },
    {
      id: `${conversationId}-hist-${page}-2`,
      conversationId,
      senderId: senderA,
      content: `Logged follow-up benchmarks and confirmed bundle size stayed within target.`,
      timestamp: new Date(Date.now() - baseDays * 86_400_000).toISOString(),
      status: 'read',
      type: 'text',
      replyTo: null,
      threadParentId: null,
      reactions: [{ emoji: '👍', userIds: [senderB] }],
      editedAt: null,
      isPinned: false,
    },
  ];

  return { messages: older, hasMore: page < 2 };
}

export async function sendMessage(payload: {
  conversationId: string;
  senderId: string;
  content: string;
  replyTo: MessageReplyPreview | null;
  threadParentId?: string | null;
  attachments?: MessageAttachment[];
}): Promise<Message> {
  await simulateLatency(110);

  return {
    id: generateId('msg'),
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    content: payload.content.trim(),
    timestamp: new Date().toISOString(),
    status: 'sent',
    type: 'text',
    replyTo: payload.replyTo,
    threadParentId: payload.threadParentId ?? null,
    reactions: [],
    editedAt: null,
    isPinned: false,
    attachments: payload.attachments,
  };
}

export async function editMessage(payload: {
  conversationId: string;
  messageId: string;
  content: string;
}): Promise<{
  conversationId: string;
  messageId: string;
  content: string;
  editedAt: string;
}> {
  await simulateLatency(120);
  return {
    conversationId: payload.conversationId,
    messageId: payload.messageId,
    content: payload.content.trim(),
    editedAt: new Date().toISOString(),
  };
}

export async function deleteMessage(payload: {
  conversationId: string;
  messageId: string;
}): Promise<{ conversationId: string; messageId: string }> {
  await simulateLatency(120);
  return payload;
}
