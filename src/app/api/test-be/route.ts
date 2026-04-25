/**
 * Temporary BE health-check endpoint.
 * Tests: MongoDB connection, Vercel Blob connectivity, AI model availability.
 *
 * GET /api/test-be → JSON report
 *
 * ⚠️  DELETE this file before production deployment.
 */

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { resumeAnalyzerModel } from '@/lib/ai';
import { Resume } from '@/models/Resume';
import { put, del } from '@vercel/blob';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const report: Record<string, { ok: boolean; detail: string; ms: number }> = {};

  // ── 1. MongoDB ─────────────────────────────────────────────
  {
    const t0 = Date.now();
    try {
      await dbConnect();
      const count = await Resume.countDocuments();
      report['mongodb'] = {
        ok: true,
        detail: `Connected. Resume collection has ${count} document(s).`,
        ms: Date.now() - t0,
      };
    } catch (err) {
      report['mongodb'] = {
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
        ms: Date.now() - t0,
      };
    }
  }

  // ── 2. Vercel Blob ─────────────────────────────────────────
  {
    const t0 = Date.now();
    try {
      const testBlob = await put(
        `_test/health-check-${Date.now()}.txt`,
        'BE health check',
        { access: 'private' },
      );
      // Clean up immediately
      await del(testBlob.url);
      report['vercel_blob'] = {
        ok: true,
        detail: `Upload + delete succeeded. URL was: ${testBlob.url}`,
        ms: Date.now() - t0,
      };
    } catch (err) {
      report['vercel_blob'] = {
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
        ms: Date.now() - t0,
      };
    }
  }

  // ── 3. Gemini AI Model ─────────────────────────────────────
  {
    const t0 = Date.now();
    try {
      const { text } = await generateText({
        model: resumeAnalyzerModel,
        prompt: 'Reply with exactly the word: PONG',
        maxOutputTokens: 200,
      });
      report['gemini_ai'] = {
        ok: text.trim().length > 0,
        detail: `Model responded: "${text.trim()}"`,
        ms: Date.now() - t0,
      };
    } catch (err) {
      report['gemini_ai'] = {
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
        ms: Date.now() - t0,
      };
    }
  }

  const allOk = Object.values(report).every((r) => r.ok);
  return NextResponse.json(
    { status: allOk ? 'ALL_PASS' : 'SOME_FAILED', report },
    { status: allOk ? 200 : 500 },
  );
}
