import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createGroup } from '../../features/conversations/conversationSlice';
import {
  selectAllOtherUsers,
  selectCurrentUserId,
} from '../../features/groups/groupSelectors';
import { Avatar } from '../common/Avatar';

interface NewGroupFormValues {
  name: string;
  description: string;
  memberIds: string[];
}

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (groupName: string) => void;
}

export function NewGroupModal({
  isOpen,
  onClose,
  onCreated,
}: NewGroupModalProps) {
  const dispatch = useAppDispatch();
  const otherUsers = useAppSelector(selectAllOtherUsers);
  const currentUserId = useAppSelector(selectCurrentUserId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewGroupFormValues>({
    defaultValues: {
      name: '',
      description: '',
      memberIds: [],
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: NewGroupFormValues) => {
    await dispatch(
      createGroup({
        name: values.name,
        description: values.description,
        memberIds: values.memberIds,
        createdBy: currentUserId,
      })
    ).unwrap();
    reset();
    onCreated?.(values.name.trim());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create group"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="nx-scrollbar max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#121520]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Create group
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new group modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Group name
            </label>
            <input
              type="text"
              placeholder="e.g. Design Systems Guild"
              {...register('name', {
                required: 'Group name is required.',
                validate: (v) =>
                  v.trim().length >= 2 || 'Group name must be at least 2 characters.',
              })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-100 dark:focus:bg-[#0B0D14]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="What is this group about?"
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-100 dark:focus:bg-[#0B0D14]"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              Select members
            </p>
            <div className="nx-scrollbar max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-white/10">
              {otherUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    value={user.id}
                    {...register('memberIds', {
                      validate: (ids) =>
                        (ids && ids.length > 0) || 'Select at least one member.',
                    })}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.memberIds && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {errors.memberIds.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: 'var(--nx-accent-600)' }}
              className="rounded-xl px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
