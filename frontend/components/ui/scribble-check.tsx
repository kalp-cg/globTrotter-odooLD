"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScribbleCheckProps {
  className?: string;
  size?: number;
}

export function ScribbleCheck({ className = "", size = 24 }: ScribbleCheckProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`overflow-visible ${className}`}>
      <motion.path
        // Hand-drawn looking checkmark
        d="M 4,12 C 6,14 8,17 9,19 C 13,12 17,7 21,3"
        stroke="var(--color-moss)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}
