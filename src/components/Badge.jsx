import './Badge.css';

const VARIANTS = {
  hot:       { label: 'Hot',       className: 'badge-hot' },
  warm:      { label: 'Warm',      className: 'badge-warm' },
  cold:      { label: 'Cold',      className: 'badge-cold' },
  confirmed: { label: 'Confirmed', className: 'badge-confirmed' },
  pencil:    { label: 'Pencil',    className: 'badge-pencil' },
  overdue:   { label: 'Overdue',   className: 'badge-overdue' },
  verified:  { label: 'Verified',  className: 'badge-verified' },
  pending:   { label: 'Pending',   className: 'badge-pending' },
};

export default function Badge({ variant, label }) {
  const cfg = VARIANTS[variant] ?? { label: variant, className: 'badge-pending' };
  return (
    <span className={`badge ${cfg.className}`}>
      {label ?? cfg.label}
    </span>
  );
}
