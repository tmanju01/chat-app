import { mockGroups } from '../data/mockConversations';
import type { GroupDetails } from '../types';
import { STORAGE_KEYS, getStorageItem } from '../utils/storage';
import { simulateLatency } from './apiHelpers';

export async function getGroupDetails(groupId: string): Promise<GroupDetails> {
  await simulateLatency(130);

  const stored = getStorageItem<Record<string, GroupDetails>>(
    STORAGE_KEYS.GROUPS,
    {}
  );
  if (stored[groupId]) {
    return stored[groupId];
  }

  const fallback = mockGroups.find((g) => g.id === groupId);
  if (!fallback) {
    throw new Error(`Team Space "${groupId}" could not be found.`);
  }
  return fallback;
}

export async function updateGroupDetails(payload: {
  groupId: string;
  name: string;
  description: string;
}): Promise<{ groupId: string; name: string; description: string }> {
  await simulateLatency(140);
  return {
    groupId: payload.groupId,
    name: payload.name.trim(),
    description: payload.description.trim(),
  };
}

export async function addGroupMember(payload: {
  groupId: string;
  userId: string;
}): Promise<{ groupId: string; userId: string }> {
  await simulateLatency(130);
  return payload;
}

export async function removeGroupMember(payload: {
  groupId: string;
  userId: string;
}): Promise<{ groupId: string; userId: string }> {
  await simulateLatency(130);
  return payload;
}

