"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StampButton } from "@/components/ui/stamp-button";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCopyTrip } from "@/lib/hooks/useTrips";
import { motion, AnimatePresence } from "framer-motion";

export function PublicTripClient({ initialData, shareSlug }: { initialData: any; shareSlug: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const copyTrip = useCopyTrip();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(initialData?.stops?.[0]?.id || null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { trip, stops, budget } = initialData;
  const selectedStop = stops?.find((s: any) => s.id === selectedStopId) || null;

  const handleCopyTrip = () => {
    if (!user) {
      router.push(`/login?returnTo=/trip/${shareSlug}`);
      return;
    }
    
    setIsCopying(true);
    copyTrip.mutate(trip.id, {
      onSuccess: (newTrip) => {
        setCopySuccess(true);
        setTimeout(() => {
          router.push(`/trips/${newTrip.id}`);
        }, 1500);
      },
      onError: () => {
        setIsCopying(false);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="w-full max-w-7xl">
      {/* Postcard Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-4 border-b-2 border-dashed border-kraft pb-4 px-4">
        <div className="flex items-center gap-4">
          {trip.user_photo_url ? (
            <img src={trip.user_photo_url} alt={trip.user_name} className="w-12 h-12 rounded-full border-2 border-kraft shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-kraft/40 border-2 border-kraft flex items-center justify-center">
              <span className="font-display text-xl text-ink/50">{trip.user_name?.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-display text-xl text-ink/70">A postcard from</p>
            <p className="font-display text-3xl text-ink">{trip.user_name}</p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
          <div className="flex gap-2 mr-4">
            <button onClick={handleCopyLink} className="p-2 border-2 border-kraft bg-paper text-ink rounded-sm transform hover:-rotate-6 hover:bg-kraft/20 transition-all shadow-sm">
              <Icons.Share className="w-5 h-5" />
            </button>
            <button className="p-2 border-2 border-postal bg-postal/10 text-postal rounded-sm transform hover:rotate-6 transition-all shadow-sm font-display">
              f
            </button>
          </div>
          
          <StampButton 
            onClick={handleCopyTrip}
            disabled={isCopying || copySuccess}
            className={`
              ${copySuccess ? "bg-moss text-paper border-moss" : "bg-postal text-paper border-postal hover:bg-postal/90"}
            `}
          >
            {copySuccess ? "Copied!" : isCopying ? "Copying..." : "Copy this trip"}
          </StampButton>
        </div>
      </div>

      {/* Journal Layout */}
      <div className="w-full bg-paper min-h-[600px] shadow-2xl relative flex flex-col md:flex-row p-4 md:p-8">
        
        {/* Journal Spine */}
        <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-kraft/40 -translate-x-1/2 hidden md:block shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] z-10" />

        {/* LEFT PAGE: Stops */}
        <section className="w-full md:w-1/2 md:pr-12 lg:pr-16 flex flex-col relative min-h-[600px]">
          <h1 className="font-display text-4xl text-ink mb-6">{trip.name}</h1>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {stops?.map((stop: any, index: number) => (
              <div 
                key={stop.id}
                onClick={() => setSelectedStopId(stop.id)}
                className={`
                  relative flex gap-4 p-3 border-2 transition-all cursor-pointer bg-paper
                  ${selectedStopId === stop.id 
                    ? "border-postal shadow-sm transform scale-[1.02] z-10" 
                    : "border-kraft/30 hover:border-kraft/60 hover:-translate-y-0.5"}
                `}
                style={{
                  transform: selectedStopId === stop.id ? "scale(1.02) rotate(-1deg)" : "rotate(0deg)"
                }}
              >
                <div className="w-16 h-16 shrink-0 border border-kraft bg-kraft/20 p-1 transform rotate-2">
                  <img src={stop.city_image_url} alt={stop.city_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl text-ink truncate">{stop.title || stop.city_name}</h3>
                  <div className="flex gap-2 mt-1">
                    <LuggageTag text={new Date(stop.arrival_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <span className="text-ink/40">to</span>
                    <LuggageTag text={new Date(stop.departure_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-postal text-paper flex items-center justify-center font-display text-sm shadow-sm">
                  {stop.activities?.length || 0}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT PAGE: Details */}
        <section className="w-full md:w-1/2 md:pl-12 lg:pl-16 pt-12 md:pt-0 relative min-h-[600px] border-t-2 md:border-t-0 border-kraft/40 md:border-transparent mt-12 md:mt-0">
          <AnimatePresence mode="wait">
            {!selectedStopId ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center px-8"
              >
                <Icons.Compass className="w-16 h-16 text-kraft/50 mb-6" />
                <p className="font-display text-2xl text-ink/40">Select a stop to view details</p>
              </motion.div>
            ) : selectedStop ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="mb-6">
                  <h2 className="font-display text-3xl text-ink">{selectedStop.title || selectedStop.city_name}</h2>
                  <p className="font-body text-ink/60 mt-1">{selectedStop.city_country} • {selectedStop.notes}</p>
                </div>
                
                <h3 className="font-display text-xl text-ink/70 mb-4 border-b-2 border-dashed border-kraft pb-2">Planned Activities</h3>
                <div className="flex-1 overflow-y-auto space-y-3 pb-20 pr-2">
                  {selectedStop.activities?.length ? selectedStop.activities.map((act: any) => (
                    <div key={act.id || act.stop_activity_id} className="relative group bg-paper border border-kraft shadow-sm flex items-center">
                      <div className="w-2 h-full bg-postal absolute left-0 top-0 bottom-0" />
                      <div className="flex-1 pl-6 pr-4 py-3 flex justify-between items-center relative overflow-hidden">
                        <div>
                          <p className="font-display text-lg text-ink truncate">{act.activity_name}</p>
                          <div className="flex gap-3 text-xs font-body text-ink/60 uppercase mt-1 tracking-wider">
                            <span>{new Date(act.scheduled_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span>{act.scheduled_time || `${Math.round((act.est_duration_mins || 60)/60)}h`}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <LuggageTag text={`$${act.actual_cost}`} className="bg-kraft text-ink" />
                        </div>
                      </div>
                      <div className="absolute -right-1 top-0 bottom-0 w-2 flex flex-col justify-between overflow-hidden opacity-50">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-kraft -ml-1" />
                        ))}
                      </div>
                    </div>
                  )) : (
                    <p className="font-body text-ink/50 italic text-center py-8">No activities planned.</p>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
