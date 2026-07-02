import { useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/ProductGrid';
import { RecScroll } from '../components/ProductGrid';
import { useCatalog } from '../context/useCatalog';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    records,
    recommendations,
    recommendationStatus,
    recommendationError,
    reloadRecommendations,
  } = useCatalog();
  const newArrivals = records.slice(0, 4);
  const recommended = recommendations.slice(0, 5);
  const genreCount = new Set(records.map((record) => record.genre)).size;
  const inStockCount = records.filter((record) => record.stock !== 'out').length;

  return (
    <main>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container hero-inner">
          <p className="hero-eyebrow">Bangkok's finest record shop</p>
          <h1 className="hero-title" id="hero-heading">
            Find the record<br />that <span>finds you back.</span>
          </h1>
          <p className="hero-sub">
            New arrivals, rare pressings, and explainable recommendations — all in one crate.
          </p>
          <div className="hero-actions">
            <button className="btn btn-accent" onClick={() => navigate('/catalog')}>
              Browse catalog
            </button>
            <button
              className="btn btn-outline"
              style={{ color: 'var(--cream)', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => navigate('/recommendations')}
            >
              See your picks
            </button>
          </div>
          <div className="hero-stat-row" role="list" aria-label="Store highlights">
            {[
              [String(records.length), 'Demo catalog records'],
              [String(inStockCount), 'Available now'],
              [String(genreCount), 'Genres'],
            ].map(([num, label]) => (
              <div key={label} role="listitem">
                <div className="hero-stat-num">{num}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>
        {/* New arrivals */}
        <section aria-labelledby="new-arrivals-heading">
          <h2 className="section-heading" id="new-arrivals-heading">
            New arrivals <small>Just landed this week</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <ProductGrid records={newArrivals} />
        </section>

        {/* Recommendations */}
        <section aria-labelledby="rec-home-heading" className="rec-section" style={{ marginTop: '3rem' }}>
          <h2 className="section-heading" id="rec-home-heading">
            Recommendation picks <small>Explainable demo profile</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          {recommendationStatus === 'loading' && <p className="inline-state">Loading recommendations…</p>}
          {recommendationStatus === 'error' && (
            <div className="inline-state" role="alert">
              <span>{recommendationError?.message}</span>
              <button className="btn btn-outline btn-sm" onClick={() => reloadRecommendations()}>Try again</button>
            </div>
          )}
          {recommendationStatus === 'empty' && <p className="inline-state">No recommendations are available.</p>}
          {recommendationStatus === 'success' && (
            <RecScroll records={recommended} ariaLabel="Recommended records for the demo profile" />
          )}
        </section>
      </div>
    </main>
  );
}
