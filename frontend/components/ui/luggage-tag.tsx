import React from "react";

export interface LuggageTagProps {
  label?: string;
  value?: string | React.ReactNode;
  text?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function LuggageTag({ label, value, text, children, className = "" }: LuggageTagProps) {
  const content = text !== undefined ? text : (children !== undefined ? children : value);

  return (
    <div className={`relative flex items-center bg-kraft pl-8 pr-4 py-1 border border-ink/10 ${className}`}
         style={{ clipPath: "polygon(10px 0%, 100% 0, 100% 100%, 10px 100%, 0 50%)" }}
    >
      {/* Hole punch */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-paper border border-ink/20 z-10" />
      
      {/* String doodle loop */}
      <svg className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ink/40 z-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 12 Q4 0, 0 12 Q4 24, 16 12" />
      </svg>
      
      <div className="flex flex-col font-mono">
        {label && (
          <span className="text-[0.65rem] uppercase tracking-wider text-ink/70 leading-none mb-0.5">{label}</span>
        )}
        <span className="text-sm font-bold text-ink leading-none">{content}</span>
      </div>
    </div>
  );
}
