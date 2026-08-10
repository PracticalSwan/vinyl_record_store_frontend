import { ProductGrid, RecScroll, SkeletonGrid } from '../components/ProductGrid';
import { IconAlert } from '../components/Icons';
import { useCatalog } from '../context/useCatalog';
import { recommendationPresentation } from '../lib/recommendationPresentation';

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

function RecommendationResults({ recommendations, mode }) {
  const topPicks = recommendations.slice(0, 8);
  const genre = recommendations.find((record) => record.genre)?.genre;
  // Keep the secondary section disjoint from top picks so feedback state cannot
  // leave a second mounted card that still presents the same recommendation.
  const genreMatches = genre
    ? recommendations.slice(topPicks.length).filter((record) => record.genre === genre)
    : [];
  return (
    <>
      <h2 className="section-heading" style={{ fontSize: 20 }} id="top-picks-heading">
        Top ranked picks <small>{recommendationPresentation(mode).pageLabel}</small>
      </h2>
      <hr className="section-rule" aria-hidden="true" />
      <ProductGrid records={topPicks} showReason surface="recommendations" />

      {genreMatches.length > 1 && (
        <section aria-labelledby="genre-matches-heading" style={{ marginTop: '3rem' }}>
          <h2 className="section-heading" style={{ fontSize: 20 }} id="genre-matches-heading">
            {genre} matches <small>Filtered from the current ranked list</small>
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <RecScroll records={genreMatches} ariaLabel={`${genre} recommendations`} surface="recommendations" />
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

export default function RecommendationsPage() {
  const catalog = useCatalog();
  return (
    <main>
      <div className="container rec-page">
        <h1 className="section-heading" style={{ fontSize: 28 }}>Recommendations</h1>
        <p className="rec-page-intro">
          {catalog.recommendationMode
            ? recommendationPresentation(catalog.recommendationMode).intro
            : 'The storefront will label the active recommendation mode when the ranked list is ready.'}
        </p>
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
