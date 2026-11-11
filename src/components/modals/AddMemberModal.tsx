import { UserPlus, X } from 'lucide-react';
import type { User } from '../../types';
import { Avatar } from '../common/Avatar';

interface AddMemberModalProps {
  isOpen: boolean;
  groupName: string;
  availableUsers: User[];
  onClose: () => void;
  onAddMember: (userId: string) => Promise<void>;
}

export function AddMemberModal({
  isOpen,
  groupName,
  availableUsers,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add Space member"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="nx-scrollbar max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#121520]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Add member
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invite teammates to {groupName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add member modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="nx-scrollbar mt-4 max-h-72 space-y-1.5 overflow-y-auto">
          {availableUsers.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Every workspace member is already part of this Space.
            </p>
          ) : (
            availableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 dark:border-white/5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    status={user.status}
                    showStatus
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {user.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {user.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await onAddMember(user.id);
                    onClose();
                  }}
                  style={{ backgroundColor: 'var(--nx-accent-600)' }}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

