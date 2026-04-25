import mongoose, { Schema, models, model } from 'mongoose';
import type { AIAnalysisResult } from '@/types/resume';

export interface IResume {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'image';
  analysis: AIAnalysisResult | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
  };
  jobDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'image'],
      required: true,
    },
    analysis: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    tokenUsage: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
    },
    jobDescription: { type: String, default: null },
  },
  { timestamps: true }
);

export const Resume = models.Resume || model<IResume>('Resume', ResumeSchema);
