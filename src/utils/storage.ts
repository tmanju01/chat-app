export const STORAGE_KEYS = {
  THEME: 'nexora_theme_mode',
  CONVERSATIONS: 'nexora_conversations',
  MESSAGES: 'nexora_messages',
  GROUPS: 'nexora_groups',
  SELECTED_CONVERSATION: 'nexora_selected_conversation',
} as const;

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or restricted storage errors gracefully
  }
}
