'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { AIAnalysisResult } from '@/types/resume';

// ─── Animated Counter ─────────────────────────────────────────────────────────
function useCountUp(target: number | undefined, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === undefined) return;

    const startTime = performance.now();
    const startVal = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const animatedScore = useCountUp(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeProgress = ((100 - animatedScore) / 100) * circumference;

  const scoreColor =
    score >= 80
      ? 'oklch(0.72 0.20 155)' // green
      : score >= 60
        ? 'oklch(0.80 0.18 85)' // amber
        : 'oklch(0.65 0.25 25)'; // red

  return (
    <div className="relative flex h-36 w-36 items-center justify-center" role="img" aria-label={`Overall resume score: ${score} out of 100`}>
      <svg
        className="-rotate-90"
        width="136"
        height="136"
        viewBox="0 0 136 136"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="none"
          stroke="oklch(0.25 0.03 270 / 0.5)"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeProgress}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color: scoreColor }}
        >
          {animatedScore}
        </span>
        <span className="text-xs font-semibold text-[oklch(0.80_0.02_270)]">/100</span>
      </div>
    </div>
  );
}

// ─── Keyword Badge ─────────────────────────────────────────────────────────────
function KeywordBadge({
  label,
  variant,
}: {
  label: string;
  variant: 'matched' | 'missing';
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all',
        variant === 'matched'
          ? 'border border-[oklch(0.72_0.20_155_/_0.30)] bg-[oklch(0.72_0.20_155_/_0.12)] text-[oklch(0.75_0.18_155)]'
          : 'border border-[oklch(0.65_0.25_25_/_0.30)] bg-[oklch(0.65_0.25_25_/_0.12)] text-[oklch(0.75_0.20_25)]',
      ].join(' ')}
    >
      <span aria-hidden="true">{variant === 'matched' ? '✓' : '✗'}</span>
      {label}
    </span>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────
