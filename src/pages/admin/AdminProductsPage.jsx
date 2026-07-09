import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../lib/api';
import {
  STOCK_BADGE,
  STOCK_LABEL,
} from '../../lib/adminConstants';

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null); // { id, action }
  const [actionError, setActionError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { product, kind }
  const dialogRef = useRef(null);

  const reload = useCallback(async (signal) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await api.fetchAdminProducts(
        { page, limit: PAGE_SIZE, includeDeleted },
        { signal },
      );
      setData(response.data);
      setStatus('success');
    } catch (requestError) {
      if (requestError.name === 'AbortError') return;
      setError(requestError);
      setStatus('error');
    }
  }, [page, includeDeleted]);

  useEffect(() => {
    const controller = new AbortController();
    // Deferred to a microtask so the synchronous effect body only synchronizes
    // the AbortController, matching the StoreProvider pattern.
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) reload(controller.signal);
    });
    return () => controller.abort();
  }, [reload]);

  const runMutation = async (id, action, request, optimisticDeleted) => {
    setPending({ id, action });
    setActionError(null);
    try {
      await request();
      // Optimistically reflect the soft-delete/restore state without a refetch,
      // then refetch to reconcile with the server.
      setData((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === id
          ? { ...item, deletedAt: optimisticDeleted ? new Date().toISOString() : null }
          : item)),
      }));
      const controller = new AbortController();
      await reload(controller.signal);
      return true;
    } catch (requestError) {
      setActionError(requestError);
      return false;
    } finally {
      setPending(null);
    }
  };

  const handleDelete = (product) => setConfirm({ product, kind: 'delete' });
  const handleRestore = (product) => setConfirm({ product, kind: 'restore' });

  const confirmAction = async () => {
    const { product, kind } = confirm;
    setConfirm(null);
    if (kind === 'delete') {
      await runMutation(product.id, 'delete', () => api.deleteAdminProduct(product.id, product.updatedAt), true);
    } else {
      await runMutation(product.id, 'restore', () => api.restoreAdminProduct(product.id), false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  // Move keyboard focus into the confirm dialog when it opens and close it on
  // Escape so the modal is fully keyboard-operable (FFP-07 phase 7).
  useEffect(() => {
    if (!confirm) return undefined;
    dialogRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape') setConfirm(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirm]);

  return (
    <div className="admin-products">
      <div className="admin-section-header">
        <h2 className="section-heading">Products <small>{data.total} total</small></h2>
        <div className="admin-products-actions">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => { setIncludeDeleted(event.target.checked); setPage(1); }}
            />
            Include soft-deleted
          </label>
          <Link className="btn btn-accent btn-sm" to="/admin/products/new">Add product</Link>
        </div>
      </div>

      {actionError && (
        <div className="state-box compact-state" role="alert">
          <p className="state-title">Action failed</p>
          <p className="state-desc">{actionError.message}</p>
        </div>
      )}

      {status === 'loading' && <p className="inline-state" aria-busy="true">Loading products...</p>}
      {status === 'error' && (
        <div className="state-box" role="alert">
          <p className="state-title">Products unavailable</p>
          <p className="state-desc">{error?.message}</p>
          <button className="btn btn-primary" type="button" onClick={() => reload()}>Try again</button>
        </div>
      )}

      {status === 'success' && data.items.length === 0 && (
        <div className="state-box" role="status"><p className="state-title">No products</p><p className="state-desc">No products match this view.</p></div>
      )}

      {status === 'success' && data.items.length > 0 && (
        <div className="admin-table-wrap" role="region" aria-label="Product management table">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Title</th>
                <th scope="col">Artist</th>
                <th scope="col">Genre</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Condition</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((product) => {
                const busy = pending?.id === product.id;
                return (
                  <tr key={product.id}>
                    <td className="admin-id">{product.id}</td>
                    <td><Link to={`/admin/products/${product.id}/edit`} className="admin-product-link">{product.title}</Link></td>
                    <td>{product.artist}</td>
                    <td>{product.genre || '—'}</td>
                    <td className="admin-price">${Number(product.price).toFixed(2)}</td>
                    <td><span className={`badge ${STOCK_BADGE[product.stock] || 'badge-cond'}`}>{STOCK_LABEL[product.stock] || product.stock}</span></td>
                    <td>{product.condition}</td>
                    <td>{product.deletedAt ? <span className="badge badge-out">Deleted</span> : <span className="badge badge-in">Active</span>}</td>
                    <td className="admin-row-actions">
                      <Link className="btn btn-ghost btn-sm" to={`/admin/products/${product.id}/edit`}>Edit</Link>
                      {product.deletedAt ? (
                        <button className="btn btn-outline btn-sm" type="button" disabled={busy} onClick={() => handleRestore(product)}>
                          {busy ? 'Working...' : 'Restore'}
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={() => handleDelete(product)}>
                          {busy ? 'Working...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Product pagination">
          <button className="btn btn-outline btn-sm" type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span className="pagination-page" aria-live="polite">Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
        </nav>
      )}

      {confirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal" ref={dialogRef} tabIndex={-1}>
            <h2 className="section-heading" id="confirm-title">
              {confirm.kind === 'delete' ? 'Soft-delete product' : 'Restore product'}
            </h2>
            <p className="modal-body">
              {confirm.kind === 'delete'
                ? `This hides "${confirm.product.title}" (ID ${confirm.product.id}) from the storefront and recommendations. You can restore it later.`
                : `This restores "${confirm.product.title}" (ID ${confirm.product.id}) to the active catalog.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={`btn ${confirm.kind === 'delete' ? 'btn-accent' : 'btn-primary'}`}
                type="button"
                onClick={confirmAction}
              >
                {confirm.kind === 'delete' ? 'Soft-delete' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
