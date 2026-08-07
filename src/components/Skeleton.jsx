import './Skeleton.css';

export function SkeletonBlock({ height = 16, width = '100%', radius = 4, style = {} }) {
  return <div className="skeleton-block" style={{ height, width, borderRadius: radius, ...style }} />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <SkeletonBlock height={13} width="55%" style={{ marginBottom: 14 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <SkeletonBlock height={12} width="65%" />
          <SkeletonBlock height={12} width="20%" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardSkeleton({ statCount = 3, showHero = false }) {
  return (
    <div className="skeleton-dashboard">
      {showHero && <SkeletonBlock height={280} radius={12} />}
      {statCount > 0 && (
        <div className="skeleton-stats">
          {Array.from({ length: statCount }).map((_, i) => (
            <div key={i} className="skeleton-card skeleton-stat">
              <SkeletonBlock height={30} width="40%" style={{ marginBottom: 10 }} />
              <SkeletonBlock height={11} width="60%" />
            </div>
          ))}
        </div>
      )}
      <div className="skeleton-grid">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
