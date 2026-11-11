export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  lastSeen: string;
  role: string;
  department?: string;
}
