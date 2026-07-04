import TrackingPreference from './TrackingPreference';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <p>
          Groovehaus Vinyl &mdash; CSX4207 academic recommender demo &mdash; Bangkok
        </p>
        <TrackingPreference compact />
      </div>
    </footer>
  );
}
