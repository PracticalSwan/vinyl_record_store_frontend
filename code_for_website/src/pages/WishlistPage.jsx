import { useNavigate } from 'react-router-dom';
import { records } from '../data/records';
import { useStore } from '../context/StoreContext';
import { IconVinylDark, IconHeart } from '../components/Icons';

function StockBadge({ stock }) {
  if (stock === 'in')  return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Only 1 left</span>;
  return <span className="badge badge-out">Out of stock</span>;
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart } = useStore();
  const items = records.filter(r => wishlist.includes(r.id));

  return (
    <main>
      <div className="container list-page">
        <div className="list-page-header">
          <h1 className="section-heading" style={{ fontSize: 28 }}>
            Wishlist <small>{items.length} record{items.length !== 1 ? 's' : ''} saved</small>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="state-box" role="status">
            <div className="state-icon" aria-hidden="true"><IconHeart /></div>
            <p className="state-title">Your wishlist is empty</p>
            <p className="state-desc">Tap the heart icon on any record to save it here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Browse catalog</button>
          </div>
        ) : (
          <div className="list-items" role="list" aria-label="Your wishlist">
            {items.map(r => (
              <article
                key={r.id}
                className="list-item"
                role="listitem"
                aria-label={`${r.title} by ${r.artist}`}
              >
                <div className="list-item-cover" aria-hidden="true">
                  <IconVinylDark />
                </div>
                <div className="list-item-info">
                  <p className="list-item-title">{r.title}</p>
                  <p className="list-item-artist">{r.artist}</p>
                  <div className="list-item-meta">
                    <span className="badge badge-genre">{r.genre}</span>
                    <span className="badge badge-era">{r.year}</span>
                    <StockBadge stock={r.stock} />
                    <span className="badge badge-cond">{r.condition}</span>
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className="list-item-price" aria-label={`Price: $${r.price}`}>${r.price}</span>
                  {r.stock === 'out' ? (
                    <button className="btn btn-outline btn-sm" disabled aria-disabled="true">Notify me</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(r.id)}>Add to cart</button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    aria-label={`Remove ${r.title} from wishlist`}
                    onClick={() => removeFromWishlist(r.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
