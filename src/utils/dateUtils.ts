const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
});

export function isSameDay(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMessageTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso));
}

export function formatDateSeparator(iso: string, now = new Date()): string {
  const target = new Date(iso);
  const todayIso = now.toISOString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(iso, todayIso)) {
    return 'Today';
  }
  if (isSameDay(iso, yesterday.toISOString())) {
    return 'Yesterday';
  }
  return FULL_DATE_FORMATTER.format(target);
}

export function formatConversationTime(iso: string, now = new Date()): string {
  const target = new Date(iso);
  if (isSameDay(iso, now.toISOString())) {
    return TIME_FORMATTER.format(target);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(iso, yesterday.toISOString())) {
    return 'Yesterday';
  }

  const diffDays = Math.floor(
    (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 7) {
    return WEEKDAY_FORMATTER.format(target);
  }

  return SHORT_DATE_FORMATTER.format(target);
}

export function formatLastSeen(iso: string, now = new Date()): string {
  const target = new Date(iso);
  const time = TIME_FORMATTER.format(target);

  if (isSameDay(iso, now.toISOString())) {
    return `last seen today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(iso, yesterday.toISOString())) {
    return `last seen yesterday at ${time}`;
  }

  return `last seen ${SHORT_DATE_FORMATTER.format(target)} at ${time}`;
}

