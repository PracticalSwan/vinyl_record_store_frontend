import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { readOrder, DEMO_SHIPPING } from '../lib/checkout';

// All demo orders stay PENDING: there is no fulfillment, payment, or backend
// persistence, so the timeline is illustrative rather than a real shipment.
const TIMELINE = [
  { key: 'received', label: 'Demo order received', state: 'complete' },
  { key: 'preparing', label: 'Preparing for demonstration dispatch', state: 'current' },
  { key: 'shipped', label: 'Shipped (demonstration only — never fulfilled)', state: 'pending' },
];

export default function DemoOrderConfirmationPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  // Read the sessionStorage order synchronously on mount; refresh recovery
  // reads the same value. The effect only performs the missing-order redirect.
  const order = useMemo(() => (reference ? readOrder(reference) : null), [reference]);

  useEffect(() => {
    if (!reference) return;
    if (!readOrder(reference)) {
      navigate('/cart', { state: { notice: 'That demo order could not be found.' }, replace: true });
    }
  }, [reference, navigate]);

  if (!order) {
    return (
      <main><div className="container catalog-state">
        <p className="inline-state" aria-busy="true">Looking up demo order...</p>
      </div></main>
    );
  }

  const shipping = order.shipping || {};

  return (
    <main><div className="container checkout-confirmation">
      <div className="state-box confirmation-hero" role="status">
        <p className="state-title">Demo order placed</p>
        <p className="state-desc">
          Thank you, {shipping.name || 'music lover'}. No payment was taken and no real order was placed.
        </p>
      </div>

      <div className="confirmation-reference">
        <span className="confirmation-reference-label">Demo order reference</span>
        <code className="confirmation-reference-value">{order.reference}</code>
      </div>

      <p className="confirmation-status" aria-live="polite">
        Status: <strong>PENDING</strong> (demonstration only)
      </p>

      <ol className="confirmation-timeline" role="list">
        {TIMELINE.map((entry) => (
          <li key={entry.key} className={`confirmation-timeline-item ${entry.state}`} aria-current={entry.state === 'current' ? 'step' : undefined}>
            <span className="confirmation-timeline-dot" aria-hidden="true" />
            <span>{entry.label}</span>
          </li>
        ))}
      </ol>

      <div className="confirmation-grid">
        <section className="confirmation-block" aria-labelledby="confirmation-items">
          <h2 className="section-heading" id="confirmation-items">Items</h2>
          <ul className="checkout-items" role="list">
            {order.items.map((item) => (
              <li key={item.id} className="checkout-item">
                <span className="checkout-item-title">{item.title}</span>
                <span className="checkout-item-artist">{item.artist}</span>
                <span className="checkout-item-qty">Qty {item.qty}</span>
                <span className="checkout-item-price">${(item.price * item.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="confirmation-block" aria-labelledby="confirmation-shipping">
          <h2 className="section-heading" id="confirmation-shipping">Shipping (demo)</h2>
          <p>{shipping.name}</p>
          <p>{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ''}</p>
          <p>{shipping.city} {shipping.postalCode}</p>
          <p>{shipping.country}</p>
        </section>
        <section className="confirmation-block" aria-labelledby="confirmation-totals">
          <h2 className="section-heading" id="confirmation-totals">Totals</h2>
          <div className="cart-summary" aria-label="Order summary">
            <div className="cart-summary-row"><span>Subtotal</span><span>${Number(order.totals?.subtotal).toFixed(2)}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>${DEMO_SHIPPING.toFixed(2)}</span></div>
            <div className="cart-summary-row total"><span>Total</span><span>${Number(order.totals?.total).toFixed(2)}</span></div>
          </div>
        </section>
      </div>

      <p className="inline-state">
        This reference and the details above are kept only in this browser session for the demo and are
        not stored on the server.
      </p>

      <div className="checkout-step-actions">
        <Link className="btn btn-primary" to="/catalog">Continue shopping</Link>
        <Link className="btn btn-outline" to="/recommendations">View recommendations</Link>
      </div>
    </div></main>
  );
}
