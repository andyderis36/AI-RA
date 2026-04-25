import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(0.12_0.03_270)] via-[oklch(0.10_0.02_250)] to-[oklch(0.08_0.01_230)]">
      <div className="relative">
        {/* Glassmorphism glow effect */}
        <div className="absolute -inset-4 rounded-3xl bg-[oklch(0.65_0.25_270_/_0.15)] blur-2xl" />
        <div className="relative">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-[oklch(0.18_0.03_270_/_0.8)] backdrop-blur-xl border border-[oklch(0.80_0.02_270_/_0.15)] shadow-[0_8px_32px_oklch(0_0_0_/_0.3)]',
                headerTitle: 'text-[oklch(0.95_0.01_270)]',
                headerSubtitle: 'text-[oklch(0.75_0.02_270)]',
                formFieldLabel: 'text-[oklch(0.85_0.02_270)]',
                formFieldInput:
                  'bg-[oklch(0.15_0.02_270_/_0.6)] border-[oklch(0.40_0.05_270_/_0.3)] text-[oklch(0.95_0.01_270)] placeholder:text-[oklch(0.55_0.02_270)]',
                formButtonPrimary:
                  'bg-[oklch(0.65_0.25_270)] hover:bg-[oklch(0.70_0.28_270)] transition-colors',
                footerActionLink: 'text-[oklch(0.65_0.25_270)] hover:text-[oklch(0.70_0.28_270)]',
                identityPreview: 'bg-[oklch(0.15_0.02_270_/_0.6)] border-[oklch(0.40_0.05_270_/_0.3)]',
                identityPreviewText: 'text-[oklch(0.85_0.02_270)]',
                identityPreviewEditButton: 'text-[oklch(0.65_0.25_270)]',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
