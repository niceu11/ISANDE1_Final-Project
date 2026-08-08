const common = {
  width: 17,
  height: 17,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function DashboardIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1" transform="rotate(45 12 12)" />
    </svg>
  );
}

export function InquiriesIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M3.5 6.5L12 13L20.5 6.5" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5H20.5" />
      <path d="M8 3V6.5" />
      <path d="M16 3V6.5" />
    </svg>
  );
}

export function ClientsIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
    </svg>
  );
}

export function PaymentsIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" />
      <path d="M3 10H21" />
      <path d="M6.5 14.5H10" />
    </svg>
  );
}

export function ReportsIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M5 20V11" />
      <path d="M12 20V4" />
      <path d="M19 20V14" />
      <path d="M3.5 20H20.5" />
    </svg>
  );
}

export function EventDayIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.5L13.6 9.2L19.5 10L14.9 13.8L16.2 19.7L12 16.4L7.8 19.7L9.1 13.8L4.5 10L10.4 9.2Z" />
    </svg>
  );
}

export function HistoryIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 12a8 8 0 1 0 2.6-5.9" />
      <path d="M4 4.5V8.5H8" />
      <path d="M12 8V12.5L15 14.5" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M14 8V5.5C14 4.7 13.3 4 12.5 4H6.5C5.7 4 5 4.7 5 5.5V18.5C5 19.3 5.7 20 6.5 20H12.5C13.3 20 14 19.3 14 18.5V16" />
      <path d="M9.5 12H20" />
      <path d="M17 8.5L20.5 12L17 15.5" />
    </svg>
  );
}
