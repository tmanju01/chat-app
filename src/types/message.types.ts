export type MessageStatus =
  | 'sending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export type MessageType = 'text' | 'system';

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface MessageReplyPreview {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  type: MessageType;
  replyTo: MessageReplyPreview | null;
  threadParentId: string | null;
  reactions: MessageReaction[];
  editedAt: string | null;
  isPinned: boolean;
  attachments?: MessageAttachment[];
}
