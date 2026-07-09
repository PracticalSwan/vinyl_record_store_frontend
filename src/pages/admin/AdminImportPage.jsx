import { useRef, useState } from 'react';
import * as api from '../../lib/api';

const MAX_BYTES = 2_000_000;
const ACTION_SAMPLE = 25;

export default function AdminImportPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [enrich, setEnrich] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | previewing | preview | applying | applied | error
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const readFile = (selected) => {
    if (!selected) return;
    setError(null);
    setPreview(null);
    setResult(null);
    setStatus('idle');
    if (selected.size > MAX_BYTES) {
      setError(new Error(`File is too large. The limit is ${MAX_BYTES} bytes.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setContent(String(reader.result || ''));
      setFile(selected);
    };
    reader.onerror = () => setError(new Error('The file could not be read.'));
    reader.readAsText(selected);
  };

  const handlePreview = async (event) => {
    event.preventDefault();
    if (!file) return;
    setStatus('previewing');
    setError(null);
    setPreview(null);
    setResult(null);
    try {
      const response = await api.previewCatalogImport({ content, fileName: file.name, enrich });
      setPreview(response.data);
      setStatus('preview');
    } catch (requestError) {
      setError(requestError);
      setStatus('error');
    }
  };

  const handleApply = async () => {
    if (!preview?.previewToken) return;
    setStatus('applying');
    setError(null);
    try {
      const response = await api.applyCatalogImport({ token: preview.previewToken });
      setResult(response.data);
      setStatus('applied');
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';
      setFile(null);
      setContent('');
    } catch (requestError) {
      setError(requestError);
      setStatus('error');
    }
  };

  const summary = preview?.summary;
  const blocking = summary && (summary.errors > 0 || summary.conflicts > 0);

  return (
    <div className="admin-import">
      <div className="admin-section-header">
        <h2 className="section-heading">Catalog import</h2>
      </div>
      <p className="inline-state">
        Upload a CSV or JSON catalog file (2 MB or smaller). Preview is non-mutating; apply consumes the
        one-time preview token. Enrichment calls MusicBrainz and Cover Art Archive and is mongodb-only.
      </p>

      <form className="admin-import-form" onSubmit={handlePreview}>
        <label className="admin-field admin-field-wide">
          <span>Catalog file (.csv or .json)</span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={(event) => readFile(event.target.files?.[0])}
          />
        </label>
        <label className="admin-toggle">
          <input type="checkbox" checked={enrich} onChange={(event) => setEnrich(event.target.checked)} />
          Enrich from MusicBrainz / Cover Art Archive
        </label>
        <button className="btn btn-primary" type="submit" disabled={!file || status === 'previewing'}>
          {status === 'previewing' ? 'Previewing...' : 'Preview import'}
        </button>
      </form>

      {error && (
        <div className="state-box compact-state" role="alert">
          <p className="state-title">Import failed</p>
          <p className="state-desc">{error.message}</p>
        </div>
      )}

      {status === 'preview' && summary && (
        <section className="admin-import-preview" aria-live="polite">
          <h3 className="section-heading">Preview</h3>
          <ul className="admin-import-summary" role="list">
            <li><strong>{summary.creates}</strong> create</li>
            <li><strong>{summary.updates}</strong> update</li>
            <li><strong>{summary.skips}</strong> unchanged</li>
            <li><strong>{summary.warnings}</strong> warnings</li>
            <li><strong>{summary.errors}</strong> errors</li>
            <li><strong>{summary.conflicts}</strong> conflicts</li>
          </ul>
          {blocking ? (
            <p className="form-error" role="alert">
              Resolve all errors and conflicts before applying. No rows will be written while any remain.
            </p>
          ) : (
            <p className="inline-state">No blocking errors. Review the action sample, then apply.</p>
          )}
          {preview.actions?.length > 0 && (
            <details className="admin-import-actions">
              <summary>First {Math.min(ACTION_SAMPLE, preview.actions.length)} of {preview.totalActions} actions</summary>
              <ul className="admin-action-list" role="list">
                {preview.actions.slice(0, ACTION_SAMPLE).map((action) => (
                  <li key={action.rowNumber} className={`admin-action-item admin-action-${action.action}`}>
                    <span className="admin-action-row">Row {action.rowNumber}</span>
                    <span className="admin-action-type">{action.action}</span>
                    {action.publicId ? <span className="admin-action-id">ID {action.publicId}</span> : null}
                    {action.reason ? <span className="admin-action-reason">{action.reason}</span> : null}
                    {action.errors?.map((issue, index) => (
                      <span key={`e${index}`} className="admin-action-error">{issue.message}</span>
                    ))}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button
            className="btn btn-accent"
            type="button"
            disabled={blocking || status !== 'preview'}
            onClick={handleApply}
          >
            Apply import
          </button>
        </section>
      )}

      {status === 'applied' && result && (
        <section className="admin-import-result" aria-live="polite">
          <div className="state-box" role="status">
            <p className="state-title">Import applied</p>
            <p className="state-desc">
              {result.inserted} created, {result.modified} updated across {result.writes} write(s).
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
