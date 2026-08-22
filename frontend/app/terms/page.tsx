import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-paper border-2 border-kraft p-8 sm:p-12 shadow-sm space-y-8"
           style={{ clipPath: "polygon(0% 0.5%, 100% 0%, 99.5% 99.5%, 0.5% 100%)" }}
      >
        <div className="border-b-2 border-dashed border-kraft pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Legal Documentation</span>
          <h1 className="font-display text-4xl text-ink mt-1">Terms of Service</h1>
          <p className="font-mono text-xs text-ink/50 mt-1">Last updated: August 2026</p>
        </div>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">1. Acceptance of Terms</h2>
          <p>
            By creating an account, building travel itineraries, or exploring shared field notes on GlobeTrotter, you agree to these Terms of Service. If you do not agree, please do not use the application.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">2. Your Travel Data & Itineraries</h2>
          <p>
            You retain ownership of the itineraries, notes, budgets, and photos you create on GlobeTrotter. When you choose to mark an itinerary as "Public" or share a post in the Community Tab, you grant GlobeTrotter a non-exclusive license to display, index, and permit fellow travelers to clone or bookmark your shared plan.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">3. Budgeting & Pricing Estimates</h2>
          <p>
            Budget totals, currency conversions, and activity prices presented across GlobeTrotter are estimated reference figures for travel planning convenience. Actual expenses, merchant fees, exchange rates, and ticket availabilities remain the traveler's responsibility.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">4. Account Responsibility & Community Conduct</h2>
          <p>
            You agree to provide accurate information and respect community guidelines when contributing travel advice, reviews, or photos. Content that is defamatory, unlawful, or violates intellectual property rights is prohibited and subject to immediate removal.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">5. Account Termination</h2>
          <p>
            You may export your data or delete your account at any time via Settings. Upon deletion, your personal details and private itineraries are permanently purged from active databases.
          </p>
        </section>

        <div className="pt-6 border-t-2 border-dashed border-kraft flex justify-between items-center text-xs font-mono text-ink/60">
          <Link href="/" className="text-postal hover:underline font-bold">
            ← Return to Dashboard
          </Link>
          <Link href="/privacy" className="text-denim hover:underline">
            Read Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
}
