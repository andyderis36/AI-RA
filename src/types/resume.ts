import { z } from 'zod';

// === AI Output Schema (what Gemini returns) ===
export const AIAnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  skillsDetected: z.array(z.string()),
  experienceYears: z.number().nullable(),
  educationLevel: z.string().nullable(),
  keywordMatch: z
    .object({
      matched: z.array(z.string()),
      missing: z.array(z.string()),
      score: z.number().min(0).max(100),
    })
    .nullable(),
});

export type AIAnalysisResult = z.infer<typeof AIAnalysisResultSchema>;

// === Resume Document Schema (DB shape) ===
export const ResumeDocumentSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileType: z.enum(['pdf', 'docx', 'image']),
  analysis: AIAnalysisResultSchema.nullable(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  tokenUsage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;

// === API Request/Response Schemas ===
export const UploadResumeRequestSchema = z.object({
  file: z.instanceof(File),
  targetJobDesc: z.string().optional(), // optional job description for keyword matching
});

export const AnalyzeResumeResponseSchema = z.object({
  success: z.boolean(),
  data: ResumeDocumentSchema.nullable(),
  error: z.string().nullable(),
});

export type UploadResumeRequest = z.infer<typeof UploadResumeRequestSchema>;
export type AnalyzeResumeResponse = z.infer<typeof AnalyzeResumeResponseSchema>;
