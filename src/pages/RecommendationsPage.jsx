import { ProductGrid, RecScroll, SkeletonGrid } from '../components/ProductGrid';
import { IconAlert } from '../components/Icons';
import { useCatalog } from '../context/useCatalog';

function ProfileSummary({ signals }) {
  if (!signals.length) return null;
  return (
    <>
      <p className="signal-heading">Recommendation context from the backend</p>
      <ul className="signal-pills" aria-label="Signals used for recommendations">
        {signals.map((signal) => <li className="signal-pill" key={signal}>{signal}</li>)}
      </ul>
    </>
  );
}

const modeLabel = (mode) => ({
  'demo-profile': 'Demo profile',
  'anonymous-fallback': 'Anonymous fallback',
  'cold-start': 'Session-owned cold-start',
}[mode] || 'Current ranking mode');

function RecommendationResults({ recommendations, mode }) {
  const topPicks = recommendations.slice(0, 8);
  const moreJazz = recommendations.filter((record) => record.genre === 'Jazz');
  return (
    <>
      <h2 className="section-heading" style={{ fontSize: 20 }} id="top-picks-heading">
        Top ranked picks <small>{modeLabel(mode)}</small>
      </h2>
      <hr className="section-rule" aria-hidden="true" />
      <ProductGrid records={topPicks} showReason surface="recommendations" />

      {moreJazz.length > 0 && (
        <section aria-labelledby="more-jazz-heading" style={{ marginTop: '3rem' }}>
          <h2 className="section-heading" style={{ fontSize: 20 }} id="more-jazz-heading">
            Jazz matches <small>Filtered from the current ranked list</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <RecScroll records={moreJazz} ariaLabel="Jazz recommendations" surface="recommendations" />
        </section>
      )}
    </>
  );
}

function RecommendationState({ status, error, retry, recommendations, mode }) {
  if (status === 'loading') return <SkeletonGrid count={8} />;
  if (status === 'error') {
    return (
      <div className="state-box" role="alert">
        <div className="state-icon" aria-hidden="true"><IconAlert /></div>
        <p className="state-title">Recommendations unavailable</p>
        <p className="state-desc">{error?.message}</p>
        <button className="btn btn-primary" onClick={retry}>Try again</button>
      </div>
    );
  }
  if (status === 'empty') {
    return (
      <div className="state-box" role="status">
        <p className="state-title">No recommendations are available</p>
      </div>
    );
  }
  return <RecommendationResults recommendations={recommendations} mode={mode} />;
}

function recommendationIntro(mode) {
  if (!mode) {
    return 'The storefront will label the active recommendation mode when the ranked list is ready.';
  }
  if (mode === 'demo-profile') {
    return 'These explainable results use the documented sample profile, not a signed-in customer.';
  }
  if (mode === 'anonymous-fallback') {
    return 'No customer session is active, so these are catalog-based fallback suggestions without account history.';
  }
  if (mode === 'cold-start') {
    return 'This request is owned by the signed-in session, but ranking remains cold-start until preference-aware personalization is implemented.';
  }
  return 'These results use the active backend ranking mode and its item-level explanations.';
}

export default function RecommendationsPage() {
  const catalog = useCatalog();
  return (
    <main>
      <div className="container rec-page">
        <h1 className="section-heading" style={{ fontSize: 28 }}>Recommendation demo</h1>
        <p className="rec-page-intro">{recommendationIntro(catalog.recommendationMode)}</p>
        <ProfileSummary signals={catalog.profileSummary} />
        <RecommendationState
          status={catalog.recommendationStatus}
          error={catalog.recommendationError}
          retry={catalog.reloadRecommendations}
          recommendations={catalog.recommendations}
          mode={catalog.recommendationMode}
        />
      </div>
    </main>
  );
}
