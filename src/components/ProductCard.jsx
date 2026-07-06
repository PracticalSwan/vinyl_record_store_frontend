import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useTracking } from '../context/useTracking';
import { IconHeart } from './Icons';
import ProductImage from './ProductImage';

function StockBadge({ stock }) {
  if (stock === 'in')  return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Low stock</span>;
  return <span className="badge badge-out">Out of stock</span>;
}

function StockDot({ stock }) {
  const cls   = stock === 'in' ? 'dot-in' : stock === 'low' ? 'dot-low' : 'dot-out';
  const label = stock === 'in' ? 'In stock' : stock === 'low' ? 'Low stock' : 'Out of stock';
  return <span className={`card-stock-dot ${cls}`} title={label} aria-hidden="true" />;
}

export default function ProductCard({ record, showReason = false, surface = 'catalog', queryLength = 0, searchRank = null }) {
  const navigate = useNavigate();
  const tracking = useTracking();
  const cardRef = useRef(null);
  const store = useStore();
  const { wishlist, toggleWishlist } = store;
  const saved = wishlist.includes(record.id);
  const recommendationContext = record.recommendationContext;

  useEffect(() => {
    if (!recommendationContext?.requestId || !cardRef.current) return undefined;
    const emit = () => tracking.track('recommendation_impression', {
      productId: record.id,
      surface,
      recommendationContext,
      dedupeKey: `impression:${globalThis.location?.pathname || ''}:${surface}:${recommendationContext.requestId}:${record.id}`,
      dedupeWindowMs: Number.POSITIVE_INFINITY,
    });
    if (!globalThis.IntersectionObserver) {
      emit();
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
        emit();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [record.id, recommendationContext, surface, tracking]);

  const viewRecord = () => {
    if (recommendationContext) {
      tracking.track('recommendation_click', { productId: record.id, surface, recommendationContext });
    } else if (surface === 'search') {
      tracking.track('search_result_click', {
        productId: record.id,
        surface,
        value: Math.min(99, queryLength),
        searchContext: { rank: searchRank, queryLength: Math.min(100, queryLength) },
      });
    }
    navigate(`/records/${record.id}`, {
      state: recommendationContext ? { recommendationContext, surface } : undefined,
    });
  };

  const toggleSaved = async (event) => {
    event.stopPropagation();
    await toggleWishlist(record.id, recommendationContext ? { recommendationContext, surface } : { surface });
  };

  return (
    <article
      ref={cardRef}
      className="product-card"
      role="listitem"
      aria-label={`${record.title} by ${record.artist}`}
    >
      <div className="card-cover">
        <ProductImage record={record} decorative />
        <StockDot stock={record.stock} />
        <button
          className={`card-wishlist-btn${saved ? ' active' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Add'} ${record.title} ${saved ? 'from' : 'to'} wishlist`}
          disabled={store.isPending('wishlist', record.id)}
          onClick={toggleSaved}
        >
          <IconHeart filled={saved} />
        </button>
      </div>

      <div className="card-body">
        <h3 className="card-title">{record.title}</h3>
        <p className="card-artist">{record.artist}</p>
        <div className="card-meta" aria-label="Record details">
          <span className="badge badge-genre">{record.genre || 'Uncategorized'}</span>
          <span className="badge badge-era">{record.year || 'Year unknown'}</span>
          <StockBadge stock={record.stock} />
        </div>
        <div className="card-footer">
          <div>
            <span className="card-price" aria-label={`Price: $${record.price}`}>${record.price}</span>
            <p className="card-condition">{record.condition}</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={viewRecord}
          >
            View record
          </button>
        </div>
      </div>

      {showReason && record.reason && (
        <p className="card-reason" role="note">{record.reason}</p>
      )}
    </article>
  );
}
