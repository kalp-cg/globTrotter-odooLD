"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50"
          />

          {/* Slide panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] md:w-[450px] bg-paper shadow-2xl z-50 border-l-2 border-kraft flex flex-col"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 1% 95%, 0% 90%, 1% 85%, 0% 80%, 1% 75%, 0% 70%, 1% 65%, 0% 60%, 1% 55%, 0% 50%, 1% 45%, 0% 40%, 1% 35%, 0% 30%, 1% 25%, 0% 20%, 1% 15%, 0% 10%, 1% 5%)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-dashed border-kraft">
              <h2 className="font-display text-2xl text-ink">{title}</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-kraft/40 hover:bg-postal hover:text-paper flex items-center justify-center font-display text-xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
