'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DeleteResumeButton } from './DeleteResumeButton';
import { AnalysisResult } from './AnalysisResult';
import type { AIAnalysisResult } from '@/types/resume';
import { X } from 'lucide-react';

interface HistoryItem {
  _id: string;
  fileName: string;
  createdAt: string;
  score: number | null;
  status: string;
  jobDescription?: string;
  analysis?: AIAnalysisResult | null;
}

interface ResumeHistoryListProps {
  resumes: HistoryItem[];
}

export function ResumeHistoryList({ resumes }: ResumeHistoryListProps) {
  const [selectedResume, setSelectedResume] = useState<HistoryItem | null>(null);

  const handleOpenDetail = (resume: HistoryItem) => {
    if (resume.status === 'completed' && resume.analysis) {
      setSelectedResume(resume);
    }
  };

  const handleCloseDetail = () => {
    setSelectedResume(null);
  };

  return (
    <div className="resume-history-section">
      <div className="grid gap-4 sm:grid-cols-2">
        {resumes.map((resume) => {
          const score = resume.score ?? 0;
          const isCompleted = resume.status === 'completed';
          
          // Determine color based on score
          let colorClass = 'text-[oklch(0.65_0.25_25)]'; 
          let bgGlow = 'bg-[oklch(0.65_0.25_25_/_0.15)]';
          let borderGlow = 'border-[oklch(0.65_0.25_25_/_0.30)]';
          
          if (score >= 80) {
            colorClass = 'text-[oklch(0.72_0.20_155)]';
            bgGlow = 'bg-[oklch(0.72_0.20_155_/_0.15)]';
            borderGlow = 'border-[oklch(0.72_0.20_155_/_0.30)]';
          } else if (score >= 60) {
            colorClass = 'text-[oklch(0.80_0.18_85)]';
            bgGlow = 'bg-[oklch(0.80_0.18_85_/_0.15)]';
            borderGlow = 'border-[oklch(0.80_0.18_85_/_0.30)]';
          }

          if (resume.status === 'processing') {
            colorClass = 'text-[oklch(0.65_0.25_270)]';
            bgGlow = 'bg-[oklch(0.65_0.25_270_/_0.15)]';
            borderGlow = 'border-[oklch(0.65_0.25_270_/_0.30)]';
          }

          return (
            <div
              key={resume._id}
              onClick={() => handleOpenDetail(resume)}
              className={[
                'group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.15_0.02_270_/_0.40)] p-4 backdrop-blur-xl transition-all',
                isCompleted ? 'cursor-pointer hover:bg-[oklch(0.20_0.03_270_/_0.50)] hover:border-[oklch(0.65_0.25_270_/_0.30)]' : 'cursor-default'
              ].join(' ')}
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
                <div className="ml-2 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
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

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[oklch(0.05_0.02_270_/_0.85)] backdrop-blur-md transition-opacity"
            onClick={handleCloseDetail}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[oklch(0.80_0.02_270_/_0.20)] bg-[oklch(0.12_0.03_270)] p-6 shadow-2xl transition-all sm:p-8">
            <div className="sticky top-0 z-10 -mt-2 mb-4 flex items-center justify-between bg-[oklch(0.12_0.03_270_/_0.8)] backdrop-blur-sm py-2">
              <div>
                <h3 className="text-xl font-bold text-[oklch(0.95_0.01_270)]">
                  Analysis Detail
                </h3>
                <p className="text-sm text-[oklch(0.60_0.02_270)]">
                  {selectedResume.fileName} • {formatDistanceToNow(new Date(selectedResume.createdAt), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="rounded-full p-2 text-[oklch(0.60_0.02_270)] hover:bg-[oklch(0.20_0.03_270_/_0.50)] hover:text-[oklch(0.95_0.01_270)]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">
              <AnalysisResult result={selectedResume.analysis!} isStreaming={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
