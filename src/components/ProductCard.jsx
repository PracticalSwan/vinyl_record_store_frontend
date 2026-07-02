import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { IconHeart, IconVinyl } from './Icons';

function StockBadge({ stock }) {
  if (stock === 'in')  return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Low stock</span>;
  return <span className="badge badge-out">Out of stock</span>;
}

function StockDot({ stock }) {
  const cls   = stock === 'in' ? 'dot-in' : stock === 'low' ? 'dot-low' : 'dot-out';
  const label = stock === 'in' ? 'In stock' : stock === 'low' ? 'Low stock' : 'Out of stock';
  return <span className={`card-stock-dot ${cls}`} title={label} aria-label={label} />;
}

export default function ProductCard({ record, showReason = false }) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useStore();
  const saved = wishlist.includes(record.id);

  return (
    <article
      className="product-card"
      role="listitem"
      aria-label={`${record.title} by ${record.artist}`}
    >
      <div className="card-cover">
        <div className="card-cover-placeholder">
          <IconVinyl size={64} opacity={0.3} />
        </div>
        <StockDot stock={record.stock} />
        <button
          className={`card-wishlist-btn${saved ? ' active' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Add'} ${record.title} ${saved ? 'from' : 'to'} wishlist`}
          onClick={e => { e.stopPropagation(); toggleWishlist(record.id); }}
        >
          <IconHeart filled={saved} />
        </button>
      </div>

      <div className="card-body">
        <h3 className="card-title">{record.title}</h3>
        <p className="card-artist">{record.artist}</p>
        <div className="card-meta" aria-label="Record details">
          <span className="badge badge-genre">{record.genre}</span>
          <span className="badge badge-era">{record.year}</span>
          <StockBadge stock={record.stock} />
        </div>
        <div className="card-footer">
          <div>
            <span className="card-price" aria-label={`Price: $${record.price}`}>${record.price}</span>
            <p className="card-condition">{record.condition}</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/records/${record.id}`)}
          >
            View record
          </button>
        </div>
      </div>

      {showReason && record.reason && (
        <p className="card-reason" role="note">{record.reason}</p>
      )}
    </article>
  );
}
