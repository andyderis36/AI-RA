'use client';

import { useEffect, useRef, useState } from 'react';
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
        <span className="text-xs font-medium text-[oklch(0.60_0.02_270)]">/100</span>
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
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[oklch(0.60_0.02_270)]">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-[oklch(0.50_0.02_270)]">{emptyText}</p>
      ) : (
        <ul className="space-y-2" aria-label={title}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`}
              />
              <span className="text-sm leading-relaxed text-[oklch(0.82_0.01_270)]">
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
  if (!result && !isStreaming) return null;

  const scoreLabel =
    result?.overallScore !== undefined
      ? result.overallScore >= 80
        ? 'Excellent'
        : result.overallScore >= 60
          ? 'Good'
          : 'Needs Work'
      : null;

  return (
    <section
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
          <span className="rounded-xl border border-[oklch(0.65_0.25_270_/_0.25)] bg-[oklch(0.65_0.25_270_/_0.15)] px-3 py-1 text-sm font-medium text-[oklch(0.80_0.20_270)]">
            {scoreLabel}
          </span>
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
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[oklch(0.55_0.02_270)]">
            AI Summary
          </p>
          {result?.summary ? (
            <p className="text-sm leading-relaxed text-[oklch(0.82_0.01_270)]">
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
              <p className="mt-3 text-xs text-[oklch(0.60_0.02_270)]">
                <span className="font-medium text-[oklch(0.75_0.02_270)]">
                  Experience:
                </span>{' '}
                ~{result.experienceYears} year
                {result.experienceYears !== 1 ? 's' : ''}
              </p>
            )}
          {result?.educationLevel && (
            <p className="mt-1 text-xs text-[oklch(0.60_0.02_270)]">
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
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[oklch(0.60_0.02_270)]">
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
              <p className="mb-1.5 text-xs text-[oklch(0.55_0.02_270)]">Matched</p>
              <div className="flex flex-wrap gap-1.5" aria-label="Matched keywords">
                {result.keywordMatch.matched.map((kw) => (
                  <KeywordBadge key={kw} label={kw} variant="matched" />
                ))}
              </div>
            </div>
          )}
          {result.keywordMatch.missing.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs text-[oklch(0.55_0.02_270)]">Missing</p>
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
    </section>
  );
}
