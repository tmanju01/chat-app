import { UserMinus } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import type { User } from '../../../types';

interface GroupMemberListProps {
  members: User[];
  currentUserId: string;
  onRemoveMember: (userId: string) => void;
}

export function GroupMemberList({
  members,
  currentUserId,
  onRemoveMember,
}: GroupMemberListProps) {
  return (
    <ul className="space-y-1.5" aria-label="Group members">
      {members.map((member) => {
        const isSelf = member.id === currentUserId;
        return (
          <li
            key={member.id}
            className="flex items-center justify-between gap-2.5 rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar
                src={member.avatar}
                name={member.name}
                status={member.status}
                showStatus
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {member.name}
                  {isSelf && (
                    <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                      (You)
                    </span>
                  )}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {member.role}
                  {member.department ? ` • ${member.department}` : ''}
                </p>
              </div>
            </div>

            {!isSelf && members.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveMember(member.id)}
                aria-label={`Remove ${member.name} from group`}
                title={`Remove ${member.name}`}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
              >
                <UserMinus className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

