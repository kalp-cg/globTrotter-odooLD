"use client";

import React from "react";
import { StampButton } from "@/components/ui/stamp-button";
import { PolaroidCard } from "@/components/ui/polaroid-card";
import { LuggageTag } from "@/components/ui/luggage-tag";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { TornDivider } from "@/components/ui/torn-divider";
import { ScribbleCheck } from "@/components/ui/scribble-check";
import { RouteLine } from "@/components/ui/route-line";
import * as Icons from "@/components/ui/icons";

export default function ComponentsDevPage() {
  return (
    <main className="min-h-screen p-8 lg:p-16 space-y-16 max-w-5xl mx-auto">
      <header className="mb-12 border-b-2 border-kraft pb-4">
        <h1 className="font-display text-4xl text-ink">GlobeTrotter Design System</h1>
        <p className="font-body text-ink/70 text-lg mt-2">Shared Component Showcase</p>
      </header>

      {/* Buttons Section */}
      <section>
        <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
          <Icons.Plus className="w-6 h-6 text-postal" /> Stamp Buttons
        </h2>
        <div className="flex gap-6 items-center">
          <StampButton variant="primary">Save Trip</StampButton>
          <StampButton variant="secondary">Cancel</StampButton>
        </div>
      </section>

      <TornDivider />

      {/* Cards Section */}
      <section>
        <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
          <Icons.Suitcase className="w-6 h-6 text-postal" /> Polaroid Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PolaroidCard 
            id="tokyo-trip"
            caption="Tokyo 2026"
            // No image passed = displays fallback
          />
          <PolaroidCard 
            id="paris-trip"
            caption="Paris Getaway"
          />
          <PolaroidCard 
            id="new-york"
            caption="NYC Weekend"
          />
        </div>
      </section>

      <TornDivider />

      {/* Tags Section */}
      <section>
        <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
          <Icons.CoinPurse className="w-6 h-6 text-postal" /> Luggage Tags
        </h2>
        <div className="flex gap-4">
          <LuggageTag label="Total Cost" value="$1,240" />
          <LuggageTag label="Date" value="Oct 12 - 18" />
          <LuggageTag label="Status" value="Planning" className="border-l-4 border-l-moss" />
        </div>
      </section>

      <TornDivider />

      {/* Loading Skeletons */}
      <section>
        <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
          <Icons.Compass className="w-6 h-6 text-postal" /> Loading State (Skeleton)
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <PaperSkeleton className="aspect-[3/4] w-full" />
          <div className="space-y-4">
            <PaperSkeleton className="h-8 w-3/4" />
            <PaperSkeleton className="h-4 w-full" />
            <PaperSkeleton className="h-4 w-5/6" />
          </div>
        </div>
      </section>

      <TornDivider />

      {/* Drawing / Micro-animations */}
      <section>
        <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
          <Icons.MapPin className="w-6 h-6 text-postal" /> Route Lines & Scribbles
        </h2>
        <div className="bg-white/50 p-8 border border-kraft/30 relative">
          <div className="flex justify-between items-center relative z-10">
            <div className="w-4 h-4 rounded-full bg-postal border-2 border-ink" />
            <div className="w-4 h-4 rounded-full bg-postal border-2 border-ink" />
          </div>
          <div className="absolute top-8 left-8 right-8 h-10 z-0">
            <RouteLine startX={0} startY={20} endX={100} endY={20} />
          </div>
          
          <div className="mt-16 flex items-center gap-4">
            <span className="font-body text-ink">Success Checkmark:</span>
            <ScribbleCheck size={32} />
          </div>
        </div>
      </section>

      <TornDivider />

      {/* Icons Catalog */}
      <section>
        <h2 className="font-display text-2xl text-ink mb-6">Icon Catalog</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
          {Object.entries(Icons).map(([name, Icon]) => (
            <div key={name} className="flex flex-col items-center gap-2 text-ink">
              <div className="p-3 bg-paper border border-kraft rotate-1 hover:rotate-0 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs text-ink/70">{name}</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
