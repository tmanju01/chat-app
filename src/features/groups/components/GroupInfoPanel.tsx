import { useState } from 'react';
import { Pencil, UserPlus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/common/Avatar';
import { AddMemberModal } from '../../../components/modals/AddMemberModal';
import { EditGroupModal } from '../../../components/modals/EditGroupModal';
import {
  selectActiveGroupDetails,
  selectActiveGroupMembers,
  selectCurrentUserId,
  selectUsersById,
} from '../groupSelectors';
import {
  addGroupMemberThunk,
  removeGroupMemberThunk,
  setInfoPanelOpen,
  updateGroupDetailsThunk,
} from '../groupSlice';
import { GroupMemberList } from './GroupMemberList';

interface GroupInfoPanelProps {
  onShowToast: (msg: string) => void;
}

export function GroupInfoPanel({ onShowToast }: GroupInfoPanelProps) {
  const dispatch = useAppDispatch();
  const group = useAppSelector(selectActiveGroupDetails);
  const members = useAppSelector(selectActiveGroupMembers);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const usersById = useAppSelector(selectUsersById);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!group) return null;

  const availableUsers = Object.values(usersById).filter(
    (u) => !group.members.includes(u.id)
  );
  const onlineCount = members.filter((m) => m.status === 'online').length;

  const handleAddMember = async (userId: string) => {
    await dispatch(addGroupMemberThunk({ groupId: group.id, userId })).unwrap();
    const addedUser = usersById[userId];
    onShowToast(`${addedUser?.name ?? 'Member'} added to ${group.name}`);
  };

  const handleRemoveMember = async (userId: string) => {
    const removedUser = usersById[userId];
    await dispatch(removeGroupMemberThunk({ groupId: group.id, userId })).unwrap();
    onShowToast(`${removedUser?.name ?? 'Member'} removed from ${group.name}`);
  };

  const handleUpdateDetails = async (values: {
    name: string;
    description: string;
  }) => {
    await dispatch(
      updateGroupDetailsThunk({
        groupId: group.id,
        name: values.name,
        description: values.description,
      })
    ).unwrap();
    onShowToast('Team Space details updated');
  };

  return (
    <aside
      aria-label="Group information"
      className="flex h-full w-full flex-col border-l border-slate-200 bg-white dark:border-white/10 dark:bg-[#121520]"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Space Details
        </h3>
        <button
          type="button"
          onClick={() => dispatch(setInfoPanelOpen(false))}
          aria-label="Close group info"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="nx-scrollbar flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar src={group.avatar} name={group.name} size="xl" />
          <h4 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            {group.name}
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {members.length} members • {onlineCount} online
          </p>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Pencil className="h-3 w-3" />
            Edit Space details
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-[#161A27]">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
            Description
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {group.description || 'No description provided for this Space.'}
          </p>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Members ({members.length})
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              style={{ color: 'var(--nx-accent-500)' }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add member
            </button>
          </div>

          <GroupMemberList
            members={members}
            currentUserId={currentUserId}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        groupName={group.name}
        availableUsers={availableUsers}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />

      <EditGroupModal
        group={group}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateDetails}
      />
    </aside>
  );
}

