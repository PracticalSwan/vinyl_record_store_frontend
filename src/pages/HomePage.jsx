import { useNavigate } from 'react-router-dom';
import { ProductGrid, RecScroll, SkeletonGrid } from '../components/ProductGrid';
import { useCatalog } from '../context/useCatalog';
import { useProductQuery } from '../hooks/useRemoteProducts';
import { recommendationPresentation } from '../lib/recommendationPresentation';

const HOME_QUERY = {
  q: '', page: 1, limit: 4, genres: [], eras: [], conditions: [],
  minPrice: null, maxPrice: null, inStock: false, sort: 'newest',
};

const recommendationAriaLabel = (mode) => mode === 'demo-profile'
  ? 'Recommended records for the showcase profile'
  : 'Current ranked record recommendations';

export default function HomePage() {
  const navigate = useNavigate();
  const catalog = useProductQuery(HOME_QUERY);
  const {
    recommendations,
    recommendationStatus,
    recommendationError,
    recommendationMode,
    reloadRecommendations,
  } = useCatalog();
  const genreCount = catalog.meta?.facets?.genres?.filter(({ count }) => count > 0).length ?? 0;
  const inStockCount = catalog.meta?.facets?.stock
    ?.filter(({ value }) => value !== 'out')
    .reduce((sum, entry) => sum + entry.count, 0) ?? 0;
  const researchOnly = catalog.meta?.catalogMode === 'research-only';
  const highlights = researchOnly
    ? [
        [String(catalog.meta?.total ?? 0), 'Research records'],
        [String(genreCount), 'Canonical genres'],
        ['Real', 'Source metadata'],
      ]
    : [
        [String(catalog.meta?.total ?? 0), 'Catalog records'],
        [String(inStockCount), 'Available now'],
        [String(genreCount), 'Genres'],
      ];

  return (
    <main>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container hero-inner">
          <p className="hero-eyebrow">{researchOnly ? 'Amazon Reviews 2023 vinyl research catalog' : 'Bangkok\'s finest record shop'}</p>
          <h1 className="hero-title" id="hero-heading">{researchOnly ? <>Explore real vinyl<br /><span>metadata honestly.</span></> : <>Find the record<br />that <span>finds you back.</span></>}</h1>
          <p className="hero-sub">{researchOnly ? 'Browse source-derived releases, controlled facets, provenance, and verified artwork without simulated prices or inventory.' : 'New arrivals, rare pressings, and explainable recommendations - all in one crate.'}</p>
          <div className="hero-actions">
            <button className="btn btn-accent" onClick={() => navigate('/catalog')}>Browse catalog</button>
            <button className="btn btn-outline hero-outline" onClick={() => navigate('/recommendations')}>See your picks</button>
          </div>
          <div className="hero-stat-row" role="list" aria-label="Store highlights">
            {highlights.map(([number, label]) => (
              <div key={label} role="listitem"><div className="hero-stat-num">{number}</div><div className="hero-stat-label">{label}</div></div>
            ))}
          </div>
        </div>
      </section>
      <div className="container home-content">
        <section aria-labelledby="new-arrivals-heading">
          <h2 className="section-heading" id="new-arrivals-heading">{researchOnly ? <>Research catalog <small>Source-derived vinyl records</small></> : <>New arrivals <small>Just landed this week</small></>}</h2>
          <hr className="section-rule" aria-hidden="true" />
          {catalog.status === 'loading' && <SkeletonGrid count={4} />}
          {catalog.status === 'error' && <div className="inline-state" role="alert"><span>{catalog.error?.message}</span><button className="btn btn-outline btn-sm" onClick={catalog.reload}>Try again</button></div>}
          {catalog.status === 'empty' && <p className="inline-state">No records are available.</p>}
          {catalog.items.length > 0 && <ProductGrid records={catalog.items} surface="home" />}
        </section>
        <section aria-labelledby="rec-home-heading" className="rec-section">
          <h2 className="section-heading" id="rec-home-heading">Recommendation picks <small>{recommendationPresentation(recommendationMode).homeLabel}</small></h2>
          <hr className="section-rule" aria-hidden="true" />
          {recommendationStatus === 'loading' && <p className="inline-state">Loading recommendations...</p>}
          {recommendationStatus === 'error' && <div className="inline-state" role="alert"><span>{recommendationError?.message}</span><button className="btn btn-outline btn-sm" onClick={reloadRecommendations}>Try again</button></div>}
          {recommendationStatus === 'empty' && <p className="inline-state">No recommendations are available.</p>}
          {recommendationStatus === 'success' && <RecScroll records={recommendations.slice(0, 5)} ariaLabel={recommendationAriaLabel(recommendationMode)} surface="home" />}
        </section>
      </div>
    </main>
  );
}
