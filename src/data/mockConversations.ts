import type { Conversation, GroupDetails } from '../types';
import { createAvatarSvg } from './mockUsers';

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

export const mockConversations: Conversation[] = [
  {
    id: 'conv-sarah',
    type: 'individual',
    name: 'Sarah Chen',
    avatar: createAvatarSvg('Sarah Chen', '#4f46e5'),
    members: ['user-me', 'user-sarah'],
    lastMessage: {
      id: 'msg-sarah-5',
      senderId: 'user-sarah',
      content: 'Shipped the updated violet surface tokens for midnight mode.',
      timestamp: minsAgo(6),
      status: 'read',
    },
    updatedAt: minsAgo(6),
    unreadCount: 2,
    isPriority: true,
  },
  {
    id: 'conv-space-core',
    type: 'group',
    name: 'Core Platform Guild',
    avatar: createAvatarSvg('Core Platform', '#7c3aed'),
    description:
      'Architecture RFCs, Redux state topology, accessibility standards, and frontend release readiness.',
    members: ['user-me', 'user-sarah', 'user-marcus', 'user-elena', 'user-nadia'],
    lastMessage: {
      id: 'msg-core-4',
      senderId: 'user-elena',
      content: 'Let us finalize the Ctrl+K command palette shortcuts before EOD.',
      timestamp: minsAgo(19),
      status: 'delivered',
    },
    updatedAt: minsAgo(19),
    unreadCount: 3,
    isPriority: true,
  },
  {
    id: 'conv-marcus',
    type: 'individual',
    name: 'Marcus Rivera',
    avatar: createAvatarSvg('Marcus Rivera', '#0891b2'),
    members: ['user-me', 'user-marcus'],
    lastMessage: {
      id: 'msg-marcus-3',
      senderId: 'user-me',
      content: 'Confirmed: messages stay normalized by conversationId in Redux.',
      timestamp: hoursAgo(2),
      status: 'read',
    },
    updatedAt: hoursAgo(2),
    unreadCount: 0,
    isPriority: false,
  },
  {
    id: 'conv-space-launch',
    type: 'group',
    name: 'NEXORA v3 Launch',
    avatar: createAvatarSvg('NEXORA Launch', '#6d28d9'),
    description:
      'Cross-functional launch readiness, QA verification, telemetry checks, and customer onboarding.',
    members: ['user-me', 'user-priya', 'user-david', 'user-elena', 'user-liam'],
    lastMessage: {
      id: 'msg-launch-3',
      senderId: 'user-priya',
      content: 'Design QA sign-off is complete across desktop, tablet, and mobile.',
      timestamp: daysAgo(1),
      status: 'read',
    },
    updatedAt: daysAgo(1),
    unreadCount: 1,
    isPriority: false,
  },
  {
    id: 'conv-priya',
    type: 'individual',
    name: 'Priya Patel',
    avatar: createAvatarSvg('Priya Patel', '#db2777'),
    members: ['user-me', 'user-priya'],
    lastMessage: {
      id: 'msg-priya-2',
      senderId: 'user-priya',
      content: 'Updated the Activity Center notification priority copy in Figma.',
      timestamp: daysAgo(2),
      status: 'read',
    },
    updatedAt: daysAgo(2),
    unreadCount: 0,
    isPriority: false,
  },
  {
    id: 'conv-david',
    type: 'individual',
    name: 'David Kim',
    avatar: createAvatarSvg('David Kim', '#059669'),
    members: ['user-me', 'user-david'],
    lastMessage: {
      id: 'msg-david-2',
      senderId: 'user-david',
      content: 'Preview builds are now completing in under 25 seconds.',
      timestamp: daysAgo(4),
      status: 'read',
    },
    updatedAt: daysAgo(4),
    unreadCount: 0,
    isPriority: false,
  },
];

export const mockGroups: GroupDetails[] = [
  {
    id: 'conv-space-core',
    name: 'Core Platform Guild',
    description:
      'Architecture RFCs, Redux state topology, accessibility standards, and frontend release readiness.',
    avatar: createAvatarSvg('Core Platform', '#7c3aed'),
    createdBy: 'user-elena',
    createdAt: daysAgo(28),
    members: ['user-me', 'user-sarah', 'user-marcus', 'user-elena', 'user-nadia'],
  },
  {
    id: 'conv-space-launch',
    name: 'NEXORA v3 Launch',
    description:
      'Cross-functional launch readiness, QA verification, telemetry checks, and customer onboarding.',
    avatar: createAvatarSvg('NEXORA Launch', '#6d28d9'),
    createdBy: 'user-elena',
    createdAt: daysAgo(14),
    members: ['user-me', 'user-priya', 'user-david', 'user-elena', 'user-liam'],
  },
];

