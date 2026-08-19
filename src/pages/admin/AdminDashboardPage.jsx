import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../lib/api';

const STAT_CARDS = [
  { key: 'activeProducts', label: 'Active products' },
  { key: 'unresolvedArtwork', label: 'Unresolved artwork' },
  { key: 'softDeleted', label: 'Soft-deleted' },
];
const RESEARCH_STAT_CARDS = [
  { key: 'activeProducts', label: 'Source products' },
  { key: 'unresolvedArtwork', label: 'Source artwork unresolved' },
  { key: 'softDeleted', label: 'Soft-deleted' },
];
const COMMERCE_STAT_CARDS = [
  { key: 'lowStock', label: 'Low stock' },
  { key: 'outOfStock', label: 'Out of stock' },
];

export default function AdminDashboardPage() {
  const [reloadToken, setReloadToken] = useState(0);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await api.fetchAdminSummary({ signal: controller.signal });
        setSummary(response.data);
        setStatus('success');
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError);
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [reloadToken]);

  if (status === 'loading') {
    return <p className="inline-state" aria-busy="true">Loading dashboard...</p>;
  }
  if (status === 'error') {
    return (
      <div className="state-box" role="alert">
        <p className="state-title">Dashboard unavailable</p>
        <p className="state-desc">{error?.message}</p>
        <button className="btn btn-primary" type="button" onClick={() => setReloadToken((value) => value + 1)}>Try again</button>
      </div>
    );
  }

  const counts = summary?.summary || {};
  const recent = summary?.recentActions || [];
  const dataset = summary?.dataset || null;
  const researchOnly = dataset?.catalogMode === 'research-only';
  const statCards = researchOnly ? RESEARCH_STAT_CARDS : [...STAT_CARDS, ...COMMERCE_STAT_CARDS];

  return (
    <div className="admin-dashboard">
      <div className="admin-stat-grid">
        {statCards.map((stat) => (
          <div key={stat.key} className="admin-stat-card">
            <span className="admin-stat-value">{counts[stat.key] ?? 0}</span>
            <span className="admin-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
      {researchOnly && (
        <p className="admin-note" role="note">
          Source metrics exclude storefront presentation dedupe and supplemental artwork.
        </p>
      )}

      <section className="admin-recent" aria-labelledby="admin-dataset-heading">
        <h2 className="section-heading" id="admin-dataset-heading">Catalog dataset</h2>
        {dataset ? (
          <dl className="preference-review">
            <div><dt>Active dataset</dt><dd>{dataset.datasetKey}</dd></div>
            <div><dt>Products</dt><dd>{dataset.counts?.products ?? 0}</dd></div>
            <div><dt>Historical users</dt><dd>{dataset.counts?.users ?? 0}</dd></div>
            <div><dt>Historical ratings</dt><dd>{dataset.counts?.ratings ?? 0}</dd></div>
            <div><dt>Source version</dt><dd>{dataset.sourceVersion || 'Unknown'}</dd></div>
            <div><dt>Catalog mode</dt><dd>{researchOnly ? 'Research-only browsing' : 'Commerce preview'}</dd></div>
            <div><dt>Activated</dt><dd>{dataset.activatedAt ? new Date(dataset.activatedAt).toLocaleString() : 'Unknown'}</dd></div>
          </dl>
        ) : <p className="inline-state">The reviewed 116-record legacy catalog is active.</p>}
        <p className="admin-note" role="note">Large Amazon source files are prepared and activated only through the backend CLI. The browser import remains intentionally limited to small administrator CSV/JSON files.</p>
      </section>

      <div className="admin-warnings">
        <h2 className="section-heading">{researchOnly ? 'Catalog policy' : 'Stock focus'}</h2>
        {researchOnly ? (
          <p className="inline-state">The active dataset has no store price, currency, stock, or condition. Dataset-managed rows are browsable and read-only.</p>
        ) : counts.outOfStock > 0 && (
          <p className="inline-state">{counts.outOfStock} product(s) are out of stock and hidden from recommendations.</p>
        )}
        {!researchOnly && counts.lowStock > 0 && (
          <p className="inline-state">{counts.lowStock} product(s) are running low.</p>
        )}
        {!researchOnly && counts.outOfStock === 0 && counts.lowStock === 0 && (
          <p className="inline-state">No stock warnings right now.</p>
        )}
      </div>

      <section className="admin-recent" aria-labelledby="admin-recent-heading">
        <div className="admin-section-header">
          <h2 className="section-heading" id="admin-recent-heading">Recent audit actions</h2>
          <Link className="btn btn-outline btn-sm" to="/admin/products">Manage products</Link>
        </div>
        {recent.length === 0 ? (
          <p className="inline-state">No administrator actions have been recorded yet.</p>
        ) : (
          <ul className="admin-audit-list" role="list">
            {recent.map((entry, index) => (
              <li key={`${entry.createdAt}-${index}`} className="admin-audit-item">
                <div>
                  <p className="admin-audit-action">{entry.action}</p>
                  <p className="admin-audit-summary">{entry.summary}</p>
                </div>
                <span className="admin-audit-time">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="admin-note" role="note">
        Catalog writes require the MongoDB data source. In seed-catalog mode, summary and product
        reads work but create, edit, delete, restore, import, and artwork actions return a
        persistence-unavailable error. The backend authorizes every admin route; this screen never
        trusts client state alone.
      </p>
    </div>
  );
}
