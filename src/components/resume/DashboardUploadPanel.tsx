'use client';

import { useRef, useState, useTransition } from 'react';
import { readStreamableValue } from '@ai-sdk/rsc';
import { ResumeUploader } from './ResumeUploader';
import { AnalysisResult } from './AnalysisResult';
import type { AIAnalysisResult, ResumeDocument } from '@/types/resume';
import type { UploadResult } from '@/app/actions/resume';

/**
 * DashboardUploadPanel
 *
 * Sole 'use client' boundary. Orchestrates:
 *  1. File upload  → uploadResumeAction → UploadResult
 *  2. AI stream    → analyzeResumeStreamAction → StreamableValue
 *  3. Progressive UI updates via readStreamableValue
 *
 * Server Actions are injected as props so this component stays
 * decoupled and the page.tsx can remain a pure Server Component.
 */

type StreamableValue = import('@ai-sdk/rsc').StreamableValue<Partial<AIAnalysisResult>>;

interface DashboardUploadPanelProps {
  uploadAction: (formData: FormData) => Promise<UploadResult>;
  analyzeAction: (resumeId: string) => Promise<{ output: StreamableValue }>;
}

export function DashboardUploadPanel({
  uploadAction,
  analyzeAction,
}: DashboardUploadPanelProps) {
  const [analysisResult, setAnalysisResult] =
    useState<Partial<AIAnalysisResult> | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [, startTransition] = useTransition();

  // Ref-based flags — avoids stale closure reads from React state
  const streamDoneRef = useRef<(() => void) | null>(null);
  const streamCompletedRef = useRef(false); // true once runStream finishes

  // ─── Upload adapter for ResumeUploader ──────────────────────────────────
  async function uploadAdapter(formData: FormData): Promise<ResumeDocument> {
    setAnalysisResult(null);
    streamCompletedRef.current = false; // reset for new upload

    const result = await uploadAction(formData);

    if (!result.success || !result.data) {
      throw new Error(result.error ?? 'Upload failed. Please try again.');
    }

    const { _id: resumeId } = result.data;

    // Kick off streaming immediately in a transition (non-blocking)
    startTransition(() => {
      void runStream(resumeId);
    });

    // Return minimal ResumeDocument shape so uploader moves to 'analyzing'
    return {
      _id: resumeId,
      userId: '',
      fileName: result.data.fileName,
      fileUrl: result.data.fileUrl,
      fileType: result.data.fileType as ResumeDocument['fileType'],
      analysis: null,
      status: 'processing',
      tokenUsage: { inputTokens: 0, outputTokens: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ─── Core streaming logic ────────────────────────────────────────────────
  async function runStream(resumeId: string): Promise<void> {
    setIsStreaming(true);
    setAnalysisResult({});

    try {
      const { output } = await analyzeAction(resumeId);

      for await (const partial of readStreamableValue(output)) {
        if (partial) {
          setAnalysisResult((prev) => ({ ...prev, ...partial }));
        }
      }
    } catch (err) {
      console.error('[DashboardUploadPanel] Stream error:', err);
    } finally {
      setIsStreaming(false);
      streamCompletedRef.current = true;
      // Resolve the analyzeAdapter promise if it's waiting
      streamDoneRef.current?.();
      streamDoneRef.current = null;
    }
  }

  // ─── Analyze adapter for ResumeUploader ─────────────────────────────────
  // The uploader calls this after upload. We just wait for runStream to finish.
  async function analyzeAdapter(
    _resumeId: string,
  ): Promise<{ result: AIAnalysisResult }> {
    // Wait for the streaming (started in uploadAdapter) to complete.
    // Use ref — not `isStreaming` state — to avoid stale closure reads.
    await new Promise<void>((resolve) => {
      if (streamCompletedRef.current) {
        resolve();
      } else {
        streamDoneRef.current = resolve;
      }
    });

    // Return whatever we accumulated during streaming
    return {
      result: (analysisResult ?? {}) as AIAnalysisResult,
    };
  }

  return (
    <div className="space-y-0">
      <ResumeUploader
        uploadAction={uploadAdapter}
        analyzeAction={analyzeAdapter}
      />
      <AnalysisResult result={analysisResult} isStreaming={isStreaming} />
    </div>
  );
}
