import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Pre-configured Google Generative AI provider instance.
 * Uses the GOOGLE_GENERATIVE_AI_API_KEY environment variable.
 */
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Default model for resume analysis.
 * gemini-2.5-flash-lite — Multimodal, cost-efficient.
 * Pricing: $0.25/1M input tokens, $1.50/1M output tokens
 */
export const resumeAnalyzerModel = google('gemini-2.5-flash-preview-05-20');
