import './Card.css';

export default function Card({ children, accent, title, subtitle, urgent, badge, className = '' }) {
  return (
    <div className={`card ${accent ? `card-accent card-accent-${accent}` : ''} ${urgent ? 'card-urgent' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          <div className="card-header-row">
            {title && <h3 className="card-title">{title}</h3>}
            {badge != null && <span className="card-badge">{badge}</span>}
          </div>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
