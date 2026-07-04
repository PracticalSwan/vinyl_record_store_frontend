import { ProductGrid, RecScroll, SkeletonGrid } from '../components/ProductGrid';
import { IconAlert } from '../components/Icons';
import { useCatalog } from '../context/useCatalog';

function ProfileSummary({ signals }) {
  if (!signals.length) return null;
  return (
    <>
      <p className="signal-heading">Signals used by the backend</p>
      <ul className="signal-pills" aria-label="Demo signals used for recommendations">
        {signals.map((signal) => <li className="signal-pill" key={signal}>{signal}</li>)}
      </ul>
    </>
  );
}

function RecommendationResults({ recommendations, isDemoProfile }) {
  const topPicks = recommendations.slice(0, 8);
  const moreJazz = recommendations.filter((record) => record.genre === 'Jazz');
  return (
    <>
      <h2 className="section-heading" style={{ fontSize: 20 }} id="top-picks-heading">
        Top ranked picks <small>{isDemoProfile ? 'Demo profile' : 'Cold-start mode'}</small>
      </h2>
      <hr className="section-rule" aria-hidden="true" />
      <ProductGrid records={topPicks} showReason surface="recommendations" />

      {moreJazz.length > 0 && (
        <section aria-labelledby="more-jazz-heading" style={{ marginTop: '3rem' }}>
          <h2 className="section-heading" style={{ fontSize: 20 }} id="more-jazz-heading">
            Jazz matches <small>Ranked from the same demo profile</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <RecScroll records={moreJazz} ariaLabel="Jazz recommendations" surface="recommendations" />
        </section>
      )}
    </>
  );
}

function RecommendationState({ status, error, retry, recommendations, isDemoProfile }) {
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
  return <RecommendationResults recommendations={recommendations} isDemoProfile={isDemoProfile} />;
}

export default function RecommendationsPage() {
  const catalog = useCatalog();
  const isDemoProfile = catalog.recommendationMode === 'demo-profile';
  return (
    <main>
      <div className="container rec-page">
        <h1 className="section-heading" style={{ fontSize: 28 }}>Recommendation demo</h1>
        <p className="rec-page-intro">
          {isDemoProfile
            ? 'These explainable results use the documented sample profile, not a signed-in customer.'
            : 'No user history is available, so these results are clearly marked as cold-start suggestions.'}
        </p>
        <ProfileSummary signals={catalog.profileSummary} />
        <RecommendationState
          status={catalog.recommendationStatus}
          error={catalog.recommendationError}
          retry={catalog.reloadRecommendations}
          recommendations={catalog.recommendations}
          isDemoProfile={isDemoProfile}
        />
      </div>
    </main>
  );
}
