import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.12_0.03_270)] via-[oklch(0.10_0.02_250)] to-[oklch(0.08_0.01_230)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[oklch(0.95_0.01_270)]">
            Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
          </h1>
          <p className="mt-2 text-[oklch(0.75_0.02_270)]">
            Upload and analyze your resume with AI-powered insights.
          </p>
        </div>

        {/* Placeholder Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upload Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.18_0.03_270_/_0.6)] p-6 backdrop-blur-xl transition-all hover:border-[oklch(0.65_0.25_270_/_0.3)] hover:shadow-[0_0_24px_oklch(0.65_0.25_270_/_0.15)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.65_0.25_270_/_0.2)]">
              <svg className="h-6 w-6 text-[oklch(0.65_0.25_270)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[oklch(0.95_0.01_270)]">Upload Resume</h3>
            <p className="mt-2 text-sm text-[oklch(0.75_0.02_270)]">Upload your resume in PDF, DOCX, or image format for AI analysis.</p>
          </div>

          {/* Recent Analysis Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.18_0.03_270_/_0.6)] p-6 backdrop-blur-xl transition-all hover:border-[oklch(0.75_0.18_180_/_0.3)] hover:shadow-[0_0_24px_oklch(0.75_0.18_180_/_0.15)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.75_0.18_180_/_0.2)]">
              <svg className="h-6 w-6 text-[oklch(0.75_0.18_180)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[oklch(0.95_0.01_270)]">Recent Analysis</h3>
            <p className="mt-2 text-sm text-[oklch(0.75_0.02_270)]">No analysis yet. Upload a resume to get started.</p>
          </div>

          {/* Score Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.18_0.03_270_/_0.6)] p-6 backdrop-blur-xl transition-all hover:border-[oklch(0.72_0.20_155_/_0.3)] hover:shadow-[0_0_24px_oklch(0.72_0.20_155_/_0.15)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.72_0.20_155_/_0.2)]">
              <svg className="h-6 w-6 text-[oklch(0.72_0.20_155)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[oklch(0.95_0.01_270)]">Your Score</h3>
            <p className="mt-2 text-sm text-[oklch(0.75_0.02_270)]">Complete an analysis to see your resume score.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
