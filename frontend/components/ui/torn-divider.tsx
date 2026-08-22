import React from "react";

export function TornDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-4 overflow-hidden text-kraft ${className}`} aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 10">
        <path 
          d="M0,5 L2,2 L5,8 L8,1 L11,9 L14,3 L17,7 L20,2 L23,8 L26,1 L29,9 L32,3 L35,7 L38,2 L41,8 L44,1 L47,9 L50,3 L53,7 L56,2 L59,8 L62,1 L65,9 L68,3 L71,7 L74,2 L77,8 L80,1 L83,9 L86,3 L89,7 L92,2 L95,8 L98,1 L100,5 L100,10 L0,10 Z" 
          fill="currentColor" 
        />
      </svg>
    </div>
  );
}
