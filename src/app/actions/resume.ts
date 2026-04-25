'use server';

import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { streamObject } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import { z } from 'zod';

import { dbConnect } from '@/lib/db';
import { resumeAnalyzerModel } from '@/lib/ai';
import { Resume } from '@/models/Resume';
import { User } from '@/models/User';
import { AIAnalysisResultSchema } from '@/types/resume';
import type { AIAnalysisResult } from '@/types/resume';

// ============================================================
// Constants
// ============================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// ============================================================
// Validation Schemas
// ============================================================

/** Server-side file metadata validation (the File object itself is not Zod-serializable). */
const ServerFileMetaSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  size: z
    .number()
    .max(MAX_FILE_SIZE, `File must be smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
  type: z
    .string()
    .refine(
      (t) => (ACCEPTED_MIME_TYPES as readonly string[]).includes(t),
      'Unsupported file type. Accepted: PDF, DOCX, PNG, JPEG, WebP',
    ),
});

// ============================================================
// Helpers
// ============================================================

function resolveFileType(mime: string): 'pdf' | 'docx' | 'image' {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('wordprocessingml')) return 'docx';
  return 'image';
}

/** Map stored fileType back to MIME for Gemini multimodal content part. */
function toMimeType(fileType: 'pdf' | 'docx' | 'image'): string {
  switch (fileType) {
    case 'pdf':
      return 'application/pdf';
    case 'image':
      return 'image/png'; // Gemini handles all common image formats
    case 'docx':
      return 'application/pdf'; // fallback – native docx pass-through may vary
    default:
      return 'application/pdf';
  }
}

// ============================================================
// Return-type helpers (serializable for Server Actions)
// ============================================================

type ActionResult<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type UploadResult = ActionResult<{
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  status: string;
}>;

// ============================================================
// 1. uploadResumeAction
// ============================================================

/**
 * Server Action: Accepts a FormData with a `file` field.
 *  – Validates metadata (size, type).
 *  – Uploads to Vercel Blob under `resumes/<clerkUserId>/`.
 *  – Creates a MongoDB `Resume` document with status `pending`.
 *  – Links the resume to the authenticated user.
 */
export async function uploadResumeAction(
  formData: FormData,
): Promise<UploadResult> {
  // ── Auth guard ────────────────────────────────────────────
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, data: null, error: 'Unauthorized: Please sign in.' };
  }

  try {
    // ── Extract file ──────────────────────────────────────
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return { success: false, data: null, error: 'No valid file provided.' };
    }

    // ── Validate metadata with Zod ────────────────────────
    const meta = ServerFileMetaSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!meta.success) {
      return {
        success: false,
        data: null,
        error: meta.error.issues.map((i) => i.message).join('; '),
      };
    }

    // ── Upload to Vercel Blob ─────────────────────────────
    const blob = await put(
      `resumes/${clerkUserId}/${Date.now()}-${file.name}`,
      file,
      { access: 'public' },
    );

    // ── DB: find/create user, create resume ───────────────
    await dbConnect();

    let user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      // Fallback – webhook may not have fired yet.
      user = await User.create({
        clerkId: clerkUserId,
        email: `${clerkUserId}@pending.dev`,
      });
    }

    const resume = await Resume.create({
      userId: user._id,
      fileName: file.name,
      fileUrl: blob.url,
      fileType: resolveFileType(file.type),
      status: 'pending',
      tokenUsage: { inputTokens: 0, outputTokens: 0 },
    });

    // Link resume to user's resume list
    await User.findByIdAndUpdate(user._id, {
      $push: { resumes: resume._id },
    });

    return {
      success: true,
      data: {
        _id: resume._id.toString(),
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        status: resume.status,
      },
      error: null,
    };
  } catch (err) {
    console.error('[uploadResumeAction] Error:', err);
    const message =
      err instanceof Error ? err.message : 'Upload failed. Please try again.';
    return { success: false, data: null, error: message };
  }
}

// ============================================================
// 2. analyzeResumeStreamAction
// ============================================================

/** System instruction for the Gemini model – kept concise to lower token cost. */
const ANALYZER_SYSTEM_PROMPT = `You are an Expert HR Recruiter and ATS (Applicant Tracking System) Resume Analyzer.

Your task: analyze the provided resume document and return a structured JSON analysis.

Evaluation criteria:
• overallScore (0-100): Rate overall quality, formatting, content depth, and ATS-friendliness.
• summary: A concise 2-3 sentence professional evaluation.
• strengths: List concrete strengths found in the resume.
• weaknesses: List areas that need improvement.
• suggestions: Actionable, specific improvement recommendations.
• skillsDetected: Extract all technical and soft skills mentioned.
• experienceYears: Estimated total years of professional experience (null if unclear).
• educationLevel: Highest education level mentioned (null if absent).
• keywordMatch: Set to null (no job description provided for matching).

Be objective, professional, and constructive. Always return valid JSON matching the required schema.`;

/**
 * Server Action: Streams an AI resume analysis to the client.
 *  – Validates auth & ownership.
 *  – Sets resume status → `processing`.
 *  – Calls Gemini via `streamObject` with multimodal PDF/Image URL.
 *  – Streams partial `AIAnalysisResult` objects via `createStreamableValue`.
 *  – On finish: atomically updates MongoDB with final result & token usage.
 *
 * @param resumeId – MongoDB ObjectId string of the resume to analyse.
 * @returns `{ output: StreamableValue }` – FE consumes via `readStreamableValue`.
 */
export async function analyzeResumeStreamAction(resumeId: string) {
  // ── Auth guard ────────────────────────────────────────────
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error('Unauthorized');
  }

  // ── Input validation ──────────────────────────────────────
  const idCheck = z.string().min(1, 'Resume ID is required').safeParse(resumeId);
  if (!idCheck.success) {
    throw new Error('Invalid resume ID');
  }

  // ── DB lookup & ownership check ───────────────────────────
  await dbConnect();

  const user = await User.findOne({ clerkId: clerkUserId });
  if (!user) {
    throw new Error('User not found');
  }

  const resume = await Resume.findOne({ _id: resumeId, userId: user._id });
  if (!resume) {
    throw new Error('Resume not found or access denied');
  }

  // ── Mark as processing ────────────────────────────────────
  await Resume.findByIdAndUpdate(resumeId, { status: 'processing' });

  // ── Create streamable value for FE ────────────────────────
  const stream = createStreamableValue<Partial<AIAnalysisResult>>();

  // ── Kick off non-blocking AI streaming ────────────────────
  (async () => {
    try {
      const result = streamObject({
        model: resumeAnalyzerModel,
        schema: AIAnalysisResultSchema,
        system: ANALYZER_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this resume document and provide a comprehensive evaluation.',
              },
              {
                type: 'file',
                data: new URL(resume.fileUrl),
                mediaType: toMimeType(resume.fileType),
              },
            ],
          },
        ],
        onFinish: async ({ object, usage, error: finishError }) => {
          try {
            await dbConnect();

            if (finishError || !object) {
              console.error('[analyzeResumeStreamAction] onFinish error:', finishError);
              await Resume.findByIdAndUpdate(resumeId, { status: 'failed' });
              return;
            }

            // Atomic update with analysis result + token usage
            await Resume.findByIdAndUpdate(resumeId, {
              analysis: object,
              status: 'completed',
              tokenUsage: {
                inputTokens: usage?.inputTokens ?? 0,
                outputTokens: usage?.outputTokens ?? 0,
              },
            });
          } catch (dbErr) {
            console.error('[analyzeResumeStreamAction] DB update failed:', dbErr);
            await Resume.findByIdAndUpdate(resumeId, { status: 'failed' }).catch(
              () => {},
            );
          }
        },
      });

      // Stream partial objects to the client
      for await (const partialObject of result.partialObjectStream) {
        stream.update(partialObject as Partial<AIAnalysisResult>);
      }

      // Close the stream with the final validated object
      const finalObject = await result.object;
      stream.done(finalObject as Partial<AIAnalysisResult>);
    } catch (err) {
      console.error('[analyzeResumeStreamAction] Stream error:', err);

      // Mark as failed in DB
      await dbConnect();
      await Resume.findByIdAndUpdate(resumeId, { status: 'failed' }).catch(
        () => {},
      );

      stream.error(
        err instanceof Error ? err : new Error('Analysis failed'),
      );
    }
  })();

  return { output: stream.value };
}
