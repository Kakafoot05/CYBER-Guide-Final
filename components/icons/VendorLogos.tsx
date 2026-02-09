import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// --- LOGOS OUTILS INTERNES (CYBER GUIDE) ---

export const IncidentReportIcon: React.FC<IconProps> = ({ className = '', size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
    <rect
      x="8"
      y="6"
      width="24"
      height="28"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M14 12H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 18H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 24H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle
      cx="28"
      cy="28"
      r="6"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path d="M28 25V28L30 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const LogInvestigatorIcon: React.FC<IconProps> = ({ className = '', size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M4 10H36" stroke="currentColor" strokeWidth="2" />
    <path d="M4 20H36" stroke="currentColor" strokeWidth="2" />
    <path d="M4 30H20" stroke="currentColor" strokeWidth="2" />
    <circle cx="28" cy="28" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M34 34L38 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PhishingTriageIcon: React.FC<IconProps> = ({ className = '', size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
    <path
      d="M4 8L20 20L36 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 26L20 30L24 26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M20 18V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const GenericToolIcon: React.FC<IconProps> = ({ className = '', size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
    <path
      d="M20 4L4 12L20 20L36 12L20 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M4 12V28L20 36V20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M36 12V28L20 36" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

// --- CATEGORY ICONS (PLACEHOLDERS STACK) ---

// Icone SIEM & Data (Database + Search)
export const SiwmLogo: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 21l-4.35-4.35" />
    <path d="M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
    <path d="M8 11h4" />
    <path d="M8 15h2" />
    <path d="M8 7h3" />
  </svg>
);

// Icone Cloud Infra (Nuage connecté)
export const CloudLogo: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.2-3.2-2.7-5.8-5.9-6C4.2 10 2 12.5 2 15.5c0 2.6 1.8 4.7 4.3 5.3" />
    <path d="M22 16.6A4.1 4.1 0 0 0 18 10" />
    <path d="M12 14v8" />
    <path d="M8 18h8" />
  </svg>
);

// Icone Endpoint/EDR (Shield + Pulse)
export const EndpointLogo: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

// Icone Standards/GRC (Structure/Hierarchie)
export const FrameworkLogo: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <path d="M10 6.5h4" />
    <path d="M6.5 10v4h4" />
  </svg>
);
