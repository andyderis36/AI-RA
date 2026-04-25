import { currentUser } from '@clerk/nextjs/server';
import { DashboardUploadPanel } from '@/components/resume/DashboardUploadPanel';
import {
  uploadResumeAction,
  analyzeResumeStreamAction,
} from '@/app/actions/resume';

export default async function DashboardPage() {
  const user = await currentUser();

  const displayName =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress ||
    'there';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[oklch(0.12_0.03_270)] via-[oklch(0.10_0.02_250)] to-[oklch(0.08_0.01_230)]">
      {/* ── Ambient background orbs ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-[oklch(0.65_0.25_270_/_0.06)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[oklch(0.75_0.18_180_/_0.05)] blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="mb-1 flex items-center gap-2">
            {/* AI badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.65_0.25_270_/_0.30)] bg-[oklch(0.65_0.25_270_/_0.12)] px-2.5 py-0.5 text-xs font-medium text-[oklch(0.78_0.20_270)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.20_155)] animate-pulse"
              />
              AI-Powered
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_270)] sm:text-4xl">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-[oklch(0.75_0.20_270)] to-[oklch(0.75_0.18_180)] bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-base text-[oklch(0.68_0.02_270)]">
            Upload your resume and get instant AI-powered insights — score,
            skill gaps, keyword match, and actionable suggestions.
          </p>
        </header>

        {/* ── Main Upload + Analysis Section ──────────────────────────────── */}
        <main>
          <DashboardUploadPanel
            uploadAction={uploadResumeAction}
            analyzeAction={analyzeResumeStreamAction}
          />
        </main>

        {/* ── Informational Footer Cards ──────────────────────────────────── */}
        <footer className="mt-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
            What you get
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: 'oklch(0.72 0.20 155)',
                colorAlpha: 'oklch(0.72 0.20 155 / 0.15)',
                borderAlpha: 'oklch(0.72 0.20 155 / 0.20)',
                title: 'ATS Score',
                desc: 'See how well your resume passes automated screening systems.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                color: 'oklch(0.65 0.25 270)',
                colorAlpha: 'oklch(0.65 0.25 270 / 0.15)',
                borderAlpha: 'oklch(0.65 0.25 270 / 0.20)',
                title: 'AI Suggestions',
                desc: 'Actionable tips to improve your resume for specific roles.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                ),
                color: 'oklch(0.75 0.18 180)',
                colorAlpha: 'oklch(0.75 0.18 180 / 0.15)',
                borderAlpha: 'oklch(0.75 0.18 180 / 0.20)',
                title: 'Keyword Match',
                desc: 'Discover missing keywords that top job descriptions require.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border backdrop-blur-xl p-4 transition-all"
                style={{
                  background: card.colorAlpha,
                  borderColor: card.borderAlpha,
                }}
              >
                <div
                  className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: card.colorAlpha, color: card.color }}
                >
                  {card.icon}
                </div>
                <h3 className="text-sm font-semibold text-[oklch(0.90_0.01_270)]">
                  {card.title}
                </h3>
                <p className="mt-0.5 text-xs text-[oklch(0.65_0.02_270)]">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
