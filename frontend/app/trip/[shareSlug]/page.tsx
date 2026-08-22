import React from "react";
import { notFound } from "next/navigation";
import { PublicTripClient } from "./public-trip-client";

export const revalidate = 60; // Cache for 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://globtrotter-odoold-lgh6.onrender.com/api";
  const apiUrl = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;
  
  try {
    const res = await fetch(`${apiUrl}/trips/public/${shareSlug}`, {
      next: { tags: [`trip-${shareSlug}`] }
    });
    
    if (!res.ok) return { title: "Trip Not Found" };
    
    const { data } = await res.json();
    return {
      title: `${data.trip.name} - GlobTrotter`,
      description: data.trip.description || `A trip planned on GlobTrotter to ${data.stops?.length || 0} destinations.`,
    };
  } catch (err) {
    return { title: "GlobTrotter Trip" };
  }
}

export default async function PublicTripPage({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://globtrotter-odoold-lgh6.onrender.com/api";
  const apiUrl = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;
  
  let tripData = null;
  let errorMsg = null;

  try {
    const res = await fetch(`${apiUrl}/trips/public/${shareSlug}`, {
      next: { tags: [`trip-${shareSlug}`] }
    });
    
    if (!res.ok) {
      if (res.status === 404 || res.status === 403) {
        errorMsg = "This trip isn't public (anymore)";
      } else {
        errorMsg = "Something went wrong loading this trip.";
      }
    } else {
      const json = await res.json();
      tripData = json.data;
    }
  } catch (err) {
    errorMsg = "Failed to connect to server.";
  }

  if (errorMsg || !tripData) {
    return (
      <main className="min-h-screen bg-kraft/10 flex items-center justify-center p-4">
        <div className="bg-paper p-12 border-2 border-dashed border-kraft text-center shadow-xl transform rotate-1">
          <h1 className="font-display text-3xl text-ink/60">{errorMsg}</h1>
          <p className="font-body text-ink/40 mt-2">The owner might have made it private or deleted it.</p>
        </div>
      </main>
    );
  }

  // Render the client component which handles the interactive journal layout
  return (
    <main className="min-h-screen bg-kraft/10 p-4 md:p-8 flex justify-center">
      <PublicTripClient initialData={tripData} shareSlug={shareSlug} />
    </main>
  );
}
