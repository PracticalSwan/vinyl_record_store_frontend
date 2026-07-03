import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useProductRecommendations } from '../hooks/useProductRecommendations';
import { useProduct } from '../hooks/useRemoteProducts';
import { RecScroll } from '../components/ProductGrid';
import { IconVinyl, IconHeart, IconStar } from '../components/Icons';

function StockBadge({ stock }) {
  if (stock === 'in')  return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Low stock</span>;
  return <span className="badge badge-out">Out of stock</span>;
}

export default function DetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const productState = useProduct(id);
  const record = productState.item;
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [rating, setRating] = useState(4);
  const [hovered, setHovered] = useState(null);
  const similarState = useProductRecommendations(id, { enabled: productState.status === 'success' });

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

  const saved   = wishlist.includes(record.id);

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
              <label style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Demo rating (local only)</label>
              <div className="rating" role="group" aria-label="Rate this record">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`star-btn${(hovered ?? rating) >= n ? ' lit' : ''}`}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={rating === n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                  ><IconStar size={22} filled={(hovered ?? rating) >= n} /></button>
                ))}
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={record.stock === 'out'}
                onClick={() => addToCart(record.id)}
              >
                {record.stock === 'out' ? 'Out of stock' : 'Add to cart'}
              </button>
              <button
                className={`btn btn-ghost btn-icon${saved ? ' btn-wishlist active' : ' btn-wishlist'}`}
                aria-label={`${saved ? 'Remove from' : 'Add to'} wishlist`}
                title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={() => toggleWishlist(record.id)}
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
            <RecScroll records={similarState.items} ariaLabel="Similar records" />
          )}
        </section>
      </div>
    </main>
  );
}
