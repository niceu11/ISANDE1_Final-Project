const common = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function ClockIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12L15 14" />
    </svg>
  );
}

export function LocationIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 21C12 21 18.5 14.9 18.5 10C18.5 6.4 15.6 3.5 12 3.5C8.4 3.5 5.5 6.4 5.5 10C5.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function GuestsIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" />
      <path d="M15.5 6.3c1.4 0.3 2.5 1.6 2.5 3.1c0 1.4-0.9 2.6-2.2 3" />
      <path d="M16.5 13.7c1.9 0.6 3.3 2.6 3.3 5" />
    </svg>
  );
}

export function CoordinatorIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="4.5" y="4" width="15" height="17" rx="1.3" />
      <path d="M8 9H16" />
      <path d="M8 13H16" />
      <path d="M8 17H12.5" />
    </svg>
  );
}
