import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[oklch(0.12_0.03_270)] via-[oklch(0.10_0.02_250)] to-[oklch(0.08_0.01_230)]">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[oklch(0.65_0.25_270_/_0.08)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-[oklch(0.75_0.18_180_/_0.06)] blur-3xl" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.65_0.25_270)] shadow-[0_0_12px_oklch(0.65_0.25_270_/_0.4)]">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <span className="text-lg font-semibold text-[oklch(0.95_0.01_270)]">
            AIRA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[oklch(0.85_0.02_270)] transition-colors hover:text-[oklch(0.95_0.01_270)]"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[oklch(0.65_0.25_270)] px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_oklch(0.65_0.25_270_/_0.3)] transition-all hover:bg-[oklch(0.70_0.28_270)] hover:shadow-[0_0_24px_oklch(0.65_0.25_270_/_0.4)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.80_0.02_270_/_0.15)] bg-[oklch(0.18_0.03_270_/_0.6)] px-4 py-1.5 text-sm backdrop-blur-md">
          <span className="inline-block h-2 w-2 rounded-full bg-[oklch(0.72_0.20_155)] shadow-[0_0_6px_oklch(0.72_0.20_155)]" />
          <span className="text-[oklch(0.85_0.02_270)]">Powered by Gemini AI</span>
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[oklch(0.95_0.01_270)] sm:text-5xl lg:text-6xl">
          Analyze Your Resume{" "}
          <span className="bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.75_0.18_180)] bg-clip-text text-transparent">
            with AI Precision
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[oklch(0.75_0.02_270)]">
          Upload your resume and get instant, actionable feedback. Detect skills,
          identify weaknesses, and optimize your score — all powered by
          cutting-edge AI.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.65_0.25_270)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_24px_oklch(0.65_0.25_270_/_0.3)] transition-all hover:bg-[oklch(0.70_0.28_270)] hover:shadow-[0_0_32px_oklch(0.65_0.25_270_/_0.5)]"
          >
            Start Analyzing
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-xl border border-[oklch(0.80_0.02_270_/_0.2)] bg-[oklch(0.18_0.03_270_/_0.4)] px-8 py-3.5 text-base font-semibold text-[oklch(0.85_0.02_270)] backdrop-blur-md transition-all hover:border-[oklch(0.80_0.02_270_/_0.35)] hover:bg-[oklch(0.18_0.03_270_/_0.6)]"
          >
            Learn More
          </a>
        </div>

        {/* Feature cards */}
        <div id="features" className="mt-24 grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              title: "Smart Parsing",
              desc: "AI reads PDFs, DOCX & images — extracting skills, experience, and education automatically.",
            },
            {
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
              title: "Instant Score",
              desc: "Get a 0-100 resume score with detailed breakdown of strengths and weaknesses.",
            },
            {
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              title: "Keyword Match",
              desc: "Compare against job descriptions — see matched vs missing keywords at a glance.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[oklch(0.80_0.02_270_/_0.12)] bg-[oklch(0.15_0.02_270_/_0.5)] p-6 text-left backdrop-blur-xl transition-all hover:border-[oklch(0.65_0.25_270_/_0.25)] hover:shadow-[0_8px_32px_oklch(0_0_0_/_0.2)]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.65_0.25_270_/_0.15)]">
                <svg className="h-5 w-5 text-[oklch(0.65_0.25_270)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[oklch(0.95_0.01_270)]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[oklch(0.70_0.02_270)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-[oklch(0.55_0.02_270)]">
        © 2026 AIRA — AI Resume Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
