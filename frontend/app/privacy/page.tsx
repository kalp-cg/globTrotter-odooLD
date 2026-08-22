import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-paper border-2 border-kraft p-8 sm:p-12 shadow-sm space-y-8"
           style={{ clipPath: "polygon(0.2% 0%, 100% 0.5%, 99.5% 100%, 0% 99.5%)" }}
      >
        <div className="border-b-2 border-dashed border-kraft pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Data Stewardship</span>
          <h1 className="font-display text-4xl text-ink mt-1">Privacy Policy</h1>
          <p className="font-mono text-xs text-ink/50 mt-1">Last updated: August 2026</p>
        </div>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">1. Information We Collect</h2>
          <p>
            GlobeTrotter collects information you explicitly provide: account profile details (name, email, profile photo), travel itinerary destinations, scheduled activity timestamps, and budget figures.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">2. How Your Information Is Used</h2>
          <p>
            Your information is used solely to generate your scrapbooks, compute dynamic budget breakdowns, suggest relevant activities, and allow you to share itineraries with fellow travelers. We do not sell your personal or travel data to third-party ad networks.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">3. Public Sharing & Privacy Controls</h2>
          <p>
            Every trip is private by default. When you toggle a trip to "Public", a unique share slug is generated (`/trip/:shareSlug`) that allows read-only viewing of the route, cities, and scheduled activities. You may revert a public itinerary to private at any time.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">4. Security & Cryptography</h2>
          <p>
            Authentication credentials are encrypted using industry-standard bcrypt hashing. API communications are secured with JSON Web Tokens (JWT) over HTTPS.
          </p>
        </section>

        <section className="space-y-3 font-body text-sm text-ink/80 leading-relaxed">
          <h2 className="font-display text-2xl text-ink">5. Contact & Inquiries</h2>
          <p>
            If you have questions regarding data retention or wish to request full account data deletion, please visit your Settings tab or contact our team.
          </p>
        </section>

        <div className="pt-6 border-t-2 border-dashed border-kraft flex justify-between items-center text-xs font-mono text-ink/60">
          <Link href="/" className="text-postal hover:underline font-bold">
            ← Return to Dashboard
          </Link>
          <Link href="/terms" className="text-denim hover:underline">
            Read Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  );
}
