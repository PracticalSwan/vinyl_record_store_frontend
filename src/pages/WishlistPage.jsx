import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useProductsByIds } from '../hooks/useRemoteProducts';
import { IconVinylDark, IconHeart } from '../components/Icons';
import { SkeletonGrid } from '../components/ProductGrid';

function StockBadge({ stock }) {
  if (stock === 'in') return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Only 1 left</span>;
  return <span className="badge badge-out">Out of stock</span>;
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart } = useStore();
  const products = useProductsByIds(wishlist);

  return (
    <main><div className="container list-page">
      <div className="list-page-header"><h1 className="section-heading page-heading">Wishlist <small>{wishlist.length} saved</small></h1></div>
      {products.status === 'loading' && <SkeletonGrid count={Math.min(wishlist.length, 4)} />}
      {products.status === 'error' && <div className="state-box" role="alert"><p className="state-title">Wishlist unavailable</p><p className="state-desc">{products.error?.message}</p><button className="btn btn-primary" onClick={products.reload}>Try again</button></div>}
      {products.failed > 0 && products.items.length > 0 && <p className="inline-state" role="status">Some saved records are no longer available.</p>}
      {products.status === 'empty' && <div className="state-box" role="status"><div className="state-icon" aria-hidden="true"><IconHeart /></div><p className="state-title">Your wishlist is empty</p><p className="state-desc">Use the heart button on any record to save it here.</p><button className="btn btn-primary" onClick={() => navigate('/catalog')}>Browse catalog</button></div>}
      {products.items.length > 0 && (
        <div className="list-items" role="list" aria-label="Your wishlist">
          {products.items.map((record) => (
            <article key={record.id} className="list-item" role="listitem" aria-label={`${record.title} by ${record.artist}`}>
              <div className="list-item-cover" aria-hidden="true"><IconVinylDark /></div>
              <div className="list-item-info"><p className="list-item-title">{record.title}</p><p className="list-item-artist">{record.artist}</p><div className="list-item-meta"><span className="badge badge-genre">{record.genre}</span><span className="badge badge-era">{record.year}</span><StockBadge stock={record.stock} /><span className="badge badge-cond">{record.condition}</span></div></div>
              <div className="list-item-actions"><span className="list-item-price" aria-label={`Price: $${record.price}`}>${record.price}</span>{record.stock === 'out' ? <button className="btn btn-outline btn-sm" disabled>Out of stock</button> : <button className="btn btn-primary btn-sm" onClick={() => addToCart(record.id)}>Add to cart</button>}<button className="btn btn-ghost btn-sm" aria-label={`Remove ${record.title} from wishlist`} onClick={() => removeFromWishlist(record.id)}>Remove</button></div>
            </article>
          ))}
        </div>
      )}
    </div></main>
  );
}
