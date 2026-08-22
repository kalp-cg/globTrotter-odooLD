import React from "react";
import Link from "next/link";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-kraft/10 p-4 md:p-8 flex flex-col items-center">
      {/* Torn Paper Tabs Bar */}
      <div className="w-full max-w-7xl flex flex-wrap gap-2 pl-2 md:pl-8 mb-[-2px] z-20 relative">
        <Link 
          href={`/trips/${id}`}
          className="bg-paper border-t-2 border-x-2 border-kraft px-4 py-2 rounded-t-sm font-display text-base md:text-lg text-ink hover:bg-paper/90 transition-colors shadow-sm"
          style={{ clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)" }}
        >
          Builder (Legs)
        </Link>
        <Link 
          href={`/trips/${id}/journal`}
          className="bg-paper border-t-2 border-x-2 border-kraft px-4 py-2 rounded-t-sm font-display text-base md:text-lg text-ink hover:bg-paper/90 transition-colors shadow-sm"
          style={{ clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }}
        >
          Day-by-Day Journal
        </Link>
        <Link 
          href={`/trips/${id}/calendar`}
          className="bg-paper border-t-2 border-x-2 border-kraft px-4 py-2 rounded-t-sm font-display text-base md:text-lg text-ink hover:bg-paper/90 transition-colors shadow-sm"
          style={{ clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }}
        >
          Calendar
        </Link>
        <Link 
          href={`/trips/${id}/budget`}
          className="bg-paper border-t-2 border-x-2 border-kraft px-4 py-2 rounded-t-sm font-display text-base md:text-lg text-ink hover:bg-paper/90 transition-colors shadow-sm"
          style={{ clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }}
        >
          Budget Analytics
        </Link>
        <Link 
          href={`/trips/${id}/packing`}
          className="bg-paper border-t-2 border-x-2 border-kraft px-4 py-2 rounded-t-sm font-display text-base md:text-lg text-ink hover:bg-paper/90 transition-colors shadow-sm"
          style={{ clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 100%)" }}
        >
          Packing List
        </Link>
      </div>
      
      {/* Main Journal Workspace */}
      <div className="w-full relative z-10">
        {children}
      </div>
    </div>
  );
}
