import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-paper border-t border-kraft/60 py-6 px-4 sm:px-8 mt-auto text-xs font-mono text-ink/60">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© 2026 GlobeTrotter • Hand-kept Travel Journal</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-postal transition-colors underline decoration-dotted">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-postal transition-colors underline decoration-dotted">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
