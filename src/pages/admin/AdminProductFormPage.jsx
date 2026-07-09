import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as api from '../../lib/api';
import {
  GENRE_OPTIONS,
  STOCK_OPTIONS,
  CONDITION_OPTIONS,
  FORMAT_OPTIONS,
} from '../../lib/adminConstants';

const EMPTY_FORM = {
  title: '',
  artist: '',
  genre: '',
  year: '',
  price: '',
  currency: 'USD',
  stock: 'in',
  condition: 'M',
  label: '',
  format: 'LP, 33 1/3 rpm',
  pressing: '',
  description: '',
  imageUrl: '',
  musicBrainzReleaseId: '',
  musicBrainzReleaseGroupId: '',
  source: 'admin-manual',
};

function toForm(product) {
  return {
    ...EMPTY_FORM,
    ...product,
    year: product.year ? String(product.year) : '',
    price: product.price !== null && product.price !== undefined ? String(product.price) : '',
    musicBrainzReleaseId: product.musicBrainzReleaseId || '',
    musicBrainzReleaseGroupId: product.musicBrainzReleaseGroupId || '',
  };
}

function toPayload(form) {
  return {
    title: form.title,
    artist: form.artist,
    genre: form.genre || null,
    year: form.year ? Number(form.year) : null,
    price: Number(form.price),
    currency: form.currency,
    stock: form.stock,
    condition: form.condition,
    label: form.label || null,
    format: form.format,
    pressing: form.pressing || null,
    description: form.description || null,
    imageUrl: form.imageUrl || null,
    musicBrainzReleaseId: form.musicBrainzReleaseId || null,
    musicBrainzReleaseGroupId: form.musicBrainzReleaseGroupId || null,
    source: form.source,
  };
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loadStatus, setLoadStatus] = useState(isEdit ? 'loading' : 'idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [artwork, setArtwork] = useState({ status: 'idle', preview: null, error: null, applying: false });

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await api.fetchAdminProduct(id, { signal: controller.signal });
        const product = response.data.product;
        setForm(toForm(product));
        setUpdatedAt(product.updatedAt);
        setLoadStatus('success');
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError);
        setLoadStatus('error');
      }
    })();
    return () => controller.abort();
  }, [id, isEdit]);

  const onChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setConflict(null);
    try {
      const payload = toPayload(form);
      if (isEdit) {
        const response = await api.updateAdminProduct(id, payload, updatedAt);
        const product = response.data.product;
        setForm(toForm(product));
        setUpdatedAt(product.updatedAt);
        setError(null);
      } else {
        const response = await api.createAdminProduct(payload);
        navigate(`/admin/products/${response.data.product.id}/edit`, { replace: true });
      }
    } catch (requestError) {
      setError(requestError);
      if (requestError.code === 'CONFLICT' && isEdit) {
        // The 409 response does not carry the current record; refetch it so the
        // administrator can review what changed before re-submitting.
        try {
          const fresh = await api.fetchAdminProduct(id);
          const product = fresh.data.product;
          setConflict(product);
          setUpdatedAt(product.updatedAt);
        } catch {
          setConflict(null);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshArtwork = async () => {
    setArtwork({ status: 'loading', preview: null, error: null, applying: false });
    try {
      const response = await api.refreshArtworkPreview(id);
      setArtwork({ status: 'success', preview: response.data, error: null, applying: false });
    } catch (requestError) {
      setArtwork({ status: 'error', preview: null, error: requestError, applying: false });
    }
  };

  const handleApplyArtwork = async () => {
    const releaseId = artwork.preview?.release?.id;
    if (!releaseId) return;
    setArtwork({ ...artwork, applying: true, error: null });
    try {
      const response = await api.applyArtwork(id, { releaseId, updatedAt });
      const product = response.data.product;
      setForm(toForm(product));
      setUpdatedAt(product.updatedAt);
      setArtwork({ status: 'success', preview: { ...artwork.preview, product }, error: null, applying: false });
    } catch (requestError) {
      // On a 409 the stored updatedAt is stale; refetch so a retry does not loop.
      if (requestError.code === 'CONFLICT') {
        try {
          const fresh = await api.fetchAdminProduct(id);
          const product = fresh.data.product;
          setForm(toForm(product));
          setUpdatedAt(product.updatedAt);
          setConflict(product);
        } catch {
          setConflict(null);
        }
      }
      setArtwork({ ...artwork, error: requestError, applying: false });
    }
  };

  if (loadStatus === 'loading') {
    return <p className="inline-state" aria-busy="true">Loading product...</p>;
  }
  if (loadStatus === 'error') {
    return (
      <div className="state-box" role="alert">
        <p className="state-title">Product unavailable</p>
        <p className="state-desc">{error?.message}</p>
        <Link className="btn btn-primary" to="/admin/products">Back to products</Link>
      </div>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-section-header">
        <h2 className="section-heading">{isEdit ? `Edit product ${id}` : 'Add product'}</h2>
        <Link className="btn btn-outline btn-sm" to="/admin/products">Cancel</Link>
      </div>

      {error && (
        <div className="state-box compact-state" role="alert">
          <p className="state-title">
            {error.code === 'PERSISTENCE_UNAVAILABLE'
              ? 'Catalog writes unavailable'
              : error.code === 'CONFLICT' ? 'Edit conflict' : 'Could not save product'}
          </p>
          <p className="state-desc">
            {error.code === 'PERSISTENCE_UNAVAILABLE'
              ? 'The catalog is running in seed-catalog mode. Create, edit, delete, restore, import, and artwork actions require the MongoDB data source.'
              : error.message}
          </p>
        </div>
      )}

      {conflict && (
        <div className="state-box compact-state" role="alert">
          <p className="state-title">This product was changed by another administrator</p>
          <p className="state-desc">
            The current server record is "{conflict.title}" by {conflict.artist}, updated {conflict.updatedAt ? new Date(conflict.updatedAt).toLocaleString() : 'recently'}.
            Your latest edits were loaded from the server; review them and save again.
          </p>
        </div>
      )}

      <fieldset className="admin-fieldset">
        <legend>Identity</legend>
        <label className="admin-field">
          <span>Title</span>
          <input value={form.title} onChange={onChange('title')} required maxLength={200} />
        </label>
        <label className="admin-field">
          <span>Artist</span>
          <input value={form.artist} onChange={onChange('artist')} required maxLength={200} />
        </label>
        <label className="admin-field">
          <span>Source</span>
          <input value={form.source} onChange={onChange('source')} required maxLength={100} />
        </label>
        {isEdit && (
          <p className="admin-readonly-note">Numeric product ID {id} is read-only after creation.</p>
        )}
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Classification</legend>
        <label className="admin-field">
          <span>Genre</span>
          <select value={form.genre} onChange={onChange('genre')}>
            <option value="">Uncategorized</option>
            {GENRE_OPTIONS.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Year</span>
          <input type="number" min="1900" max="2100" value={form.year} onChange={onChange('year')} />
        </label>
        <label className="admin-field">
          <span>Condition</span>
          <select value={form.condition} onChange={onChange('condition')}>
            {CONDITION_OPTIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Format</span>
          <select value={form.format} onChange={onChange('format')}>
            {FORMAT_OPTIONS.map((format) => <option key={format} value={format}>{format}</option>)}
          </select>
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Pricing and stock</legend>
        <label className="admin-field">
          <span>Price (USD)</span>
          <input type="number" step="0.01" min="0" max="1000000" value={form.price} onChange={onChange('price')} required />
        </label>
        <label className="admin-field">
          <span>Stock</span>
          <select value={form.stock} onChange={onChange('stock')}>
            {STOCK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Label</span>
          <input value={form.label} onChange={onChange('label')} maxLength={200} />
        </label>
        <label className="admin-field">
          <span>Pressing</span>
          <input value={form.pressing} onChange={onChange('pressing')} maxLength={200} />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Notes</legend>
        <label className="admin-field admin-field-wide">
          <span>Description</span>
          <textarea value={form.description} onChange={onChange('description')} maxLength={5000} rows={4} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Legacy image URL (optional, host-validated at render time)</span>
          <input value={form.imageUrl} onChange={onChange('imageUrl')} maxLength={2000} />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>MusicBrainz linkage</legend>
        <label className="admin-field">
          <span>Release ID</span>
          <input value={form.musicBrainzReleaseId} onChange={onChange('musicBrainzReleaseId')} maxLength={100} />
        </label>
        <label className="admin-field">
          <span>Release group ID</span>
          <input value={form.musicBrainzReleaseGroupId} onChange={onChange('musicBrainzReleaseGroupId')} maxLength={100} />
        </label>
      </fieldset>

      {isEdit && (
        <fieldset className="admin-fieldset">
          <legend>Artwork</legend>
          <p className="inline-state">
            Refresh artwork from Cover Art Archive via a verified MusicBrainz release match. This calls the
            external metadata service and is mongodb-only.
          </p>
          <button className="btn btn-outline btn-sm" type="button" onClick={handleRefreshArtwork}>
            Find artwork
          </button>
          {artwork.status === 'loading' && <p className="inline-state" aria-busy="true">Searching MusicBrainz...</p>}
          {artwork.status === 'error' && (
            <p className="form-error" role="alert">{artwork.error?.message}</p>
          )}
          {artwork.status === 'success' && artwork.preview && (
            <div className="admin-artwork-preview">
              {artwork.preview.release ? (
                <>
                  <p className="inline-state">
                    Matched release: <strong>{artwork.preview.release.title}</strong>
                    {' '}by {artwork.preview.release.artistCreditPhrase || 'unknown artist'}
                    {artwork.preview.release.date ? ` (${artwork.preview.release.date.slice(0, 4)})` : ''}
                  </p>
                  {artwork.preview.artwork ? (
                    <p className="inline-state">Approved front artwork found from Cover Art Archive.</p>
                  ) : (
                    <p className="form-error" role="alert">No approved artwork was found for this release.</p>
                  )}
                  {artwork.preview.warnings.map((warning, index) => (
                    <p key={index} className="inline-state">{warning.message}</p>
                  ))}
                  {artwork.preview.artwork && (
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      disabled={artwork.applying}
                      onClick={handleApplyArtwork}
                    >
                      {artwork.applying ? 'Saving...' : 'Save this artwork'}
                    </button>
                  )}
                </>
              ) : (
                <p className="form-error" role="alert">
                  {(artwork.preview.warnings[0]?.message) || 'No matching MusicBrainz release was accepted.'}
                </p>
              )}
            </div>
          )}
        </fieldset>
      )}

      <div className="admin-form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <Link className="btn btn-outline" to="/admin/products">Cancel</Link>
      </div>
    </form>
  );
}
