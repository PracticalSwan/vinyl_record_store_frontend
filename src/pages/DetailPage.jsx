import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useProductRecommendations } from '../hooks/useProductRecommendations';
import { useProduct } from '../hooks/useRemoteProducts';
import { RecScroll } from '../components/ProductGrid';
import { IconVinyl, IconHeart, IconStar } from '../components/Icons';
import { useTracking } from '../context/useTracking';

function StockBadge({ stock }) {
  if (stock === 'in')  return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Low stock</span>;
  return <span className="badge badge-out">Out of stock</span>;
}

export default function DetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tracking = useTracking();
  const productState = useProduct(id);
  const record = productState.item;
  const store = useStore();
  const { wishlist, toggleWishlist, addToCart } = store;
  const [hovered, setHovered] = useState(null);
  const similarState = useProductRecommendations(id, { enabled: productState.status === 'success' });
  const savedRating = store.ratings.find((item) => item.id === record?.id)?.rating || 0;
  const recommendationAnalytics = location.state?.recommendationContext
    ? {
        recommendationContext: location.state.recommendationContext,
        surface: location.state.surface || 'product-detail',
      }
    : { surface: 'product-detail' };

  useEffect(() => {
    if (!record) return;
    tracking.track('product_view', {
      productId: record.id,
      surface: 'product-detail',
      ...(location.state?.recommendationContext
        ? { recommendationContext: location.state.recommendationContext }
        : {}),
      dedupeKey: `product-view:${record.id}`,
    });
  }, [location.state?.recommendationContext, record, tracking]);

  if (productState.status === 'loading') {
    return <main className="container catalog-state" role="status">Loading record...</main>;
  }

  if (productState.status === 'error') {
    return (
      <main className="container catalog-state"><div className="state-box" role="alert">
        <p className="state-title">Record unavailable</p><p className="state-desc">{productState.error?.message}</p>
        <button className="btn btn-primary" onClick={productState.reload}>Try again</button>
      </div></main>
    );
  }

  if (productState.status === 'not-found' || !record) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="state-box">
          <p className="state-title">Record not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Back to catalog</button>
        </div>
      </div>
    );
  }

  const saved = wishlist.includes(record.id);

  return (
    <main>
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link to="/catalog">Catalog</Link>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          <Link to="/catalog">{record.genre}</Link>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          <span aria-current="page">{record.title}</span>
        </nav>

        {/* Detail layout */}
        <div className="detail-layout">
          <div className="detail-cover" aria-hidden="true">
            <IconVinyl size={120} opacity={0.25} />
          </div>

          <div className="detail-info">
            <div>
              <h1 className="detail-title">{record.title}</h1>
              <p className="detail-artist">{record.artist}</p>
            </div>

            <div className="detail-meta-row" aria-label="Record details">
              <span className="badge badge-genre">{record.genre}</span>
              <span className="badge badge-era">{record.year}</span>
              <StockBadge stock={record.stock} />
              <span className="badge badge-cond">{record.condition}</span>
            </div>

            <p className="detail-price" aria-label={`Price: $${record.price}`}>${record.price}</p>
            <p className="detail-desc">{record.description}</p>

            <table className="detail-table" aria-label="Record specifications">
              <tbody>
                {[
                  ['Label',     record.label],
                  ['Format',    record.format],
                  ['Pressing',  record.pressing],
                  ['Condition', record.condition],
                  ['Genre',     record.genre],
                  ['Stock',     record.stock === 'in' ? 'In stock' : record.stock === 'low' ? 'Low stock' : 'Out of stock'],
                ].map(([k, v]) => (
                  <tr key={k}><td>{k}</td><td>{v}</td></tr>
                ))}
              </tbody>
            </table>

            {/* Star rating */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Your rating</label>
              <div className="rating" role="group" aria-label="Rate this record">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`star-btn${(hovered ?? savedRating) >= n ? ' lit' : ''}`}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={savedRating === n}
                    disabled={store.isPending('ratings', record.id)}
                    onClick={() => store.setRating(record.id, n, recommendationAnalytics)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                  ><IconStar size={22} filled={(hovered ?? savedRating) >= n} /></button>
                ))}
                {savedRating > 0 && (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => store.removeRating(record.id, recommendationAnalytics)}>
                    Clear rating
                  </button>
                )}
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={record.stock === 'out' || store.isPending('cart', record.id)}
                onClick={() => addToCart(record.id, recommendationAnalytics)}
              >
                {record.stock === 'out' ? 'Out of stock' : 'Add to cart'}
              </button>
              <button
                className={`btn btn-ghost btn-icon${saved ? ' btn-wishlist active' : ' btn-wishlist'}`}
                aria-label={`${saved ? 'Remove from' : 'Add to'} wishlist`}
                title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                disabled={store.isPending('wishlist', record.id)}
                onClick={() => toggleWishlist(record.id, recommendationAnalytics)}
              >
                <IconHeart filled={saved} />
              </button>
            </div>
          </div>
        </div>

        {/* Similar records */}
        <section aria-labelledby="similar-heading" style={{ paddingBottom: '3rem' }}>
          <h2 className="section-heading" id="similar-heading">
            Similar records <small>Content-based matches from the backend</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          {similarState.status === 'loading' && <p className="inline-state">Loading similar records…</p>}
          {similarState.status === 'error' && (
            <p className="inline-state" role="alert">{similarState.error?.message}</p>
          )}
          {similarState.status === 'empty' && <p className="inline-state">No similar records are available.</p>}
          {similarState.status === 'success' && (
            <RecScroll records={similarState.items} ariaLabel="Similar records" surface="product-detail" />
          )}
        </section>
      </div>
    </main>
  );
}
