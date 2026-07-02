import { records } from '../data/records';
import { ProductGrid } from '../components/ProductGrid';
import { RecScroll } from '../components/ProductGrid';

const SIGNALS = [
  'Bought: Jazz albums × 4',
  'Wishlist: 3 Soul records',
  'Rated: Electronic 5 of 5',
  'Viewed: 1970s records',
];

export default function RecommendationsPage() {
  const topPicks  = records.slice(0, 6);
  const moreJazz  = records.filter(r => r.genre === 'Jazz');

  return (
    <main>
      <div className="container rec-page">
        <h1 className="section-heading" style={{ fontSize: 28 }}>Your picks</h1>
        <p className="rec-page-intro">
          Based on your purchase history, wishlist, and listening signals — here are records we think you'll love. Reasons are shown on each card.
        </p>

        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: '.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px' }}>
          Signals we've picked up
        </p>
        <div className="signal-pills" aria-label="Signals used for recommendations">
          {SIGNALS.map(signal => (
            <div className="signal-pill" key={signal}>
              {signal}
            </div>
          ))}
        </div>

        <h2 className="section-heading" style={{ fontSize: 20 }} id="top-picks-heading">
          Top picks for you
        </h2>
        <hr className="section-rule" aria-hidden="true" />
        <ProductGrid records={topPicks} showReason />

        <section aria-labelledby="more-jazz-heading" style={{ marginTop: '3rem' }}>
          <h2 className="section-heading" style={{ fontSize: 20 }} id="more-jazz-heading">
            More jazz you'll like <small>Because you bought Kind of Blue</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <RecScroll records={moreJazz} />
        </section>
      </div>
    </main>
  );
}
