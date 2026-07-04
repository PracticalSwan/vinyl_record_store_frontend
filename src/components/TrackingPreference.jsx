import { useTracking } from '../context/useTracking';

export default function TrackingPreference({ compact = false }) {
  const tracking = useTracking();
  return (
    <section className={`tracking-preference${compact ? ' compact' : ''}`} aria-labelledby={compact ? undefined : 'usage-data-heading'}>
      {!compact && <h2 id="usage-data-heading">Usage data</h2>}
      <label>
        <input type="checkbox" checked={tracking.enabled} onChange={(event) => tracking.setEnabled(event.target.checked)} />
        <span>Share pseudonymous usage data for this academic demo</span>
      </label>
      {!compact && <p>Captures product, recommendation, wishlist, cart, rating, and bounded search events for up to 90 days. It never sends your name, username, cookie, or free-form text. Turning this off clears unsent events immediately.</p>}
    </section>
  );
}
