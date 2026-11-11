const isTestEnv =
  typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';

export function simulateLatency(ms = 180): Promise<void> {
  const duration = isTestEnv ? 10 : ms;
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

