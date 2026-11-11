import type { Message } from '../types';
import { formatDateSeparator, getDateKey } from './dateUtils';

export interface MessageDateGroup {
  dateKey: string;
  dateLabel: string;
  items: Message[];
}

export function groupMessagesByDate(messages: Message[]): MessageDateGroup[] {
  const groups: MessageDateGroup[] = [];

  for (const message of messages) {
    const key = getDateKey(message.timestamp);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.dateKey === key) {
      lastGroup.items.push(message);
    } else {
      groups.push({
        dateKey: key,
        dateLabel: formatDateSeparator(message.timestamp),
        items: [message],
      });
    }
  }

  return groups;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function truncatePreview(text: string, maxLength = 48): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

