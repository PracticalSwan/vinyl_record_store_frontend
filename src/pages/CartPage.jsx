import { useCatalog } from '../context/useCatalog';
import { useStore } from '../context/useStore';
import { RecScroll } from '../components/ProductGrid';
import { IconVinylDark } from '../components/Icons';

const SHIPPING = 6;

export default function CartPage() {
  const { records } = useCatalog();
  const { cart, removeFromCart, updateQty } = useStore();

  const cartItems = cart
    .map(c => ({ ...c, record: records.find(r => r.id === c.id) }))
    .filter(c => c.record);

  const subtotal = cartItems.reduce((sum, c) => sum + c.record.price * c.qty, 0);
  const total    = subtotal + SHIPPING;

  const othersAlso = records.filter(r => !cart.find(c => c.id === r.id)).slice(0, 6);

  return (
    <main>
      <div className="container list-page">
        <div className="list-page-header">
          <h1 className="section-heading" style={{ fontSize: 28 }}>
            Cart <small>{cartItems.length} record{cartItems.length !== 1 ? 's' : ''}</small>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="state-box" role="status">
            <p className="state-title">Your cart is empty</p>
            <p className="state-desc">Browse the catalog and add records to your cart.</p>
          </div>
        ) : (
          <>
            <div className="list-items" role="list" aria-label="Your cart">
              {cartItems.map(({ record: r, qty }) => (
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
                      <span className="badge badge-cond">{r.condition}</span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <div className="qty-control" role="group" aria-label={`Quantity for ${r.title}`}>
                      <button className="qty-btn" aria-label="Decrease quantity" onClick={() => updateQty(r.id, -1)}>−</button>
                      <span className="qty-val" aria-live="polite">{qty}</span>
                      <button className="qty-btn" aria-label="Increase quantity" onClick={() => updateQty(r.id, 1)}>+</button>
                    </div>
                    <span className="list-item-price" aria-label={`Price: $${r.price * qty}`}>
                      ${r.price * qty}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      aria-label={`Remove ${r.title} from cart`}
                      onClick={() => removeFromCart(r.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-summary" aria-label="Order summary">
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: '.75rem' }}>Order summary</h2>
              <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="cart-summary-row"><span>Shipping</span><span>${SHIPPING.toFixed(2)}</span></div>
              <div className="cart-summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button
                className="btn btn-accent"
                style={{ width: '100%', marginTop: '1rem', padding: '12px' }}
                disabled
                aria-disabled="true"
                title="Checkout is outside the academic demo scope"
              >
                Checkout unavailable in demo
              </button>
            </div>
          </>
        )}

        <section aria-labelledby="cart-rec-heading" style={{ marginTop: '3rem' }}>
          <h2 className="section-heading" style={{ fontSize: 20 }} id="cart-rec-heading">
            Others also bought
          </h2>
          <hr className="section-rule" aria-hidden="true" />
          <RecScroll records={othersAlso} showReason={false} ariaLabel="Records others also bought" />
        </section>
      </div>
    </main>
  );
}
