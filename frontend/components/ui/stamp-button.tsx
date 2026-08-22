"use client";

import React from "react";
import { motion } from "framer-motion";

interface StampButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function StampButton({ variant = "primary", children, className = "", ...props }: StampButtonProps) {
  const isPrimary = variant === "primary";
  
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Offset shadow layer */}
      <div 
        className="absolute inset-0 bg-ink"
        style={{ 
          transform: "rotate(1.5deg) translate(3px, 4px)", 
          zIndex: 0,
          borderRadius: "1px" // Irregular corner
        }} 
      />
      
      {/* Main button surface */}
      <motion.button
        whileTap={{ scale: 0.95, y: 2 }}
        className={`
          relative z-10 px-6 py-3 font-display text-lg font-bold
          border-2 border-ink tracking-wide
          ${isPrimary ? "bg-postal text-paper" : "bg-paper text-ink"}
        `}
        style={{ 
          transform: "rotate(-1deg)",
          borderRadius: "2px",
          clipPath: "polygon(1% 2%, 99% 1%, 98% 99%, 2% 98%)" // Hand-cut edge feel
        }}
        {...props}
      >
        {children}
      </motion.button>
    </div>
  );
}
