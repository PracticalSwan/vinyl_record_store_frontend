import TrackingPreference from './TrackingPreference';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <p>
          Groovehaus Vinyl &mdash; Curated records and personal discovery &mdash; Bangkok
        </p>
        <TrackingPreference compact />
      </div>
    </footer>
  );
}
