import { getResumeHistoryAction } from '@/app/actions/resume';
import { ResumeHistoryList } from './ResumeHistoryList';

export async function ResumeHistory() {
  const historyResult = await getResumeHistoryAction();

  if (!historyResult.success || !historyResult.data || historyResult.data.length === 0) {
    return null; // Don't show history section if there's no history
  }

  const resumes = historyResult.data;

  return (
    <section className="mt-12 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[oklch(0.95_0.01_270)]">
          Recent Analyses
        </h2>
        <span className="rounded-full bg-[oklch(0.20_0.03_270_/_0.60)] px-3 py-1 text-xs font-medium text-[oklch(0.70_0.02_270)]">
          {resumes.length} {resumes.length === 1 ? 'Document' : 'Documents'}
        </span>
      </div>

      <ResumeHistoryList resumes={resumes as any} />
    </section>
  );
}

