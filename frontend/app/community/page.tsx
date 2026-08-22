"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCommunityPosts, useCreateCommunityPost, useCopySharedTrip } from "@/lib/hooks/useCommunity";
import { useTrips } from "@/lib/hooks/useTrips";
import { useAuth } from "@/lib/hooks/useAuth";
import { StampButton } from "@/components/ui/stamp-button";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import * as Icons from "@/components/ui/icons";

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: userTripsData } = useTrips();
  const userTrips = userTripsData?.data || [];

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Form state
  const [selectedTripId, setSelectedTripId] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: posts, isLoading } = useCommunityPosts({
    search: search || undefined,
    sort: sortBy,
  });

  const createPostMutation = useCreateCommunityPost();
  const copyTripMutation = useCopySharedTrip();

  const handleShareStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    createPostMutation.mutate({
      trip_id: selectedTripId || undefined,
      caption: caption.trim(),
      image_url: imageUrl.trim() || undefined,
    }, {
      onSuccess: () => {
        setIsShareModalOpen(false);
        setCaption("");
        setImageUrl("");
        setSelectedTripId("");
      }
    });
  };

  const handleCopyItinerary = (slug: string) => {
    copyTripMutation.mutate(slug, {
      onSuccess: (cloned) => {
        alert("Itinerary successfully copied to your scrapbook!");
        router.push(`/trips/${cloned.id}`);
      },
      onError: (err: any) => {
        alert("Could not copy trip: " + err.message);
      }
    });
  };

  return (
    <main className="min-h-screen bg-paper py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Scrapbook Community Header */}
        <div className="bg-paper border-2 border-kraft p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative"
             style={{ clipPath: "polygon(0% 1%, 100% 0%, 99.5% 99%, 0.5% 100%)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-postal bg-postal/10 px-2 py-0.5 border border-postal/20">
                Traveler Network
              </span>
            </div>
            <h1 className="font-display text-4xl text-ink mt-1">Community tab</h1>
            <p className="font-body text-sm text-ink/70 mt-1 max-w-xl">
              Where travelers share field notes, itinerary tips, and memorable stops. Explore real journeys and copy itineraries to customize your own.
            </p>
          </div>

          <StampButton
            onClick={() => setIsShareModalOpen(true)}
            variant="primary"
            className="self-start md:self-auto shrink-0"
          >
            + Share Field Notes
          </StampButton>
        </div>

        {/* Wireframe Screen 10 Toolbar: Search bar, Group by, Filter, Sort by */}
        <div className="bg-kraft/15 p-4 border border-kraft flex flex-col sm:flex-row items-center justify-between gap-4"
             style={{ transform: "rotate(-0.5deg)" }}
        >
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search community posts & stories..."
              className="w-full bg-paper border-2 border-kraft px-3 py-1.5 pl-9 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-postal"
            />
            <Icons.Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Group / Sort Options */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="font-mono text-xs text-ink/60">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-paper border border-kraft text-xs font-display text-ink px-3 py-1.5 focus:outline-none focus:border-postal"
            >
              <option value="newest">Recent Stories</option>
              <option value="oldest">Earliest Journeys</option>
            </select>
          </div>
        </div>

        {/* Share Story Card Form Modal */}
        {isShareModalOpen && (
          <div className="bg-paper border-2 border-postal p-6 md:p-8 shadow-xl relative animate-in fade-in duration-200"
               style={{ transform: "rotate(0.5deg)" }}
          >
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-kraft mb-4">
              <h2 className="font-display text-2xl text-ink">Post an Experience</h2>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="font-mono text-sm text-ink/40 hover:text-postal transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleShareStory} className="space-y-4">
              {userTrips.length > 0 && (
                <div>
                  <label className="block font-display text-sm text-ink/80 mb-1">Attach an Itinerary (Optional):</label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full bg-paper border border-kraft p-2 font-body text-sm text-ink focus:border-postal focus:outline-none"
                  >
                    <option value="">No itinerary linked</option>
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-display text-sm text-ink/80 mb-1">Your Travel Story & Notes:</label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell fellow travelers about hidden gems, daily budgets, or must-see spots..."
                  className="w-full bg-paper border border-kraft p-3 font-body text-sm text-ink placeholder:text-ink/40 focus:border-postal focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-display text-sm text-ink/80 mb-1">Pick a Curated Photo or Enter URL:</label>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {[
                    { name: 'Tokyo', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Kyoto', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Paris', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Santorini', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Barcelona', url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Cairo', url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Sydney', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Rome', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80' },
                    { name: 'New York', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop&q=80' },
                  ].map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`shrink-0 text-xs font-display px-2.5 py-1 border transition-all cursor-pointer ${
                        imageUrl === img.url ? 'bg-postal text-paper border-ink font-bold scale-105' : 'bg-kraft/20 border-kraft text-ink hover:bg-kraft/40'
                      }`}
                      style={{ borderRadius: '2px' }}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-paper border border-kraft p-2 font-body text-sm text-ink placeholder:text-ink/40 focus:border-postal focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="font-display text-sm text-ink/60 hover:text-ink px-4 py-2"
                >
                  Cancel
                </button>
                <StampButton type="submit" variant="primary">
                  {createPostMutation.isPending ? "Posting..." : "Publish to Community"}
                </StampButton>
              </div>
            </form>
          </div>
        )}

        {/* Community Feed Stream (Screen 10 layout: avatar circle on left + post card on right) */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <PaperSkeleton className="w-12 h-12 rounded-full shrink-0" />
                <PaperSkeleton className="flex-1 h-44" />
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-kraft bg-kraft/10 p-8">
            <Icons.Compass className="w-16 h-16 text-ink/30 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-ink/70">No community field notes yet</h3>
            <p className="font-body text-sm text-ink/50 mt-1">Be the first to share an itinerary with other travelers!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, idx) => {
              const rotation = idx % 2 === 0 ? "-0.7deg" : "0.7deg";

              return (
                <div key={post.id} className="flex gap-4 sm:gap-6 items-start">
                  
                  {/* Left: Traveler Avatar (Circular wireframe pin) */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-kraft/40 border-2 border-ink overflow-hidden shrink-0 flex items-center justify-center shadow-sm"
                       style={{ transform: `rotate(${rotation})` }}
                  >
                    {post.user_photo ? (
                      <img src={post.user_photo} alt={post.user_name || "Traveler"} className="w-full h-full object-cover grayscale-[15%]" />
                    ) : (
                      <span className="font-display text-lg font-bold text-ink">
                        {post.user_name?.charAt(0) || "T"}
                      </span>
                    )}
                  </div>

                  {/* Right: Post Card */}
                  <div className="flex-1 bg-paper border-2 border-kraft p-5 sm:p-6 shadow-sm space-y-3 relative group"
                       style={{ transform: `rotate(${rotation})` }}
                  >
                    {/* Author & Timestamp Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-dashed border-kraft/60">
                      <div>
                        <h4 className="font-display text-xl text-ink leading-tight">{post.user_name || "Traveler"}</h4>
                        <span className="font-mono text-xs text-ink/50">
                          {post.user_city || post.user_country ? `${post.user_city || ''}${post.user_city && post.user_country ? ', ' : ''}${post.user_country || ''} • ` : ''}
                          {post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                        </span>
                      </div>

                      {post.trip_name && (
                        <span className="font-display text-xs text-postal bg-postal/10 border border-postal/30 px-2.5 py-1">
                          {post.trip_name}
                        </span>
                      )}
                    </div>

                    {/* Story Caption */}
                    <p className="font-body text-base text-ink/90 leading-relaxed whitespace-pre-wrap">
                      {post.caption}
                    </p>

                    {/* Attached Photo */}
                    {post.image_url && (
                      <div className="mt-3 p-1.5 bg-kraft/20 border border-ink/20 rounded-sm overflow-hidden max-h-96">
                        <img 
                          src={post.image_url} 
                          alt="Story photo" 
                          className="w-full h-full object-cover max-h-80"
                        />
                      </div>
                    )}

                    {/* Action Bar: Copy Itinerary or View */}
                    {post.trip_slug && (
                      <div className="pt-3 border-t border-dashed border-kraft/60 flex flex-wrap items-center justify-between gap-3">
                        <Link 
                          href={`/trip/${post.trip_slug}`}
                          className="font-display text-sm text-denim hover:underline"
                        >
                          View Public Journal →
                        </Link>

                        <button
                          onClick={() => post.trip_slug && handleCopyItinerary(post.trip_slug)}
                          disabled={copyTripMutation.isPending}
                          className="bg-postal text-paper font-display text-sm px-4 py-1.5 border border-ink shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                          style={{ borderRadius: "2px" }}
                        >
                          <Icons.Share className="w-3.5 h-3.5" />
                          Copy Itinerary to My Trips
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
