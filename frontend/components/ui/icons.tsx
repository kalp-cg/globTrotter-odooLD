import React from "react";

// Helper for consistent stroke style across all icons
const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

export function Compass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <circle cx="12" cy="12" r="10" {...strokeProps} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" {...strokeProps} />
    </svg>
  );
}

export function Suitcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" {...strokeProps} />
      <path d="M8 7V3h8v4" {...strokeProps} />
      <path d="M12 21V7" {...strokeProps} />
    </svg>
  );
}

export function Passport(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="1" {...strokeProps} />
      <circle cx="12" cy="10" r="3" {...strokeProps} />
      <path d="M8 17h8" {...strokeProps} />
    </svg>
  );
}

export function CoinPurse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M19 8c0-2.21-3.13-4-7-4S5 5.79 5 8" {...strokeProps} />
      <path d="M3 11a1 1 0 011-1h16a1 1 0 011 1v7a3 3 0 01-3 3H6a3 3 0 01-3-3v-7z" {...strokeProps} />
      <circle cx="12" cy="15" r="2" {...strokeProps} />
    </svg>
  );
}

export function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" {...strokeProps} />
      <circle cx="12" cy="10" r="3" {...strokeProps} />
    </svg>
  );
}

export function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" {...strokeProps} />
      <path d="M16 2v4M8 2v4M3 10h18" {...strokeProps} />
    </svg>
  );
}

export function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M12 5v14M5 12h14" {...strokeProps} />
    </svg>
  );
}

export function Trash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" {...strokeProps} />
    </svg>
  );
}

export function EditPencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...strokeProps} />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...strokeProps} />
    </svg>
  );
}

export function DragHandle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <circle cx="9" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <circle cx="18" cy="5" r="3" {...strokeProps} />
      <circle cx="6" cy="12" r="3" {...strokeProps} />
      <circle cx="18" cy="19" r="3" {...strokeProps} />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" {...strokeProps} />
    </svg>
  );
}

export function Chevron(props: React.SVGProps<SVGSVGElement> & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const { direction = 'down', ...rest } = props;
  const rotation = { up: 180, right: -90, left: 90, down: 0 }[direction];
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      style={{ transform: `rotate(${rotation}deg)` }}
      {...rest}
    >
      <path d="M6 9l6 6 6-6" {...strokeProps} />
    </svg>
  );
}

export function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M20 6L9 17l-5-5" {...strokeProps} />
    </svg>
  );
}

export function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <circle cx="11" cy="11" r="8" {...strokeProps} />
      <path d="M21 21l-4.35-4.35" {...strokeProps} />
    </svg>
  );
}

export function Camera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" {...strokeProps} />
      <circle cx="12" cy="13" r="4" {...strokeProps} />
    </svg>
  );
}
