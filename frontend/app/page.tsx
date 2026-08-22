"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTrips } from "@/lib/hooks/useTrips";
import { useCities } from "@/lib/hooks/useCities";
import { useCommunityPosts } from "@/lib/hooks/useCommunity";
import { StampButton } from "@/components/ui/stamp-button";
import { PolaroidCard } from "@/components/ui/polaroid-card";
import { RouteLine } from "@/components/ui/route-line";
import { LuggageTag } from "@/components/ui/luggage-tag";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { getImageByCityName, CURATED_IMAGES } from "@/lib/constants/images";
import * as Icons from "@/components/ui/icons";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { data: tripsPayload, isLoading: isTripsLoading } = useTrips();
  const trips = tripsPayload?.data || [];
  
  const { data: cities, isLoading: isCitiesLoading } = useCities({ sort: "popular", limit: "6" });
  const { data: communityPosts } = useCommunityPosts({ sort: "newest" });

  const budgetSummary = useMemo(() => {
    if (!trips || trips.length === 0) return { total: 0, status: "good" as const };
    let total = 0;
    trips.forEach((trip: any) => {
      if (trip.budget?.total_cost) {
        total += Number(trip.budget.total_cost);
      } else if (trip.stops) {
        trip.stops.forEach((stop: any) => {
          total += Number(stop.sectionBudget || stop.section_budget || 0);
          stop.activities?.forEach((act: any) => {
            total += Number(act.actualCost || act.actual_cost || act.estCost || act.est_cost || 0);
          });
        });
      }
    });
    const status = total > 5000 ? "over" : total > 3000 ? "warning" : "good";
    return { total, status };
  }, [trips]);

  if (isAuthLoading) {
    return (
      <main className="p-8 max-w-5xl mx-auto space-y-12 min-h-screen">
        <PaperSkeleton className="w-64 h-24" />
        <div className="flex gap-6 overflow-hidden">
          <PaperSkeleton className="w-64 aspect-[4/3] shrink-0" />
          <PaperSkeleton className="w-64 aspect-[4/3] shrink-0" />
          <PaperSkeleton className="w-64 aspect-[4/3] shrink-0" />
        </div>
      </main>
    );
  }

  // If user is not logged in, render the Welcome Arrival Landing Page
  if (!user) {
    return (
      <main className="min-h-screen bg-paper overflow-x-hidden">
        
        {/* Arrival Hero Spread */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-16 space-y-12">
          
          {/* Main Hero Header Card */}
          <div className="bg-paper border-2 border-kraft p-8 sm:p-14 shadow-sm relative"
               style={{ clipPath: "polygon(0% 0.5%, 100% 0%, 99.5% 99.5%, 0.5% 100%)" }}
          >
            {/* Vintage Postmark Stamp */}
            <div className="absolute top-4 right-6 bg-kraft/40 border border-ink/20 px-3 py-1 text-xs font-mono uppercase tracking-widest text-ink/70 rotate-3 hidden sm:block">
              GlobeTrotter Scrapbook • Vol. 2026
            </div>

            <div className="max-w-3xl space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-postal bg-postal/10 px-3 py-1 border border-postal/20 inline-block">
                Multi-City Travel Planning Reimagined
              </span>

              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.08]">
                Your Journeys, Hand-Kept and Beautifully Planned.
              </h1>

              <p className="font-body text-lg sm:text-xl text-ink/80 leading-relaxed max-w-2xl">
                Ditch the cold spreadsheets. Plan complex multi-stop expeditions in a hand-crafted travel journal with sequence flow lines, live budget tracking, and real community field notes.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <StampButton
                  variant="primary"
                  className="text-xl px-8 py-4"
                  onClick={() => router.push("/login?mode=signup")}
                >
                  Start Your Journal (Free)
                </StampButton>

                <Link
                  href="/cities"
                  className="font-display text-lg text-ink border-2 border-kraft bg-kraft/15 hover:bg-kraft/30 px-6 py-3.5 transition-colors"
                  style={{ borderRadius: "2px" }}
                >
                  Explore Destinations →
                </Link>
                
                <Link
                  href="/community"
                  className="font-display text-lg text-denim hover:underline px-4 py-3"
                >
                  View Traveler Stories
                </Link>
              </div>
            </div>
          </div>

          {/* Curated Polaroids Collage Ribbon */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline px-2">
              <div>
                <h2 className="font-display text-3xl text-ink">Curated Destinations to Dream About</h2>
                <p className="font-body text-sm text-ink/60">From neon alleyways to peaceful coastal paths.</p>
              </div>
              <Link href="/cities" className="font-display text-base text-postal hover:underline">
                Browse all cities →
              </Link>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-8 pt-2 px-2 items-center no-scrollbar">
              {CURATED_IMAGES.slice(0, 6).map((img, idx) => (
                <div key={img.id} className="snap-center shrink-0 group cursor-pointer" onClick={() => router.push(`/cities?search=${encodeURIComponent(img.name.split(',')[0])}`)}>
                  <PolaroidCard
                    id={img.id}
                    caption={img.name}
                    imageUrl={img.url}
                    className="w-[220px] md:w-[250px] transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4-Pillar Crafting Philosophy */}
          <div className="bg-kraft/15 border-2 border-dashed border-kraft p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-postal">Why Travelers Love GlobeTrotter</span>
              <h2 className="font-display text-4xl text-ink">Built for Meaningful Exploration</h2>
              <p className="font-body text-sm text-ink/70">
                A thoughtfully designed workspace that respects how real trips are dreamed, budgeted, and experienced.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "📖", title: "Two-Page Journal Spreads", desc: "View every trip like a keepsake journal with washi tape photos, handwritten day headers, and route lines." },
                { icon: "🧭", title: "Physical Sequence Flow", desc: "Day-by-day activity sequencing with downward connecting arrows and duration badges." },
                { icon: "🏷️", title: "Luggage Tag Budgeting", desc: "Live category pie charts and per-day expense monitors prevent unexpected budget surprises." },
                { icon: "✨", title: "Cloneable Field Notes", desc: "Explore trips published by fellow travelers and copy complete itineraries to your account with one click." }
              ].map((feature, idx) => (
                <div key={idx} className="bg-paper border border-kraft p-5 space-y-2 shadow-sm"
                     style={{ transform: `rotate(${idx % 2 === 0 ? '-0.5deg' : '0.5deg'})` }}
                >
                  {feature.icon && <span className="text-3xl block mb-2">{feature.icon}</span>}
                  <h3 className="font-display text-xl text-ink font-bold">{feature.title}</h3>
                  <p className="font-body text-xs text-ink/75 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Stamp Strip */}
          <div className="bg-paper border-2 border-postal p-8 sm:p-12 text-center space-y-6 shadow-md relative"
               style={{ clipPath: "polygon(0.5% 0%, 100% 0.5%, 99.5% 100%, 0% 99.5%)" }}
          >
            <h2 className="font-display text-4xl sm:text-5xl text-ink">
              Ready to chart your next journey?
            </h2>
            <p className="font-body text-base text-ink/80 max-w-xl mx-auto">
              Join thousands of travelers who plan multi-city itineraries with clarity, confidence, and craft.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <StampButton
                variant="primary"
                className="text-xl px-10 py-4"
                onClick={() => router.push("/login?mode=signup")}
              >
                Create Your Account
              </StampButton>
            </div>
          </div>

        </section>

      </main>
    );
  }

  // If user is authenticated, render personal Explorer Dashboard
  const upcomingTrips = [...(trips || [])].sort((a, b) => {
    const dateA = a.startDate || (a as any).start_date || "";
    const dateB = b.startDate || (b as any).start_date || "";
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-14 overflow-x-hidden">
      
      {/* Top Welcome & Mission Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-20">
        <div 
          className="bg-paper p-6 sm:p-8 border-2 border-kraft shadow-sm max-w-2xl relative"
          style={{ transform: "rotate(-1deg)", clipPath: "polygon(1% 1%, 99% 0%, 98% 99%, 0% 98%)" }}
        >
          {/* Decorative Postmark Stamp */}
          <div className="absolute -top-3 right-4 bg-kraft/80 border border-ink/20 px-3 py-0.5 text-[10px] font-mono uppercase tracking-widest text-ink/70"
               style={{ transform: "rotate(4deg)" }}
          >
            Traveler HQ • Edition 2026
          </div>

          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            Welcome back,<br/>
            <span className="text-postal">{user?.name || "Fellow Explorer"}</span>
          </h1>

          <p className="font-body text-base text-ink/80 mt-3 leading-relaxed">
            Every great journey begins as a collection of loose notes, coffee-stained bookmarks, and curious dreams. 
            Open your journal below, map out your upcoming legs, and turn the road into a story worth keeping.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          <StampButton 
            variant="primary" 
            className="text-xl px-8 py-4"
            style={{ transform: "rotate(2deg)" }}
            onClick={() => router.push("/trips/new")}
          >
            <span className="flex items-center gap-2">
              <Icons.Plus className="w-5 h-5" /> Plan New Trip
            </span>
          </StampButton>

          <span className="font-mono text-xs text-ink/50 italic">
            {trips.length} journeys currently charted
          </span>
        </div>
      </section>

      {/* Explorer Philosophy Quote Strip */}
      <section className="bg-kraft/20 border-y-2 border-dashed border-kraft py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ink/70"
               style={{ transform: "rotate(0.3deg)" }}
      >
        <div className="flex items-center gap-3">
          <span><strong>Field Motto:</strong> “Travel isn't about rushing from point A to B; it's about the footnotes gathered along the way.”</span>
        </div>
        <Link href="/community" className="text-postal hover:underline font-bold shrink-0">
          Explore Traveler Feed →
        </Link>
      </section>

      {/* Upcoming Journeys Strip */}
      <section className="relative z-10 space-y-4">
        <div className="flex justify-between items-baseline px-2">
          <div>
            <h2 className="font-display text-3xl text-ink">Upcoming Journeys</h2>
            <p className="font-body text-sm text-ink/60">Your active scrapbooks, departure schedules, and connected routes.</p>
          </div>
          <Link href="/trips" className="font-display text-base text-postal hover:underline">
            View all ({trips.length}) →
          </Link>
        </div>
        
        {isTripsLoading ? (
          <div className="flex gap-8 px-4 overflow-hidden">
            {[1, 2, 3].map(i => <PaperSkeleton key={i} className="w-[280px] h-[320px] shrink-0" />)}
          </div>
        ) : upcomingTrips.length === 0 ? (
          /* Empty State */
          <div 
            className="mx-2 bg-paper min-h-[260px] border-2 border-kraft border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-kraft/10 transition-colors"
            style={{ borderRadius: "2px", transform: "rotate(0.5deg)" }}
            onClick={() => router.push("/trips/new")}
          >
            <Icons.Plus className="w-12 h-12 text-ink/30 mb-3" />
            <p className="font-display text-2xl text-ink/70">No trips planned yet — open a new journal</p>
            <p className="font-body text-xs text-ink/50 mt-1">Pick your first dream city, add dates, and organize activities.</p>
          </div>
        ) : (
          /* Horizontal Scroll Strip with Curated Fallback Photos */
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-12 pb-10 pt-3 px-2 items-center no-scrollbar relative">
            {upcomingTrips.slice(0, 8).map((trip: any, index: number) => {
              const cover = trip.coverPhotoUrl || trip.cover_photo_url || getImageByCityName(trip.name);

              return (
                <div key={trip.id} className="snap-center shrink-0 relative group cursor-pointer" onClick={() => router.push(`/trips/${trip.id}`)}>
                  <PolaroidCard 
                    id={trip.id} 
                    caption={trip.name} 
                    imageUrl={cover} 
                    className="w-[260px] md:w-[280px] transition-transform group-hover:scale-105" 
                  />
                  
                  {/* Route Line connecting to next card */}
                  {index < Math.min(upcomingTrips.length, 8) - 1 && (
                    <div className="absolute top-1/2 -right-[3.5rem] w-14 h-12 -translate-y-1/2 -z-10 pointer-events-none opacity-60 hidden sm:block">
                      <RouteLine startX={0} startY={24} endX={56} endY={24} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4-Step Expedition Planning Method */}
      <section className="bg-paper border-2 border-kraft p-6 sm:p-8 space-y-6 shadow-sm relative"
               style={{ clipPath: "polygon(0% 0.5%, 100% 0%, 99.8% 99.5%, 0.2% 100%)" }}
      >
        <div className="border-b-2 border-dashed border-kraft pb-3 flex justify-between items-center">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-postal">Trip Crafting Guide</span>
            <h2 className="font-display text-3xl text-ink mt-0.5">How GlobeTrotter Works</h2>
          </div>
          <span className="font-display text-xl text-ink/40 hidden sm:inline">The 4-Pillar Journal Method</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {[
            { step: "01", title: "Add City Legs", desc: "Sequence multi-destination stops, assign arrival/departure dates, and reorder legs dynamically with drag & drop." },
            { step: "02", title: "Schedule Activities", desc: "Attach curated tours, cultural landmarks, and dining spots to each stop with estimated times and durations." },
            { step: "03", title: "Monitor Budgets", desc: "Live categorical expense breakdowns and daily tracking charts ensure your expedition stays on target." },
            { step: "04", title: "Pack & Share", desc: "Tick off gear from your tailored packing checklist and publish field notes for fellow travelers to clone." },
          ].map((item, idx) => (
            <div key={idx} className="bg-kraft/15 border border-kraft p-4 space-y-2 relative"
                 style={{ transform: `rotate(${idx % 2 === 0 ? '-0.5deg' : '0.5deg'})` }}
            >
              <div className="flex justify-between items-center">
                <span className="font-display text-2xl font-bold text-postal">{item.step}</span>
              </div>
              <h3 className="font-display text-lg text-ink font-bold">{item.title}</h3>
              <p className="font-body text-xs text-ink/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lower Dashboard Area: Popular Destinations & Budget at a Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-0">
        
        {/* Popular Destinations Strip */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-baseline px-2">
            <div>
              <h2 className="font-display text-3xl text-ink">Curated Destinations</h2>
              <p className="font-body text-sm text-ink/60">Top-rated cities with verified cost indices & popularity scores.</p>
            </div>
            <Link href="/cities" className="font-display text-base text-postal hover:underline">
              Explore all →
            </Link>
          </div>
          
          {isCitiesLoading ? (
            <div className="flex gap-6 px-2 overflow-hidden">
              {[1, 2, 3].map(i => <PaperSkeleton key={i} className="w-[220px] h-[280px] shrink-0" />)}
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-2 px-2 items-center no-scrollbar">
              {(cities || []).map((city: any) => {
                const img = city.imageUrl || city.image_url || getImageByCityName(city.name);

                return (
                  <div key={city.id} className="snap-center shrink-0 relative group cursor-pointer" onClick={() => router.push(`/cities?search=${encodeURIComponent(city.name)}`)}>
                    <PolaroidCard 
                      id={city.id} 
                      caption={city.name} 
                      imageUrl={img} 
                      className="w-[200px] md:w-[220px] transition-transform group-hover:-translate-y-2" 
                    />
                    {(city.costIndex || city.cost_index) && (
                      <div className="absolute -bottom-2 right-2 z-10">
                        <LuggageTag label="Cost Index" value={`$${city.costIndex || city.cost_index}/day`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Budget at a Glance Card */}
        <section className="space-y-4">
          <div className="px-2">
            <h2 className="font-display text-3xl text-ink">Budget Overview</h2>
            <p className="font-body text-sm text-ink/60">Live financial aggregation.</p>
          </div>

          <div 
            className="bg-paper p-6 sm:p-8 border-2 border-kraft relative shadow-sm space-y-5"
            style={{ transform: "rotate(1deg)", clipPath: "polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)" }}
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-ink/60">Cumulative Trip Spend</span>
              <p className="font-display text-4xl sm:text-5xl text-ink mt-1">
                ${budgetSummary.total.toLocaleString()}
              </p>
            </div>

            <div className="pt-4 border-t-2 border-kraft border-dashed flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 border-ink ${
                budgetSummary.status === "good" ? "bg-moss" : 
                budgetSummary.status === "warning" ? "bg-marigold" : "bg-postal"
              }`} />
              <span className="font-body text-sm text-ink font-bold">
                {budgetSummary.status === "good" ? "Financials on track" : 
                 budgetSummary.status === "warning" ? "Approaching budget threshold" : "Trending over threshold"}
              </span>
            </div>

            <p className="font-body text-xs text-ink/60 leading-relaxed pt-1">
              Derived automatically from planned stop section budgets and scheduled ticket activities across all your active journeys.
            </p>

            <Link
              href="/trips"
              className="block text-center font-display text-sm text-postal border border-postal hover:bg-postal/10 py-2 transition-colors"
              style={{ borderRadius: "2px" }}
            >
              Manage Trip Budgets →
            </Link>
          </div>
        </section>
        
      </div>

      {/* Community Story Teaser */}
      {communityPosts && communityPosts.length > 0 && (
        <section className="bg-kraft/10 border-2 border-dashed border-kraft p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-postal">Recent Field Notes</span>
              <h2 className="font-display text-2xl text-ink">From the Traveler Community</h2>
            </div>
            <Link href="/community" className="font-display text-sm text-denim hover:underline">
              Join Conversation →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityPosts.slice(0, 2).map((post: any) => (
              <div key={post.id} className="bg-paper border border-kraft p-4 space-y-2 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-kraft/40 border border-ink overflow-hidden flex items-center justify-center font-display text-sm">
                    {post.user_photo ? <img src={post.user_photo} alt="user" className="w-full h-full object-cover" /> : (post.user_name?.charAt(0) || 'T')}
                  </div>
                  <div>
                    <h4 className="font-display text-base text-ink leading-none">{post.user_name || 'Traveler'}</h4>
                    <span className="font-mono text-[10px] text-ink/50">{post.trip_name ? post.trip_name : 'Shared Story'}</span>
                  </div>
                </div>
                <p className="font-body text-xs text-ink/80 line-clamp-2 italic">“{post.caption}”</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
