import { Briefcase, Building2, Clock, Layers, Star, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/common/Avatar';
import { formatLastSeen } from '../../../utils/dateUtils';
import { selectSelectedConversation } from '../../conversations/conversationSelectors';
import { toggleConversationPriority } from '../../conversations/conversationSlice';
import { selectAllGroups, selectDirectChatPeer } from '../groupSelectors';
import { setInfoPanelOpen } from '../groupSlice';

export function ContactInfoPanel() {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectSelectedConversation);
  const peer = useAppSelector(selectDirectChatPeer);
  const allGroups = useAppSelector(selectAllGroups);

  if (!conversation || conversation.type !== 'individual' || !peer) {
    return null;
  }

  const sharedSpaces = allGroups.filter((g) => g.members.includes(peer.id));

  return (
    <aside
      aria-label="Contact information"
      className="flex h-full w-full flex-col border-l border-slate-200 bg-white dark:border-white/10 dark:bg-[#121520]"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Contact Info
        </h3>
        <button
          type="button"
          onClick={() => dispatch(setInfoPanelOpen(false))}
          aria-label="Close contact info"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="nx-scrollbar flex-1 space-y-5 overflow-y-auto p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={peer.avatar}
            name={peer.name}
            status={peer.status}
            showStatus
            size="xl"
          />
          <h4 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            {peer.name}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500 capitalize dark:text-slate-400">
            {peer.status}
          </p>

          <button
            type="button"
            onClick={() => dispatch(toggleConversationPriority(conversation.id))}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              conversation.isPriority
                ? 'border-amber-400/50 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                conversation.isPriority ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
            {conversation.isPriority ? 'Priority thread' : 'Mark as priority'}
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-[#161A27]">
          <div className="flex items-center gap-2.5 text-xs">
            <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                Role
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {peer.role}
              </p>
            </div>
          </div>

          {peer.department && (
            <div className="flex items-center gap-2.5 text-xs">
              <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  Department
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {peer.department}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-xs">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                Activity
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {peer.status === 'online'
                  ? 'Active now'
                  : formatLastSeen(peer.lastSeen)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Shared Team Spaces ({sharedSpaces.length})
          </p>
          {sharedSpaces.length === 0 ? (
            <p className="text-xs text-slate-400">No shared spaces yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {sharedSpaces.map((space) => (
                <li
                  key={space.id}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2 text-xs dark:border-white/5"
                >
                  <Layers
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--nx-accent-500)' }}
                  />
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {space.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

