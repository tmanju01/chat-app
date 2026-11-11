import { MessageSquarePlus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startDirectConversation } from '../../features/conversations/conversationSlice';
import {
  selectAllOtherUsers,
  selectCurrentUserId,
} from '../../features/groups/groupSelectors';
import { Avatar } from '../common/Avatar';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
}: NewConversationModalProps) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllOtherUsers);
  const currentUserId = useAppSelector(selectCurrentUserId);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New conversation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="nx-scrollbar max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#121520]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              New conversation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a teammate to start chatting
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new conversation modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="nx-scrollbar mt-4 max-h-80 space-y-1.5 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={async () => {
                await dispatch(
                  startDirectConversation({ targetUser: user, currentUserId })
                );
                onClose();
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  status={user.status}
                  showStatus
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.role}
                  </p>
                </div>
              </div>
              <MessageSquarePlus
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--nx-accent-500)' }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
