import { useStore } from '../context/useStore';

export default function StoreStatus() {
  const store = useStore();
  if (store.status === 'loading') {
    return <p className="store-status" role="status">Loading your saved account state...</p>;
  }
  if (store.error) {
    return (
      <div className="store-status store-status-error" role="alert">
        <span>{store.error.message}</span>
        <button className="btn btn-outline btn-sm" type="button" onClick={store.retry}>Try again</button>
      </div>
    );
  }
  if (store.warnings.length) {
    return (
      <div className="store-status" role="status">
        {store.warnings.map((warning) => <span key={`${warning.code}-${warning.productId}`}>{warning.message}</span>)}
      </div>
    );
  }
  return null;
}
