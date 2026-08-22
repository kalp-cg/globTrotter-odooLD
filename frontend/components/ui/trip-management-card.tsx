"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trip } from "@/lib/api/types";
import { useDeleteTrip } from "@/lib/hooks/useTrips";
import { PolaroidCard } from "./polaroid-card";
import { LuggageTag } from "./luggage-tag";
import * as Icons from "./icons";

interface TripManagementCardProps {
  trip: Trip;
}

export function TripManagementCard({ trip }: TripManagementCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTrip = useDeleteTrip();

  const stopsCount = trip.stops?.length || 0;
  const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '';
  const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '';

  const handleDeleteConfirm = () => {
    deleteTrip.mutate(trip.id);
  };

  return (
    <AnimatePresence>
      {!deleteTrip.isSuccess && (
        <motion.div
          layout
          exit={{ 
            opacity: 0, 
            y: 50, 
            rotateZ: -10, 
            transition: { duration: 0.4, ease: "easeIn" } 
          }}
          className="relative group w-full max-w-[320px] mx-auto"
        >
          <PolaroidCard
            id={trip.id}
            caption={trip.name}
            imageUrl={trip.coverPhotoUrl || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80"}
            className="w-full"
          />
          
          {/* Tag floating on top */}
          <div className="absolute -top-3 -right-3 z-20">
            <LuggageTag 
              text={`${startDate}${endDate ? ' - ' + endDate : ''} • ${stopsCount} stops`} 
              className="bg-marigold text-ink shadow-sm"
            />
          </div>

          {/* Normal Actions Overlay (shows on hover mostly, or always at bottom) */}
          <AnimatePresence>
            {!isDeleting && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20"
              >
                <div className="bg-paper/90 backdrop-blur-sm px-4 py-2 flex gap-4 rounded-sm border border-kraft shadow-sm">
                  
                  <Link href={`/trips/${trip.id}`} title="View Itinerary" className="text-ink hover:text-marigold transition-colors">
                    <Icons.Compass className="w-5 h-5" />
                  </Link>

                  <Link href={`/trips/${trip.id}/edit`} title="Edit Settings" className="text-ink hover:text-postal transition-colors">
                    <Icons.EditPencil className="w-5 h-5" />
                  </Link>

                  <button 
                    onClick={() => setIsDeleting(true)}
                    title="Delete Trip" 
                    className="text-ink hover:text-postal transition-colors"
                  >
                    <Icons.Trash className="w-5 h-5" />
                  </button>
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation State (Tear off this page?) */}
          <AnimatePresence>
            {isDeleting && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-30 bg-paper/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-postal rounded-sm"
              >
                <span className="font-display text-2xl text-postal mb-6">Tear off this page?</span>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleDeleteConfirm}
                    disabled={deleteTrip.isPending}
                    className="font-display text-xl text-paper bg-postal px-4 py-1 transform -rotate-2 hover:scale-105 transition-transform"
                  >
                    {deleteTrip.isPending ? "Tearing..." : "Yes, tear it"}
                  </button>
                  <button 
                    onClick={() => setIsDeleting(false)}
                    disabled={deleteTrip.isPending}
                    className="font-display text-xl text-ink bg-kraft/40 px-4 py-1 transform rotate-1 hover:scale-105 transition-transform"
                  >
                    Keep it
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
