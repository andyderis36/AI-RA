'use client';

import { useTransition } from 'react';
import { deleteResumeAction } from '@/app/actions/resume';
import { Trash2 } from 'lucide-react';

interface DeleteResumeButtonProps {
  resumeId: string;
}

export function DeleteResumeButton({ resumeId }: DeleteResumeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this resume analysis? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deleteResumeAction(resumeId);
        if (!result.success) {
          alert(result.error || 'Failed to delete resume');
        }
      });
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      aria-label="Delete resume"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.45_0.02_270)] transition-all hover:bg-[oklch(0.65_0.25_25_/_0.15)] hover:text-[oklch(0.75_0.20_25)] disabled:opacity-50"
    >
      {isPending ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
