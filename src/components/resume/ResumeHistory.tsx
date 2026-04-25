import { getResumeHistoryAction } from '@/app/actions/resume';
import { formatDistanceToNow } from 'date-fns';
import { DeleteResumeButton } from './DeleteResumeButton';

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

      <div className="grid gap-4 sm:grid-cols-2">
        {resumes.map((resume) => {
          const score = resume.score ?? 0;
          
          // Determine color based on score (similar to AnalysisResult)
          let colorClass = 'text-[oklch(0.65_0.25_25)]'; // Red
          let bgGlow = 'bg-[oklch(0.65_0.25_25_/_0.15)]';
          let borderGlow = 'border-[oklch(0.65_0.25_25_/_0.30)]';
          
          if (score >= 80) {
            colorClass = 'text-[oklch(0.72_0.20_155)]'; // Green
            bgGlow = 'bg-[oklch(0.72_0.20_155_/_0.15)]';
            borderGlow = 'border-[oklch(0.72_0.20_155_/_0.30)]';
          } else if (score >= 60) {
            colorClass = 'text-[oklch(0.80_0.18_85)]'; // Yellow/Orange
            bgGlow = 'bg-[oklch(0.80_0.18_85_/_0.15)]';
            borderGlow = 'border-[oklch(0.80_0.18_85_/_0.30)]';
          }

          if (resume.status === 'processing') {
            colorClass = 'text-[oklch(0.65_0.25_270)]'; // Purple
            bgGlow = 'bg-[oklch(0.65_0.25_270_/_0.15)]';
            borderGlow = 'border-[oklch(0.65_0.25_270_/_0.30)]';
          }

          return (
            <div
              key={resume._id}
              className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.15_0.02_270_/_0.40)] p-4 backdrop-blur-xl transition-all hover:bg-[oklch(0.20_0.03_270_/_0.50)]"
            >
              {/* Info */}
              <div className="flex flex-1 items-center justify-between truncate">
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-medium text-[oklch(0.90_0.02_270)]">
                    {resume.fileName}
                  </span>
                  <span className="mt-1 text-xs text-[oklch(0.60_0.02_270)]">
                    {formatDistanceToNow(new Date(resume.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                
                {/* Delete Button (visible on hover) */}
                <div className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <DeleteResumeButton resumeId={resume._id} />
                </div>
              </div>

              {/* Score Ring / Status */}
              <div className="shrink-0">
                {resume.status === 'completed' ? (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${bgGlow} ${borderGlow}`}>
                    <span className={`text-sm font-bold ${colorClass}`}>
                      {score}
                    </span>
                  </div>
                ) : resume.status === 'processing' ? (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border animate-pulse ${bgGlow} ${borderGlow}`}>
                    <svg className={`h-5 w-5 animate-spin ${colorClass}`} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${bgGlow} ${borderGlow}`}>
                    <span className={`text-sm font-bold ${colorClass}`}>!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
