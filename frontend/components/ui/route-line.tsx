"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import { motion } from "framer-motion";

interface RouteLineProps {
  className?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export function RouteLine({ className = "", startX = 0, startY = 10, endX = 100, endY = 10 }: RouteLineProps) {
  const [pathData, setPathData] = useState<string>("");
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    // Create a temporary SVG to let roughjs generate the path data
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const rc = rough.svg(svg);
    
    // We draw a curve connecting the points
    const node = rc.curve([
      [startX, startY],
      [startX + (endX - startX) / 3, startY - 15],
      [startX + (endX - startX) * 0.6, endY + 15],
      [endX, endY]
    ], {
      roughness: 1.5,
      strokeWidth: 2,
    });

    // Extract the path string from the generated node
    const pathElement = node.querySelector("path");
    if (pathElement) {
      setPathData(pathElement.getAttribute("d") || "");
    }

    return () => {
      isMounted.current = false;
    };
  }, [startX, startY, endX, endY]);

  if (!pathData) return null; // Wait for client hydration to avoid mismatch

  return (
    <svg 
      className={`overflow-visible ${className}`} 
      viewBox={`0 0 ${Math.max(100, endX)} ${Math.max(20, Math.abs(endY - startY) + 20)}`}
      preserveAspectRatio="none"
    >
      <motion.path
        d={pathData}
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeDasharray="8 6"
        fill="none"
        initial={{ strokeDashoffset: 100, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}
