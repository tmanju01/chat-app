import { mockConversations, mockGroups } from '../data/mockConversations';
import { createAvatarSvg, mockUsers } from '../data/mockUsers';
import type { Conversation, GroupDetails, User } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../utils/storage';
import { generateId, simulateLatency } from './apiHelpers';

export interface BootstrapWorkspaceResponse {
  conversations: Conversation[];
  users: User[];
  groups: GroupDetails[];
}

export async function getConversations(): Promise<BootstrapWorkspaceResponse> {
  await simulateLatency(200);

  const storedConversations = getStorageItem<Conversation[] | null>(
    STORAGE_KEYS.CONVERSATIONS,
    null
  );
  const storedGroups = getStorageItem<Record<string, GroupDetails> | null>(
    STORAGE_KEYS.GROUPS,
    null
  );

  const conversations =
    storedConversations && storedConversations.length > 0
      ? storedConversations
      : mockConversations;

  const groups =
    storedGroups && Object.keys(storedGroups).length > 0
      ? Object.values(storedGroups)
      : mockGroups;

  setStorageItem(STORAGE_KEYS.CONVERSATIONS, conversations);
  const groupRecord: Record<string, GroupDetails> = {};
  for (const g of groups) {
    groupRecord[g.id] = g;
  }
  setStorageItem(STORAGE_KEYS.GROUPS, groupRecord);

  return {
    conversations,
    users: mockUsers,
    groups,
  };
}

export async function getConversationById(id: string): Promise<Conversation> {
  await simulateLatency(120);
  const stored = getStorageItem<Conversation[]>(
    STORAGE_KEYS.CONVERSATIONS,
    mockConversations
  );
  const found = stored.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Conversation "${id}" could not be found.`);
  }
  return found;
}

export async function createDirectConversation(
  targetUser: User,
  currentUserId: string
): Promise<Conversation> {
  await simulateLatency(150);

  return {
    id: generateId('conv'),
    type: 'individual',
    name: targetUser.name,
    avatar: targetUser.avatar,
    members: [currentUserId, targetUser.id],
    lastMessage: null,
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
    isPriority: false,
  };
}

export async function createGroupConversation(payload: {
  name: string;
  description: string;
  memberIds: string[];
  createdBy: string;
}): Promise<{ conversation: Conversation; group: GroupDetails }> {
  await simulateLatency(190);

  const now = new Date().toISOString();
  const id = generateId('conv-space');
  const uniqueMembers = Array.from(new Set([payload.createdBy, ...payload.memberIds]));
  const avatar = createAvatarSvg(payload.name, '#7c3aed');

  const conversation: Conversation = {
    id,
    type: 'group',
    name: payload.name.trim(),
    avatar,
    description: payload.description.trim(),
    members: uniqueMembers,
    lastMessage: null,
    updatedAt: now,
    unreadCount: 0,
    isPriority: false,
  };

  const group: GroupDetails = {
    id,
    name: payload.name.trim(),
    description: payload.description.trim(),
    avatar,
    createdBy: payload.createdBy,
    createdAt: now,
    members: uniqueMembers,
  };

  return { conversation, group };
}

