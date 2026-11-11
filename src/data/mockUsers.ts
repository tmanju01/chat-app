import type { User } from '../types';
import { getInitials } from '../utils/messageUtils';

export function createAvatarSvg(name: string, bgColor: string): string {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${bgColor}"/><text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-family="Inter,system-ui,sans-serif" font-size="46" font-weight="600">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

export const CURRENT_USER_ID = 'user-me';

export const mockUsers: User[] = [
  {
    id: CURRENT_USER_ID,
    name: 'Alex Morgan',
    avatar: createAvatarSvg('Alex Morgan', '#7c3aed'),
    status: 'online',
    lastSeen: minsAgo(0),
    role: 'Staff Frontend Architect',
    department: 'Platform Engineering',
  },
  {
    id: 'user-sarah',
    name: 'Sarah Chen',
    avatar: createAvatarSvg('Sarah Chen', '#4f46e5'),
    status: 'online',
    lastSeen: minsAgo(1),
    role: 'Principal Product Designer',
    department: 'Design Systems',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Rivera',
    avatar: createAvatarSvg('Marcus Rivera', '#0891b2'),
    status: 'online',
    lastSeen: minsAgo(4),
    role: 'Distributed Systems Lead',
    department: 'Core Infrastructure',
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    avatar: createAvatarSvg('Priya Patel', '#db2777'),
    status: 'away',
    lastSeen: minsAgo(16),
    role: 'Product Manager',
    department: 'Workspace Experience',
  },
  {
    id: 'user-david',
    name: 'David Kim',
    avatar: createAvatarSvg('David Kim', '#059669'),
    status: 'offline',
    lastSeen: hoursAgo(3),
    role: 'Site Reliability Engineer',
    department: 'Cloud Operations',
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    avatar: createAvatarSvg('Elena Rostova', '#6d28d9'),
    status: 'online',
    lastSeen: minsAgo(2),
    role: 'VP of Engineering',
    department: 'Engineering Leadership',
  },
  {
    id: 'user-liam',
    name: "Liam O'Connor",
    avatar: createAvatarSvg("Liam O'Connor", '#2563eb'),
    status: 'offline',
    lastSeen: hoursAgo(20),
    role: 'QA Automation Lead',
    department: 'Quality Engineering',
  },
  {
    id: 'user-nadia',
    name: 'Nadia Al-Mansoor',
    avatar: createAvatarSvg('Nadia Al-Mansoor', '#9333ea'),
    status: 'online',
    lastSeen: minsAgo(5),
    role: 'Frontend Engineer',
    department: 'Platform Engineering',
  },
];

