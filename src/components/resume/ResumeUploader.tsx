'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { z } from 'zod';
import type { AIAnalysisResult, ResumeDocument } from '@/types/resume';

// ─── Client-side file validation schema ────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const FileValidationSchema = z.object({
  name: z.string(),
  size: z
    .number()
    .max(MAX_FILE_SIZE_BYTES, 'File must be smaller than 10 MB.'),
  type: z
    .string()
    .refine(
      (t) =>
        [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/webp',
        ].includes(t),
      'Only PDF, DOCX, or image files (JPG, PNG, WEBP) are accepted.',
    ),
});

// ─── Types ──────────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error';

interface ResumeUploaderProps {
  /** Called when analysis is fully complete */
  onAnalysisComplete?: (
    result: AIAnalysisResult,
    doc: ResumeDocument,
  ) => void;
  /** Optional: Server Actions injected from parent (keeps component decoupled) */
  uploadAction?: (formData: FormData) => Promise<ResumeDocument>;
  analyzeAction?: (resumeId: string) => Promise<{ result: AIAnalysisResult }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fileTypeLabel(type: string): string {
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('docx') || type.includes('wordprocessingml')) return 'DOCX';
  if (type.startsWith('image/')) return 'Image';
  return 'File';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── State Icons ─────────────────────────────────────────────────────────────
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

// ─── State Config ─────────────────────────────────────────────────────────────
const STATE_CONFIG: Record<
  UploadState,
  { label: string; sublabel: string; iconColor: string; borderColor: string; glowColor: string }
> = {
  idle: {
    label: 'Drop your resume here',
    sublabel: 'PDF, DOCX, or Image · Max 10 MB',
    iconColor: 'text-[oklch(0.65_0.25_270)]',
    borderColor: 'border-[oklch(0.80_0.02_270_/_0.20)]',
    glowColor: '',
  },
  uploading: {
    label: 'Uploading…',
    sublabel: 'Sending your file securely',
    iconColor: 'text-[oklch(0.75_0.18_180)]',
    borderColor: 'border-[oklch(0.75_0.18_180_/_0.40)]',
    glowColor: 'shadow-[0_0_40px_oklch(0.75_0.18_180_/_0.20)]',
  },
  analyzing: {
    label: 'AI is analyzing…',
    sublabel: 'Gemini is reading your resume',
    iconColor: 'text-[oklch(0.80_0.18_85)]',
    borderColor: 'border-[oklch(0.80_0.18_85_/_0.40)]',
    glowColor: 'shadow-[0_0_40px_oklch(0.80_0.18_85_/_0.20)]',
  },
  completed: {
    label: 'Analysis complete!',
    sublabel: 'Scroll down to see your results',
    iconColor: 'text-[oklch(0.72_0.20_155)]',
    borderColor: 'border-[oklch(0.72_0.20_155_/_0.40)]',
    glowColor: 'shadow-[0_0_40px_oklch(0.72_0.20_155_/_0.20)]',
  },
  error: {
    label: 'Something went wrong',
    sublabel: 'Please try again',
    iconColor: 'text-[oklch(0.65_0.25_25)]',
    borderColor: 'border-[oklch(0.65_0.25_25_/_0.40)]',
    glowColor: 'shadow-[0_0_40px_oklch(0.65_0.25_25_/_0.15)]',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ResumeUploader({
  onAnalysisComplete,
  uploadAction,
  analyzeAction,
}: ResumeUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const cfg = STATE_CONFIG[uploadState];

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateFile = useCallback((file: File): string | null => {
    const result = FileValidationSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Invalid file.';
    }
    return null;
  }, []);

  // ── Pipeline ─────────────────────────────────────────────────────────────────
  const runPipeline = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setUploadState('error');
        return;
      }

      setValidationError(null);
      setSelectedFile(file);

      // ── Step 1: Upload ────────────────────────────────────────────────────
      setUploadState('uploading');
      setUploadProgress(10);

      let doc: ResumeDocument | null = null;

      if (uploadAction) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          setUploadProgress(40);
          doc = await uploadAction(formData);
          setUploadProgress(100);
        } catch {
          setUploadState('error');
          setValidationError('Upload failed. Please try again.');
          return;
        }
      } else {
        // Stub: simulate progress while BE is not ready
        await new Promise<void>((resolve) => {
          let p = 10;
          const interval = setInterval(() => {
            p = Math.min(p + 15, 95);
            setUploadProgress(p);
            if (p >= 95) {
              clearInterval(interval);
              resolve();
            }
          }, 200);
        });
        setUploadProgress(100);
      }

      // ── Step 2: Analyze ───────────────────────────────────────────────────
      setUploadState('analyzing');
      setUploadProgress(0);

      if (analyzeAction && doc) {
        try {
          const { result } = await analyzeAction(doc._id);
          setUploadState('completed');
          onAnalysisComplete?.(result, doc);
        } catch {
          setUploadState('error');
          setValidationError('Analysis failed. Please try again.');
        }
      } else {
        // Stub: simulate AI analysis delay
        await new Promise<void>((resolve) => {
          let p = 0;
          const interval = setInterval(() => {
            p = Math.min(p + 8, 95);
            setUploadProgress(p);
            if (p >= 95) {
              clearInterval(interval);
              resolve();
            }
          }, 180);
        });
        setUploadProgress(100);
        setUploadState('completed');
      }
    },
    [validateFile, uploadAction, analyzeAction, onAnalysisComplete],
  );

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file && uploadState === 'idle') {
        startTransition(() => {
          runPipeline(file);
        });
      }
    },
    [uploadState, runPipeline],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        startTransition(() => {
          runPipeline(file);
        });
      }
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [runPipeline],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && uploadState === 'idle') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [uploadState],
  );

  const handleReset = useCallback(() => {
    setUploadState('idle');
    setSelectedFile(null);
    setValidationError(null);
    setUploadProgress(0);
  }, []);

  const isActive = uploadState === 'uploading' || uploadState === 'analyzing';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section aria-label="Resume upload" className="w-full">
      {/* ── Drop Zone ────────────────────────────────────────────────────── */}
      <div
        ref={dropZoneRef}
        id="resume-drop-zone"
        role="button"
        tabIndex={uploadState === 'idle' ? 0 : -1}
        aria-label="Drag and drop your resume file here, or press Enter to browse"
        aria-disabled={isActive}
        aria-live="polite"
        aria-busy={isActive}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
        className={[
          'relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-5',
          'overflow-hidden rounded-3xl border-2 backdrop-blur-xl',
          'transition-all duration-500 ease-out',
          // Glassmorphism base
          'bg-[oklch(0.15_0.02_270_/_0.55)]',
          // Dynamic border + glow from state config
          cfg.borderColor,
          cfg.glowColor,
          // Drag-over overlay
          isDragOver
            ? 'scale-[1.02] border-[oklch(0.65_0.25_270_/_0.60)] bg-[oklch(0.20_0.04_270_/_0.65)] shadow-[0_0_60px_oklch(0.65_0.25_270_/_0.25)]'
            : '',
          // Disabled cursor
          isActive ? 'cursor-not-allowed' : 'cursor-pointer',
          // Keyboard focus
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.25_270)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.12_0.03_270)]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Grain texture overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient glow blob */}
        <div
          aria-hidden="true"
          className={[
            'pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl transition-all duration-700',
            uploadState === 'idle'
              ? 'bg-[oklch(0.65_0.25_270_/_0.12)]'
              : uploadState === 'uploading'
                ? 'bg-[oklch(0.75_0.18_180_/_0.18)]'
                : uploadState === 'analyzing'
                  ? 'bg-[oklch(0.80_0.18_85_/_0.18)]'
                  : uploadState === 'completed'
                    ? 'bg-[oklch(0.72_0.20_155_/_0.18)]'
                    : 'bg-[oklch(0.65_0.25_25_/_0.15)]',
          ].join(' ')}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-4 px-8 text-center">
          {/* Icon */}
          <div
            className={[
              'flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-500',
              uploadState === 'idle'
                ? 'border-[oklch(0.65_0.25_270_/_0.25)] bg-[oklch(0.65_0.25_270_/_0.12)]'
                : uploadState === 'uploading'
                  ? 'border-[oklch(0.75_0.18_180_/_0.30)] bg-[oklch(0.75_0.18_180_/_0.15)]'
                  : uploadState === 'analyzing'
                    ? 'border-[oklch(0.80_0.18_85_/_0.30)] bg-[oklch(0.80_0.18_85_/_0.15)]'
                    : uploadState === 'completed'
                      ? 'border-[oklch(0.72_0.20_155_/_0.30)] bg-[oklch(0.72_0.20_155_/_0.15)]'
                      : 'border-[oklch(0.65_0.25_25_/_0.30)] bg-[oklch(0.65_0.25_25_/_0.15)]',
            ].join(' ')}
          >
            {uploadState === 'idle' && (
              <UploadIcon className={`h-7 w-7 ${cfg.iconColor}`} />
            )}
            {(uploadState === 'uploading') && (
              <SpinnerIcon
                className={`h-7 w-7 animate-spin ${cfg.iconColor}`}
              />
            )}
            {uploadState === 'analyzing' && (
              <BrainIcon
                className={`h-7 w-7 animate-pulse ${cfg.iconColor}`}
              />
            )}
            {uploadState === 'completed' && (
              <CheckIcon className={`h-7 w-7 ${cfg.iconColor}`} />
            )}
            {uploadState === 'error' && (
              <span className={`text-2xl font-bold leading-none ${cfg.iconColor}`} aria-hidden="true">!</span>
            )}
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-semibold text-[oklch(0.95_0.01_270)]">
              {cfg.label}
            </p>
            <p className="mt-1 text-sm text-[oklch(0.70_0.02_270)]">
              {validationError ?? cfg.sublabel}
            </p>
          </div>

          {/* Selected file info */}
          {selectedFile && uploadState !== 'idle' && (
            <div className="flex items-center gap-2 rounded-lg border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.20_0.03_270_/_0.40)] px-3 py-1.5">
              <span className="text-xs font-medium text-[oklch(0.65_0.25_270)]">
                {fileTypeLabel(selectedFile.type)}
              </span>
              <span className="text-xs text-[oklch(0.75_0.02_270)] max-w-[200px] truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-[oklch(0.55_0.02_270)]">
                {formatBytes(selectedFile.size)}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {isActive && (
            <div className="w-full max-w-xs" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100} aria-label={uploadState === 'uploading' ? 'Upload progress' : 'Analysis progress'}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[oklch(0.20_0.03_270_/_0.60)]">
                <div
                  className={[
                    'h-full rounded-full transition-all duration-300 ease-out',
                    uploadState === 'uploading'
                      ? 'bg-[oklch(0.75_0.18_180)]'
                      : 'bg-[oklch(0.80_0.18_85)]',
                  ].join(' ')}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-[oklch(0.55_0.02_270)]">
                {uploadProgress}%
              </p>
            </div>
          )}

          {/* Browse button (idle state) */}
          {uploadState === 'idle' && (
            <button
              type="button"
              aria-label="Browse files to upload"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="rounded-xl border border-[oklch(0.65_0.25_270_/_0.35)] bg-[oklch(0.65_0.25_270_/_0.15)] px-5 py-2 text-sm font-medium text-[oklch(0.75_0.20_270)] transition-all hover:border-[oklch(0.65_0.25_270_/_0.60)] hover:bg-[oklch(0.65_0.25_270_/_0.25)] hover:text-[oklch(0.90_0.20_270)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.25_270)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.12_0.03_270)]"
            >
              Browse files
            </button>
          )}

          {/* Reset button (completed / error) */}
          {(uploadState === 'completed' || uploadState === 'error') && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-[oklch(0.80_0.02_270_/_0.20)] bg-[oklch(0.20_0.03_270_/_0.50)] px-5 py-2 text-sm font-medium text-[oklch(0.75_0.02_270)] transition-all hover:bg-[oklch(0.25_0.03_270_/_0.60)] hover:text-[oklch(0.90_0.01_270)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.25_270)]"
            >
              {uploadState === 'completed' ? 'Upload another' : 'Try again'}
            </button>
          )}
        </div>

        {/* Drag-over overlay label */}
        {isDragOver && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl border-2 border-dashed border-[oklch(0.65_0.25_270_/_0.80)] bg-[oklch(0.65_0.25_270_/_0.06)]"
          >
            <p className="text-lg font-semibold text-[oklch(0.80_0.20_270)]">
              Release to upload
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="resume-file-input"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Select resume file"
        onChange={handleFileChange}
        tabIndex={-1}
      />
    </section>
  );
}
