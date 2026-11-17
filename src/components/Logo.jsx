import { useId } from 'react';

export default function Logo({ size = 30 }) {
  const gid = `upg-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="brand-logo-svg">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${gid})`} />
      <rect x="12" y="38" width="9" height="14" rx="2.5" fill="#fff" opacity=".6" />
      <rect x="27.5" y="29" width="9" height="23" rx="2.5" fill="#fff" opacity=".8" />
      <rect x="43" y="20" width="9" height="32" rx="2.5" fill="#fff" />
      <path d="M12 30 L28 17 L35 23 L48 11" fill="none" stroke="#fde047" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M41 10.5 L49.5 10 L49 18.5" fill="none" stroke="#fde047" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
