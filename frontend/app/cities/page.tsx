"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CitySearch } from "@/components/ui/city-search";
import { City } from "@/lib/api/types";
import { StampButton } from "@/components/ui/stamp-button";

export default function CitiesFullPage() {
  const router = useRouter();

  // In a full-page context, selecting a city might mean we want to create a new trip for it
  const handleSelectCity = (city: City) => {
    // Navigate to create trip with this city as the initial destination
    router.push(`/trips/new?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}`);
  };

  return (
    <main className="min-h-screen bg-kraft/10 py-12 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto h-[800px] bg-paper shadow-2xl border-2 border-kraft p-8 flex flex-col relative">
        {/* Torn paper top edge effect */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-kraft/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 50%)" }} />
        
        <div className="mb-8 border-b-2 border-dashed border-kraft pb-6">
          <h1 className="font-display text-4xl text-ink">Explore Destinations</h1>
          <p className="font-body text-ink/60 mt-2">Find the perfect city for your next adventure.</p>
        </div>
        
        <CitySearch onSelectCity={handleSelectCity} className="flex-1" />
      </div>
    </main>
  );
}
