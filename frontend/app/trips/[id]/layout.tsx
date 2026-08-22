"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { id } = useParams() as { id: string };

  const tabs = [
    { href: `/trips/${id}`, label: "Builder", exact: true },
    { href: `/trips/${id}/journal`, label: "Journal", exact: false },
    { href: `/trips/${id}/calendar`, label: "Calendar", exact: false },
    { href: `/trips/${id}/budget`, label: "Budget", exact: false },
  ];

  return (
    <div className="min-h-screen bg-kraft/10 p-4 md:p-8 flex flex-col items-center">
      {/* Torn Paper Tabs Bar */}
      <div className="w-full max-w-7xl flex flex-wrap gap-2 pl-2 md:pl-8 mb-[-2px] z-20 relative">
        {tabs.map((tab, i) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-t-2 border-x-2 px-4 py-2 font-display text-base md:text-lg transition-all shadow-sm ${
                isActive
                  ? "bg-paper border-postal text-postal z-10 scale-105 translate-y-[-2px]"
                  : "bg-paper border-kraft text-ink hover:bg-kraft/30"
              }`}
              style={{
                clipPath:
                  i === 0
                    ? "polygon(0 0, 100% 0, 96% 100%, 4% 100%)"
                    : i === tabs.length - 1
                    ? "polygon(4% 0, 100% 0, 96% 100%, 0 100%)"
                    : "polygon(4% 0, 96% 0, 100% 100%, 0 100%)",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Main Workspace */}
      <div className="w-full relative z-10">{children}</div>
    </div>
  );
}

