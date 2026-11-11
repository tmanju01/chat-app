import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { GroupDetails } from '../../types';

interface EditGroupFormValues {
  name: string;
  description: string;
}

interface EditGroupModalProps {
  group: GroupDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { name: string; description: string }) => Promise<void>;
}

export function EditGroupModal({
  group,
  isOpen,
  onClose,
  onSave,
}: EditGroupModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditGroupFormValues>({
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: group?.name ?? '',
      description: group?.description ?? '',
    });
  }, [group, reset]);

  if (!isOpen || !group) return null;

  const onSubmit = async (values: EditGroupFormValues) => {
    await onSave({
      name: values.name.trim(),
      description: values.description.trim(),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Team Space"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="nx-scrollbar max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#121520]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Edit Team Space
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit space modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Space name
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Space name is required.',
                validate: (v) =>
                  v.trim().length >= 2 || 'Space name must be at least 2 characters.',
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
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-100 dark:focus:bg-[#0B0D14]"
            />
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
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

