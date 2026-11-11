import type { MessageStatus } from './message.types';

export type ConversationType = 'individual' | 'group';

export type ConversationFilter =
  | 'all'
  | 'unread'
  | 'direct'
  | 'groups'
  | 'priority';

export interface LastMessageSummary {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string;
  description?: string;
  members: string[];
  lastMessage: LastMessageSummary | null;
  updatedAt: string;
  unreadCount: number;
  isPriority: boolean;
}

export interface GroupDetails {
  id: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: string;
  createdAt: string;
  members: string[];
}
