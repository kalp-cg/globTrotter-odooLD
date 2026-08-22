"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScribbleCheckProps {
  show: boolean;
  onComplete?: () => void;
  className?: string;
}

export function ScribbleCheck({ show, onComplete, className = "" }: ScribbleCheckProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000); // Hide after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          className={`relative w-6 h-6 ${className}`}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full text-moss overflow-visible" fill="none">
            <motion.path
              d="M10 20 L18 28 L32 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.1))"
              }}
            />
            {/* Hand-drawn style decorative swoosh */}
            <motion.path
              d="M5 30 Q 20 35, 35 25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
