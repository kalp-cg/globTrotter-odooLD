import React from "react";

export function PaperSkeleton({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-kraft/40 ${className}`}
      style={{ 
        // Slight irregular edge to match paper feel
        clipPath: "polygon(1% 1%, 99% 2%, 98% 99%, 2% 98%)" 
      }}
    />
  );
}
