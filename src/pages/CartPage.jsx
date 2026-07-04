import { useStore } from '../context/useStore';
import { useProductQuery, useProductsByIds } from '../hooks/useRemoteProducts';
import { RecScroll, SkeletonGrid } from '../components/ProductGrid';
import { IconVinylDark } from '../components/Icons';

const SHIPPING = 6;
const SUGGESTION_QUERY = {
  q: '', page: 1, limit: 8, genres: [], eras: [], conditions: [],
  minPrice: null, maxPrice: null, inStock: true, sort: 'newest',
};

export default function CartPage() {
  const store = useStore();
  const { cart, removeFromCart, updateQty } = store;
  const products = useProductsByIds(cart.map((item) => item.id));
  const suggestions = useProductQuery(SUGGESTION_QUERY);
  const cartItems = cart.flatMap((item) => {
    const record = products.items.find((product) => product.id === item.id);
    return record ? [{ ...item, record }] : [];
  });
  const subtotal = cartItems.reduce((sum, item) => sum + item.record.price * item.qty, 0);
  const total = subtotal + SHIPPING;
  const cartIds = new Set(cart.map((item) => item.id));
  const suggestedItems = suggestions.items.filter((record) => !cartIds.has(record.id)).slice(0, 6);

  return (
    <main><div className="container list-page">
      <div className="list-page-header"><h1 className="section-heading page-heading">Cart <small>{cart.length} records</small></h1></div>
      {products.status === 'loading' && <SkeletonGrid count={Math.min(cart.length, 4)} />}
      {products.status === 'error' && <div className="state-box" role="alert"><p className="state-title">Cart unavailable</p><p className="state-desc">{products.error?.message}</p><button className="btn btn-primary" onClick={products.reload}>Try again</button></div>}
      {products.failed > 0 && products.items.length > 0 && <p className="inline-state" role="status">Some cart records are no longer available and are excluded from the total.</p>}
      {products.status === 'empty' && <div className="state-box" role="status"><p className="state-title">Your cart is empty</p><p className="state-desc">Browse the catalog and add records to your cart.</p></div>}
      {cartItems.length > 0 && <><div className="list-items" role="list" aria-label="Your cart">
        {cartItems.map(({ record, qty }) => <article key={record.id} className="list-item" role="listitem" aria-label={`${record.title} by ${record.artist}`}>
          <div className="list-item-cover" aria-hidden="true"><IconVinylDark /></div>
          <div className="list-item-info"><p className="list-item-title">{record.title}</p><p className="list-item-artist">{record.artist}</p><div className="list-item-meta"><span className="badge badge-genre">{record.genre}</span><span className="badge badge-era">{record.year}</span><span className="badge badge-cond">{record.condition}</span></div></div>
          <div className="list-item-actions"><div className="qty-control" role="group" aria-label={`Quantity for ${record.title}`}><button className="qty-btn" aria-label="Decrease quantity" disabled={store.isPending('cart', record.id)} onClick={() => updateQty(record.id, -1)}>-</button><span className="qty-val" aria-live="polite">{qty}</span><button className="qty-btn" aria-label="Increase quantity" disabled={store.isPending('cart', record.id)} onClick={() => updateQty(record.id, 1)}>+</button></div><span className="list-item-price" aria-label={`Price: $${record.price * qty}`}>${record.price * qty}</span><button className="btn btn-ghost btn-sm" aria-label={`Remove ${record.title} from cart`} disabled={store.isPending('cart', record.id)} onClick={() => removeFromCart(record.id)}>Remove</button></div>
        </article>)}
      </div><div className="cart-summary" aria-label="Order summary"><h2>Order summary</h2><div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div className="cart-summary-row"><span>Shipping</span><span>${SHIPPING.toFixed(2)}</span></div><div className="cart-summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div><button className="btn btn-accent checkout-button" disabled title="Checkout is outside the academic demo scope">Checkout unavailable in demo</button></div></>}
      <section aria-labelledby="cart-rec-heading" className="cart-recommendations"><h2 className="section-heading" id="cart-rec-heading">You may also like</h2><hr className="section-rule" aria-hidden="true" />{suggestions.status === 'loading' && <p className="inline-state">Loading suggestions...</p>}{suggestedItems.length > 0 && <RecScroll records={suggestedItems} showReason={false} ariaLabel="Suggested records" surface="cart" />}</section>
    </div></main>
  );
}
