import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { readOrder, DEMO_SHIPPING } from '../lib/checkout';
import { formatMoney } from '../lib/productDisplay';

export default function DemoOrderConfirmationPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  // Read the sessionStorage order synchronously on mount; refresh recovery
  // reads the same value. The effect only performs the missing-order redirect.
  const order = useMemo(() => (reference ? readOrder(reference) : null), [reference]);

  useEffect(() => {
    if (!reference) return;
    if (!readOrder(reference)) {
      navigate('/cart', { state: { notice: 'That checkout summary could not be found.' }, replace: true });
    }
  }, [reference, navigate]);

  if (!order) {
    return (
      <main><div className="container catalog-state">
        <p className="inline-state" aria-busy="true">Loading checkout summary...</p>
      </div></main>
    );
  }

  const shipping = order.shipping || {};

  return (
    <main><div className="container checkout-confirmation">
      <div className="state-box confirmation-hero" role="status">
        <p className="state-title">Checkout complete</p>
        <p className="state-desc">
          Thank you, {shipping.name || 'music lover'}. Your checkout summary is ready below.
        </p>
      </div>

      <div className="confirmation-reference">
        <span className="confirmation-reference-label">Reference</span>
        <code className="confirmation-reference-value">{order.reference}</code>
      </div>

      <div className="confirmation-grid">
        <section className="confirmation-block" aria-labelledby="confirmation-items">
          <h2 className="section-heading" id="confirmation-items">Items</h2>
          <ul className="checkout-items" role="list">
            {order.items.map((item) => (
              <li key={item.id} className="checkout-item">
                <span className="checkout-item-title">{item.title}</span>
                <span className="checkout-item-artist">{item.artist}</span>
                <span className="checkout-item-qty">Qty {item.qty}</span>
                <span className="checkout-item-price">{formatMoney(item.price * item.qty, item.currency || 'USD')}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="confirmation-block" aria-labelledby="confirmation-shipping">
          <h2 className="section-heading" id="confirmation-shipping">Shipping details</h2>
          <p>{shipping.name}</p>
          <p>{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ''}</p>
          <p>{shipping.city} {shipping.postalCode}</p>
          <p>{shipping.country}</p>
        </section>
        <section className="confirmation-block" aria-labelledby="confirmation-totals">
          <h2 className="section-heading" id="confirmation-totals">Totals</h2>
          <div className="cart-summary" aria-label="Order summary">
            <div className="cart-summary-row"><span>Subtotal</span><span>{formatMoney(Number(order.totals?.subtotal), 'USD')}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>{formatMoney(DEMO_SHIPPING, 'USD')}</span></div>
            <div className="cart-summary-row total"><span>Total</span><span>{formatMoney(Number(order.totals?.total), 'USD')}</span></div>
          </div>
        </section>
      </div>

      <p className="inline-state">
        No real payment was processed. This checkout summary is stored only in this browser session and is not submitted for fulfillment.
      </p>

      <div className="checkout-step-actions">
        <Link className="btn btn-primary" to="/catalog">Continue shopping</Link>
        <Link className="btn btn-outline" to="/recommendations">View recommendations</Link>
      </div>
    </div></main>
  );
}
