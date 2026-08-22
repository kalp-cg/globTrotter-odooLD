"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminUserTrips } from "@/lib/hooks/useAdmin";
import { PaperSkeleton } from "./paper-skeleton";
import { StampButton } from "./stamp-button";
import { LuggageTag } from "./luggage-tag";

interface UserTripsSlideoverProps {
  userId: string | null;
  userName: string | null;
  onClose: () => void;
}

export function UserTripsSlideover({ userId, userName, onClose }: UserTripsSlideoverProps) {
  const { data: rawTrips, isLoading } = useAdminUserTrips(userId);
  const trips: any[] = Array.isArray(rawTrips) ? rawTrips : ((rawTrips as any)?.data || []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {userId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100]"
          />

          {/* Slideover Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-paper border-l-4 border-kraft shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-dashed border-kraft flex items-center justify-between bg-kraft/10">
              <div>
                <h2 className="font-display text-2xl text-ink">User Trips</h2>
                <p className="font-body text-sm text-ink/60">{userName}</p>
              </div>
              <StampButton onClick={onClose} className="bg-paper text-ink px-3 py-1">
                Close
              </StampButton>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
              {isLoading ? (
                <>
                  <PaperSkeleton className="w-full h-24 mb-4" />
                  <PaperSkeleton className="w-full h-24 mb-4" />
                  <PaperSkeleton className="w-full h-24" />
                </>
              ) : trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink/40 font-body text-center space-y-4">
                  <span className="font-display text-4xl">🧳</span>
                  <p>This user hasn't created any trips yet.</p>
                </div>
              ) : (
                trips.map((trip: any) => (
                  <div 
                    key={trip.id} 
                    className="bg-paper border-2 border-kraft p-4 shadow-sm relative group hover:shadow-md transition-shadow"
                    style={{ transform: `rotate(${Math.random() * 2 - 1}deg)` }}
                  >
                    <div className="absolute top-2 right-2 flex gap-2">
                      {trip.is_public && <LuggageTag text="Public" className="bg-moss/10 text-moss" />}
                    </div>
                    <h3 className="font-display text-xl text-ink pr-16">{trip.name || trip.title}</h3>
                    
                    <div className="flex gap-4 mt-3 font-mono text-xs text-ink/70">
                      <div>
                        <span className="block text-ink/40 mb-1">Start Date</span>
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Flexible'}
                      </div>
                      <div>
                        <span className="block text-ink/40 mb-1">End Date</span>
                        {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
