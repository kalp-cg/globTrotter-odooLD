"use client";

import React, { useMemo } from "react";
import Image from "next/image";

interface PolaroidCardProps {
  id: string; // Used to seed the rotation deterministically
  imageUrl?: string;
  caption: string;
  className?: string;
}

// Simple deterministic hash to avoid re-rendering random values
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return hash;
}

export function PolaroidCard({ id, imageUrl, caption, className = "" }: PolaroidCardProps) {
  const rotation = useMemo(() => {
    const hash = Math.abs(hashString(id));
    return (hash % 6) - 3; // Value between -3 and 3
  }, [id]);

  // Jittered polygon for the photo edge
  const photoClipPath = "polygon(2% 1%, 98% 3%, 99% 98%, 1% 99%)";

  return (
    <div 
      className={`relative bg-paper p-3 pb-6 border border-kraft/50 ${className}`}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        clipPath: "polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" // extremely subtle outline, not a drop shadow blur
      }}
    >
      {/* Offset paper shadow layer using pseudo-element trick */}
      <div 
        className="absolute inset-0 bg-kraft -z-10"
        style={{ transform: "rotate(2deg) translate(2px, 3px)" }}
      />
      
      {/* Washi tape strip */}
      <div 
        className="absolute -top-3 right-4 w-12 h-6 bg-kraft/80 backdrop-blur-sm z-20"
        style={{ 
          transform: "rotate(12deg)",
          clipPath: "polygon(5% 0, 95% 5%, 100% 100%, 0 95%)"
        }}
      />

      <div 
        className="relative w-full aspect-[4/3] bg-kraft/30 mb-4 overflow-hidden"
        style={{ clipPath: photoClipPath }}
      >
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={caption}
            fill
            className="object-cover grayscale-[15%] contrast-125 sepia-[10%]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-display">
            No Photo
          </div>
        )}
      </div>

      <div className="text-center font-display text-xl text-ink px-2 leading-tight">
        {caption}
      </div>
    </div>
  );
}
