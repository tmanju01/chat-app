import { useState } from 'react';
import type { UserStatus } from '../../types';
import { getInitials } from '../../utils/messageUtils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  name: string;
  status?: UserStatus;
  showStatus?: boolean;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-16 w-16 text-lg',
};

const DOT_SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3 w-3 border-2',
  xl: 'h-3.5 w-3.5 border-2',
};

const STATUS_COLORS: Record<UserStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-slate-400 dark:bg-slate-600',
};

export function Avatar({
  src,
  name,
  status = 'offline',
  showStatus = false,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src && !imgFailed ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgFailed(true)}
          className={`${SIZE_CLASSES[size]} rounded-xl object-cover ring-1 ring-slate-900/10 dark:ring-white/10`}
        />
      ) : (
        <div
          aria-label={name}
          style={{ backgroundColor: 'var(--nx-accent-600)' }}
          className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-xl font-semibold text-white`}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          aria-label={`Status: ${status}`}
          className={`absolute -right-0.5 -bottom-0.5 rounded-full border-white dark:border-[#121520] ${DOT_SIZE_CLASSES[size]} ${STATUS_COLORS[status]}`}
        />
      )}
    </div>
  );
}