function ListCard({
  title,
  items,
  variant,
  emptyText = 'None detected',
}: {
  title: string;
  items: string[];
  variant: 'strength' | 'weakness' | 'suggestion' | 'skill';
  emptyText?: string;
}) {
  const styles: Record<typeof variant, { dot: string; border: string; glow: string }> = {
    strength: {
      dot: 'bg-[oklch(0.72_0.20_155)]',
      border: 'border-[oklch(0.72_0.20_155_/_0.15)]',
      glow: '',
    },
    weakness: {
      dot: 'bg-[oklch(0.65_0.25_25)]',
      border: 'border-[oklch(0.65_0.25_25_/_0.15)]',
      glow: '',
    },
    suggestion: {
      dot: 'bg-[oklch(0.65_0.25_270)]',
      border: 'border-[oklch(0.65_0.25_270_/_0.15)]',
      glow: '',
    },
    skill: {
      dot: 'bg-[oklch(0.75_0.18_180)]',
      border: 'border-[oklch(0.75_0.18_180_/_0.15)]',
      glow: '',
    },
  };

  const s = styles[variant];

  return (
    <div
      className={[
        'rounded-2xl border backdrop-blur-xl',
        'bg-[oklch(0.15_0.02_270_/_0.55)] p-5',
        s.border,
      ].join(' ')}
    >
      <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-[oklch(0.85_0.02_270)]">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm font-medium text-[oklch(0.70_0.02_270)]">{emptyText}</p>
      ) : (
        <ul className="space-y-2" aria-label={title}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`}
              />
              <span className="text-sm leading-relaxed text-[oklch(0.95_0.01_270)]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-[oklch(0.80_0.02_270_/_0.10)] bg-[oklch(0.15_0.02_270_/_0.40)] p-5 backdrop-blur-xl">
      <div className="mb-3 h-3 w-24 animate-pulse rounded-full bg-[oklch(0.25_0.02_270_/_0.60)]" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-full bg-[oklch(0.20_0.02_270_/_0.50)]"
            style={{ width: `${70 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface AnalysisResultProps {
  /** Partial data from streaming (fields arrive progressively) */
  result: Partial<AIAnalysisResult> | null;
  /** True while streaming is in progress */
  isStreaming?: boolean;
}

export function AnalysisResult({ result, isStreaming = false }: AnalysisResultProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!result && !isStreaming) return null;

  const scoreLabel =
    result?.overallScore !== undefined
      ? result.overallScore >= 80
        ? 'Excellent'
        : result.overallScore >= 60
          ? 'Good'
          : 'Needs Work'
      : null;

  /**
   * Captures a clean document template as a PDF using native window.print().
   * This completely avoids 'html2canvas' OKLCH parser crashes with Tailwind v4.
   */
  const handleDownloadPDF = () => {
    if (!pdfRef.current || isExporting) return;
    setIsExporting(true);
    
    const templateNode = pdfRef.current;
    const originalParent = templateNode.parentElement;
    const originalNextSibling = templateNode.nextSibling;

    // Move to body to isolate it for printing
    document.body.appendChild(templateNode);
    document.body.classList.add('print-active');

    // Trigger print dialog (gives time for DOM to update)
    setTimeout(() => {
      window.print();

      // Cleanup & restore DOM
      document.body.classList.remove('print-active');
      if (originalNextSibling) {
        originalParent?.insertBefore(templateNode, originalNextSibling);
      } else {
        originalParent?.appendChild(templateNode);
      }
      
      setIsExporting(false);
    }, 150);
  };

  return (
    <section
      ref={sectionRef}
      aria-label="AI Analysis Results"
      aria-live="polite"
      aria-busy={isStreaming}
      className="mt-8 space-y-6"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[oklch(0.95_0.01_270)]">
            Analysis Results
          </h2>
          {isStreaming && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[oklch(0.80_0.18_85)]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[oklch(0.80_0.18_85)]" aria-hidden="true" />
              AI is still analyzing…
            </p>
          )}
        </div>
        {result?.overallScore !== undefined && scoreLabel && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              aria-label="Download analysis as PDF"
              className="flex items-center gap-2 rounded-xl border border-[oklch(0.72_0.20_155_/_0.30)] bg-[oklch(0.72_0.20_155_/_0.12)] px-3 py-1.5 text-sm font-medium text-[oklch(0.75_0.18_155)] transition-all hover:bg-[oklch(0.72_0.20_155_/_0.20)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Exporting…' : 'Download PDF'}
            </button>
            <span className="rounded-xl border border-[oklch(0.65_0.25_270_/_0.25)] bg-[oklch(0.65_0.25_270_/_0.12)] px-3 py-1.5 text-sm font-medium text-[oklch(0.80_0.20_270)]">
              {scoreLabel}
            </span>
          </div>
        )}
      </div>

      {/* ── Score + Summary ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.15_0.02_270_/_0.60)] p-6 backdrop-blur-xl sm:flex-row">
        {result?.overallScore !== undefined ? (
          <ScoreRing score={result.overallScore} />
        ) : (
          <div className="h-36 w-36 animate-pulse rounded-full bg-[oklch(0.20_0.03_270_/_0.50)]" aria-label="Score loading" />
        )}
        <div className="flex-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[oklch(0.80_0.02_270)]">
            AI Summary
          </p>
          {result?.summary ? (
            <p className="text-sm font-medium leading-relaxed text-[oklch(0.95_0.01_270)]">
              {result.summary}
            </p>
          ) : (
            <div className="space-y-2">
              {[100, 85, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded-full bg-[oklch(0.20_0.03_270_/_0.50)]"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}
          {result?.experienceYears !== undefined &&
            result.experienceYears !== null && (
              <p className="mt-3 text-xs text-[oklch(0.85_0.02_270)]">
                <span className="font-medium text-[oklch(0.75_0.02_270)]">
                  Experience:
                </span>{' '}
                ~{result.experienceYears} year
                {result.experienceYears !== 1 ? 's' : ''}
              </p>
            )}
          {result?.educationLevel && (
            <p className="mt-1 text-xs text-[oklch(0.85_0.02_270)]">
              <span className="font-medium text-[oklch(0.75_0.02_270)]">
                Education:
              </span>{' '}
              {result.educationLevel}
            </p>
          )}
        </div>
      </div>

      {/* ── Keyword Match ────────────────────────────────────────────────── */}
      {result?.keywordMatch ? (
        <div className="rounded-2xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.15_0.02_270_/_0.55)] p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[oklch(0.85_0.02_270)]">
              Keyword Match
            </h3>
            <span className="text-sm font-semibold text-[oklch(0.80_0.20_270)]">
              {result.keywordMatch.score}%
            </span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-[oklch(0.20_0.03_270_/_0.60)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.75_0.18_180)] transition-all duration-1000 ease-out"
              style={{ width: `${result.keywordMatch.score}%` }}
              role="presentation"
            />
          </div>
          {result.keywordMatch.matched.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold text-[oklch(0.75_0.02_270)]">Matched</p>
              <div className="flex flex-wrap gap-1.5" aria-label="Matched keywords">
                {result.keywordMatch.matched.map((kw) => (
                  <KeywordBadge key={kw} label={kw} variant="matched" />
                ))}
              </div>
            </div>
          )}
          {result.keywordMatch.missing.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[oklch(0.75_0.02_270)]">Missing</p>
              <div className="flex flex-wrap gap-1.5" aria-label="Missing keywords">
                {result.keywordMatch.missing.map((kw) => (
                  <KeywordBadge key={kw} label={kw} variant="missing" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isStreaming ? (
        <SkeletonCard lines={4} />
      ) : null}

      {/* ── 4-Column Grid ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Strengths */}
        {result?.strengths ? (
          <ListCard
            title="Strengths"
            items={result.strengths}
            variant="strength"
          />
        ) : isStreaming ? (
          <SkeletonCard lines={3} />
        ) : null}

        {/* Weaknesses */}
        {result?.weaknesses ? (
          <ListCard
            title="Areas to Improve"
            items={result.weaknesses}
            variant="weakness"
          />
        ) : isStreaming ? (
          <SkeletonCard lines={3} />
        ) : null}

        {/* Suggestions */}
        {result?.suggestions ? (
          <ListCard
            title="Suggestions"
            items={result.suggestions}
            variant="suggestion"
          />
        ) : isStreaming ? (
          <SkeletonCard lines={3} />
        ) : null}

        {/* Skills */}
        {result?.skillsDetected ? (
          <ListCard
            title="Detected Skills"
            items={result.skillsDetected}
            variant="skill"
          />
        ) : isStreaming ? (
          <SkeletonCard lines={3} />
        ) : null}
      </div>

      {/* ── Hidden Print Template ─────────────────────────────────────── */}
      {/* This renders off-screen and is used ONLY for PDF generation */}
      {result && (
        <>
          <style>{`
            @media print {
              body.print-active > *:not(#print-template) {
                display: none !important;
              }
              body.print-active {
                background-color: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #print-template {
                display: block !important;
                position: static !important;
                left: auto !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 2cm !important;
                margin: 0 auto !important;
                background-color: white !important;
                color: black !important;
                font-family: ui-sans-serif, system-ui, sans-serif !important;
              }
              /* Ensure backgrounds and borders print correctly */
              #print-template * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Avoid awkward page breaks inside elements */
              #print-template .break-inside-avoid {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          `}</style>
          
          <div 
            id="print-template"
            ref={pdfRef} 
            className="hidden absolute left-[-9999px] top-0 bg-white text-black font-sans"
            style={{ width: '800px', padding: '40px' }}
          >
          {/* Header */}
          <div className="border-b-2 border-gray-200 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Resume Analysis Report</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Score & Summary */}
          <div className="flex gap-8 mb-8">
            <div className="shrink-0 flex flex-col items-center">
              <div 
                className="w-28 h-28 rounded-full border-[6px] flex items-center justify-center text-4xl font-bold"
                style={{ 
                  borderColor: result.overallScore !== undefined 
                    ? result.overallScore >= 80 ? '#16a34a' 
                    : result.overallScore >= 60 ? '#d97706' 
                    : '#dc2626' : '#e5e7eb',
                  color: result.overallScore !== undefined 
                    ? result.overallScore >= 80 ? '#16a34a' 
                    : result.overallScore >= 60 ? '#d97706' 
                    : '#dc2626' : '#9ca3af'
                }}
              >
                {result.overallScore ?? '-'}
              </div>
              <span className="text-xs text-gray-500 font-semibold uppercase mt-2 tracking-widest">
                ATS Score
              </span>
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide text-sm border-b pb-1">Executive Summary</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {result.summary || 'No summary available.'}
              </p>
              
              <div className="mt-4 flex gap-6">
                {result.experienceYears !== undefined && result.experienceYears !== null && (
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Experience</span>
                    <span className="text-sm text-gray-900 font-medium">~{result.experienceYears} Years</span>
                  </div>
                )}
                {result.educationLevel && (
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Education</span>
                    <span className="text-sm text-gray-900 font-medium">{result.educationLevel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Keyword Match */}
          {result.keywordMatch && (
            <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Keyword Match</h2>
                <span className="font-bold text-lg" style={{ color: result.keywordMatch.score >= 80 ? '#16a34a' : result.keywordMatch.score >= 60 ? '#d97706' : '#dc2626' }}>
                  {result.keywordMatch.score}%
                </span>
              </div>
              
              {result.keywordMatch.matched?.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Matched Keywords</span>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordMatch.matched.map((kw) => (
                      <span key={kw} className="bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-md text-xs font-medium">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {result.keywordMatch.missing?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Missing Keywords</span>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordMatch.missing.map((kw) => (
                      <span key={kw} className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-md text-xs font-medium">
                        ✗ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Two-column analysis grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {result.strengths && result.strengths.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-green-700 uppercase tracking-wide border-b border-green-200 pb-1 mb-3">Strengths</h2>
                  <ul className="space-y-2">
                    {result.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.weaknesses && result.weaknesses.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide border-b border-red-200 pb-1 mb-3">Areas to Improve</h2>
                  <ul className="space-y-2">
                    {result.weaknesses.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-purple-700 uppercase tracking-wide border-b border-purple-200 pb-1 mb-3">Actionable Suggestions</h2>
                  <ul className="space-y-2">
                    {result.suggestions.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.skillsDetected && result.skillsDetected.length > 0 && (
                <div className="break-inside-avoid">
                  <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-200 pb-1 mb-3">Detected Skills</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skillsDetected.map((item, i) => (
                      <span key={i} className="bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </section>
  );
}
