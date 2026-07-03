import ProductCard from './ProductCard';

export function ProductGrid({ records, showReason = false }) {
  return (
    <div className="product-grid" role="list">
      {records.map(r => (
        <ProductCard key={r.id} record={r} showReason={showReason} />
      ))}
    </div>
  );
}

export function RecScroll({ records, showReason = true, ariaLabel = 'Recommended records' }) {
  return (
    <div className="rec-scroll" role="list" aria-label={ariaLabel}>
      {records.map(r => (
        <ProductCard key={r.id} record={r} showReason={showReason} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="product-grid" role="status" aria-busy="true" aria-label="Loading records">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton-cover skeleton" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton md" />
            <div className="skeleton-line skeleton sm" />
            <div className="skeleton-line skeleton lg" style={{ marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
