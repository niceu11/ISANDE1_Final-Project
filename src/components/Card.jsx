import './Card.css';

export default function Card({ children, accent, title, subtitle, className = '' }) {
  return (
    <div className={`card ${accent ? `card-accent card-accent-${accent}` : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          {title    && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
