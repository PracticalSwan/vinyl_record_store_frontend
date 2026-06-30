import { useNavigate } from 'react-router-dom';
import { records } from '../data/records';
import { ProductGrid } from '../components/ProductGrid';
import { RecScroll } from '../components/ProductGrid';

export default function HomePage() {
  const navigate = useNavigate();
  const newArrivals   = records.slice(0, 4);
  const recommended   = records.slice(4, 9);

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
            New arrivals, rare pressings, and personalised recommendations — all in one crate.
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
            {[['4,200+', 'Records in stock'], ['320', 'New this month'], ['12', 'Genres']].map(([num, label]) => (
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
            Recommended for you <small>Based on your listening history</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <RecScroll records={recommended} ariaLabel="Recommended records" />
        </section>
      </div>
    </main>
  );
}
