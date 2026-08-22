"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateTrip } from "@/lib/hooks/useTrips";
import { useCities } from "@/lib/hooks/useCities";
import { StampButton } from "@/components/ui/stamp-button";
import { PolaroidCard } from "@/components/ui/polaroid-card";
import { TornDivider } from "@/components/ui/torn-divider";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";

export default function CreateTripPage() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  
  // Pulling cities for the "Suggestions" section
  const { data: suggestions, isLoading: isLoadingSuggestions } = useCities({ sort: "popular", limit: "6" });

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [nameError, setNameError] = useState("");
  const [dateError, setDateError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    if (!name.trim()) {
      setNameError("Please provide a name for this trip");
      hasError = true;
    } else {
      setNameError("");
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setDateError("End date must be after start date");
      hasError = true;
    } else {
      setDateError("");
    }

    if (hasError) return;

    // Use destination as description for now, or concatenate it
    createTrip.mutate(
      {
        name,
        startDate,
        endDate,
        description: destination ? `Destination: ${destination}` : undefined,
      },
      {
        onSuccess: (trip) => {
          router.push(`/trips/${trip.id}`);
        },
      }
    );
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto space-y-12 pb-24">
      
      {/* Top Form Section */}
      <section className="bg-paper p-8 sm:p-12 border border-kraft/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] relative"
        style={{
          // Subtly torn edges overall
          clipPath: "polygon(1% 0%, 99% 1%, 100% 99%, 0% 98%)",
          borderRadius: "2px"
        }}
      >
        <h1 className="font-display text-4xl text-ink mb-10 border-b-2 border-kraft pb-4">
          Plan a new trip
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          
          {/* Trip Name Field */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
            <label className="font-display text-xl text-ink w-40 shrink-0">Trip Name :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value) setNameError("");
              }}
              placeholder="Summer Vacation..."
              className="flex-1 bg-transparent border-b-2 border-dashed border-ink/40 focus:border-ink focus:border-solid outline-none px-2 py-1 font-body text-lg text-ink transition-colors"
            />
            {nameError && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-4 hidden md:flex items-center text-postal whitespace-nowrap"
              >
                <span className="font-display text-sm leading-none">{nameError}</span>
              </motion.div>
            )}
          </div>

          {/* Destination Field */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
            <label className="font-display text-xl text-ink w-40 shrink-0">Select a Place :</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              className="flex-1 bg-transparent border-b-2 border-dashed border-ink/40 focus:border-ink focus:border-solid outline-none px-2 py-1 font-body text-lg text-ink transition-colors"
            />
          </div>

          {/* Start Date Field */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
            <label className="font-display text-xl text-ink w-40 shrink-0">Start Date :</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateError("");
              }}
              className="flex-1 max-w-[200px] bg-transparent border-b-2 border-dashed border-ink/40 focus:border-ink focus:border-solid outline-none px-2 py-1 font-body text-lg text-ink transition-colors uppercase tracking-wide"
            />
          </div>

          {/* End Date Field */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
            <label className="font-display text-xl text-ink w-40 shrink-0">End Date :</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateError("");
              }}
              className="flex-1 max-w-[200px] bg-transparent border-b-2 border-dashed border-ink/40 focus:border-ink focus:border-solid outline-none px-2 py-1 font-body text-lg text-ink transition-colors uppercase tracking-wide"
            />
            
            {dateError && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-4 hidden md:flex items-center text-postal whitespace-nowrap"
              >
                <span className="font-display text-sm leading-none">{dateError}</span>
              </motion.div>
            )}
          </div>

          <div className="pt-6">
            <StampButton 
              type="submit" 
              variant="primary" 
              disabled={createTrip.isPending}
              className={createTrip.isPending ? "opacity-50" : ""}
            >
              {createTrip.isPending ? "Creating..." : "Create Trip"}
            </StampButton>
          </div>
        </form>
      </section>

      <TornDivider className="my-8" />

      {/* Suggestions Section */}
      <section>
        <h2 className="font-display text-3xl text-ink mb-8">
          Suggestions for Places to Visit / Activities to perform
        </h2>
        
        {isLoadingSuggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PaperSkeleton key={i} className="w-full aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(suggestions || []).slice(0, 6).map((city) => (
              <div 
                key={city.id} 
                className="cursor-pointer group"
                onClick={() => setDestination(city.name)}
              >
                <PolaroidCard
                  id={city.id}
                  caption={city.name}
                  imageUrl={city.imageUrl}
                  className="w-full transition-transform group-hover:scale-105"
                />
              </div>
            ))}
            
            {/* Fallback empty blocks if fewer than 6 cities exist */}
            {(suggestions || []).length === 0 && (
              <div className="col-span-full font-body text-ink/50 text-center py-12 border-2 border-dashed border-kraft">
                No suggestions available at the moment.
              </div>
            )}
          </div>
        )}
      </section>

    </main>
  );
}
