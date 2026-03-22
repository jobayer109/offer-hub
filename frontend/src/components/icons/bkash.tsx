interface BkashIconProps {
  className?: string;
}

export function BkashIcon({ className = 'h-5 w-5' }: BkashIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="4" fill="#E2136E" />
      <path
        d="M7.5 6.5L12 12L7.5 17.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.5L16.5 12L12 17.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
