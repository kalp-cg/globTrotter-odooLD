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
  const [isHovered, setIsHovered] = useState(false);
  const deleteTrip = useDeleteTrip();

  const stopsCount = trip.stops?.length || (trip.stops_count as number) || 0;
  const startDate = (trip.startDate || trip.start_date) ? new Date((trip.startDate || trip.start_date)!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '';
  const endDate = (trip.endDate || trip.end_date) ? new Date((trip.endDate || trip.end_date)!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '';

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
          className="relative group w-full max-w-[320px] mx-auto flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tag floating on top-right */}
          <div className="absolute -top-3 -right-3 z-20">
            <LuggageTag 
              text={`${startDate}${endDate ? ' – ' + endDate : ''} • ${stopsCount} stop${stopsCount !== 1 ? 's' : ''}`} 
              className="bg-marigold text-ink shadow-sm"
            />
          </div>

          {/* The polaroid card itself — no overlapping elements */}
          <PolaroidCard
            id={trip.id}
            caption={trip.name}
            imageUrl={trip.coverPhotoUrl || trip.cover_photo_url || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80"}
            className="w-full"
          />

          {/* Action Buttons — BELOW the card, slide up on hover */}
          <AnimatePresence>
            {!isDeleting && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -8 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center mt-2"
              >
                <div className="bg-paper/95 backdrop-blur-sm px-5 py-2 flex gap-5 border border-kraft shadow-sm rounded-sm">
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

          {/* Delete Confirmation Overlay */}
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

