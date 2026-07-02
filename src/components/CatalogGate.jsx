import { useCatalog } from '../context/useCatalog';
import { IconAlert } from './Icons';
import { SkeletonGrid } from './ProductGrid';

export default function CatalogGate({ children }) {
  const { catalogStatus, catalogError, reloadCatalog } = useCatalog();

  if (catalogStatus === 'loading') {
    return (
      <main className="container catalog-state" aria-label="Loading catalog">
        <SkeletonGrid count={8} />
      </main>
    );
  }

  if (catalogStatus === 'error') {
    return (
      <main className="container catalog-state">
        <div className="state-box" role="alert">
          <div className="state-icon" aria-hidden="true"><IconAlert /></div>
          <p className="state-title">Catalog unavailable</p>
          <p className="state-desc">{catalogError?.message}</p>
          <button className="btn btn-primary" onClick={() => reloadCatalog()}>Try again</button>
        </div>
      </main>
    );
  }

  if (catalogStatus === 'empty') {
    return (
      <main className="container catalog-state">
        <div className="state-box" role="status">
          <p className="state-title">No records are available</p>
          <p className="state-desc">The backend returned an empty catalog.</p>
        </div>
      </main>
    );
  }

  return children;
}
