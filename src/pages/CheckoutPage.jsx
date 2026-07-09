import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useAuth } from '../context/useAuth';
import { useTracking } from '../context/useTracking';
import { useProductsByIds } from '../hooks/useRemoteProducts';
import {
  COUNTRY_OPTIONS,
  DEMO_PAYMENT_LABEL,
  EMPTY_SHIPPING,
  STEPS,
  clearDraft,
  computeTotals,
  findBlockingItems,
  generateDemoReference,
  readDraft,
  snapshotOrder,
  validateShipping,
  writeDraft,
  writeOrder,
} from '../lib/checkout';

const STEP_INDEX = { cart: 0, shipping: 1, payment: 2, review: 3 };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const store = useStore();
  const tracking = useTracking();
  const { cart, clearCart, status: storeStatus } = store;
  const products = useProductsByIds(cart.map((item) => item.id));

  const restored = useMemo(() => readDraft(), []);
  const [step, setStep] = useState(restored?.step && STEPS.includes(restored.step) ? restored.step : 'cart');
  const [shipping, setShipping] = useState({ ...EMPTY_SHIPPING, ...(restored?.shipping || {}) });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const headingRef = useRef(null);

  const cartItems = cart.flatMap((item) => {
    const record = products.items.find((product) => product.id === item.id);
    return record ? [{ ...item, record }] : [];
  });
  const blocking = findBlockingItems(cartItems);
  const totals = computeTotals(cartItems);

  // Refresh recovery: persist the active step and shipping fields for the
  // current session only. The effect only writes to an external store
  // (sessionStorage); it holds no React state.
  useEffect(() => {
    writeDraft({ step, shipping });
  }, [step, shipping]);

  // An empty cart has nothing to check out; send the user back with a notice.
  // This route is RequireAuth-gated, so the session is authenticated here. Wait
  // until the StoreProvider has synced to that session (status 'authenticated')
  // and product lookups have settled, so a transiently empty cart during
  // restore cannot trigger a false redirect.
  useEffect(() => {
    if (auth.status === 'authenticated' && storeStatus !== 'authenticated' && storeStatus !== 'error') return;
    if (products.status === 'loading') return;
    if (cart.length === 0) {
      navigate('/cart', { state: { notice: 'Your cart is empty.' }, replace: true });
    }
  }, [cart.length, products.status, storeStatus, auth.status, navigate]);

  // Move keyboard focus to the step heading on step change.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const updateShipping = (field) => (event) => {
    setShipping((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const goTo = (next) => setStep(next);

  const handleShippingSubmit = (event) => {
    event.preventDefault();
    const validation = validateShipping(shipping);
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) return;
    goTo('payment');
  };

  const handlePlaceOrder = async () => {
    if (blocking.length > 0 || cartItems.length === 0) return;
    setPlacing(true);
    const reference = generateDemoReference();
    const order = snapshotOrder({ cartItems, shipping, totals, reference });
    // A failed validation keeps the cart intact; only a successful local
    // confirmation writes the order, clears the checkout draft, and empties the cart.
    writeOrder(reference, order);
    clearDraft();
    try {
      tracking.track('demo_checkout_complete', {
        reference,
        itemCount: order.items.length,
        total: order.totals.total,
      });
    } catch {
      // Analytics never blocks the demo confirmation.
    }
    await clearCart();
    navigate(`/orders/demo/${reference}`, { replace: true });
  };

  const stepIndex = STEP_INDEX[step];

  return (
    <main><div className="container checkout">
      <h1 className="section-heading page-heading" tabIndex={-1} ref={headingRef}>Checkout</h1>
      <p className="checkout-demo-banner" role="note">
        This is a classroom demonstration. No payment is taken, no real order is placed, and shipping
        details are kept only for this browser session.
      </p>
      <p className="checkout-progress" aria-live="polite">
        Step {stepIndex + 1} of {STEPS.length}: {step === 'cart' ? 'Cart review' : step === 'shipping' ? 'Shipping' : step === 'payment' ? 'Payment' : 'Review and confirm'}
      </p>

      {step === 'cart' && (
        <section className="checkout-step" aria-labelledby="step-cart">
          <h2 className="section-heading" id="step-cart">Cart review</h2>
          {products.status === 'loading' && <p className="inline-state" aria-busy="true">Loading cart...</p>}
          {products.status === 'error' && (
            <div className="state-box" role="alert">
              <p className="state-title">Cart unavailable</p>
              <p className="state-desc">{products.error?.message}</p>
            </div>
          )}
          {blocking.length > 0 && (
            <div className="state-box compact-state" role="alert">
              <p className="state-title">Resolve availability before continuing</p>
              <p className="state-desc">
                {blocking.length} item(s) are out of stock or no longer available. Return to the cart to remove them.
              </p>
            </div>
          )}
          <ul className="checkout-items" role="list">
            {cartItems.map(({ record, qty }) => (
              <li key={record.id} className="checkout-item">
                <span className="checkout-item-title">{record.title}</span>
                <span className="checkout-item-artist">{record.artist}</span>
                <span className="checkout-item-qty">Qty {qty}</span>
                <span className="checkout-item-price">${(record.price * qty).toFixed(2)}</span>
                {record.stock === 'out' && <span className="badge badge-out">Out of stock</span>}
              </li>
            ))}
          </ul>
          <Totals totals={totals} />
          <div className="checkout-step-actions">
            <button className="btn btn-outline" type="button" onClick={() => navigate('/cart')}>Back to cart</button>
            <button className="btn btn-primary" type="button" disabled={cartItems.length === 0} onClick={() => goTo('shipping')}>Continue to shipping</button>
          </div>
        </section>
      )}

      {step === 'shipping' && (
        <section className="checkout-step" aria-labelledby="step-shipping">
          <h2 className="section-heading" id="step-shipping">Shipping details</h2>
          <p className="inline-state">These temporary demo fields are cleared after confirmation and are never sent to analytics.</p>
          <form className="checkout-form" onSubmit={handleShippingSubmit}>
            <label className="admin-field admin-field-wide">
              <span>Full name</span>
              <input value={shipping.name} onChange={updateShipping('name')} autoComplete="name" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </label>
            <label className="admin-field admin-field-wide">
              <span>Address line 1</span>
              <input value={shipping.address1} onChange={updateShipping('address1')} autoComplete="address-line1" />
              {errors.address1 && <span className="form-error">{errors.address1}</span>}
            </label>
            <label className="admin-field admin-field-wide">
              <span>Address line 2 (optional)</span>
              <input value={shipping.address2} onChange={updateShipping('address2')} autoComplete="address-line2" />
            </label>
            <label className="admin-field">
              <span>City</span>
              <input value={shipping.city} onChange={updateShipping('city')} autoComplete="address-level2" />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </label>
            <label className="admin-field">
              <span>Postal code</span>
              <input value={shipping.postalCode} onChange={updateShipping('postalCode')} autoComplete="postal-code" />
              {errors.postalCode && <span className="form-error">{errors.postalCode}</span>}
            </label>
            <label className="admin-field">
              <span>Country</span>
              <select value={shipping.country} onChange={updateShipping('country')} autoComplete="country-name">
                <option value="">Select a country</option>
                {COUNTRY_OPTIONS.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
              {errors.country && <span className="form-error">{errors.country}</span>}
            </label>
            <div className="checkout-step-actions">
              <button className="btn btn-outline" type="button" onClick={() => goTo('cart')}>Back</button>
              <button className="btn btn-primary" type="submit">Continue to payment</button>
            </div>
          </form>
        </section>
      )}

      {step === 'payment' && (
        <section className="checkout-step" aria-labelledby="step-payment">
          <h2 className="section-heading" id="step-payment">Payment</h2>
          <div className="checkout-payment" role="group" aria-label="Demonstration payment">
            <p className="inline-state">
              Payment method: <strong>{DEMO_PAYMENT_LABEL}</strong>
            </p>
            <p className="inline-state">
              This academic demo does not collect card numbers, bank details, wallets, or any real payment
              information, and it never charges you. No payment provider is contacted.
            </p>
          </div>
          <div className="checkout-step-actions">
            <button className="btn btn-outline" type="button" onClick={() => goTo('shipping')}>Back</button>
            <button className="btn btn-primary" type="button" onClick={() => goTo('review')}>Continue to review</button>
          </div>
        </section>
      )}

      {step === 'review' && (
        <section className="checkout-step" aria-labelledby="step-review">
          <h2 className="section-heading" id="step-review">Review and confirm</h2>
          {blocking.length > 0 && (
            <div className="state-box compact-state" role="alert">
              <p className="state-title">Availability changed</p>
              <p className="state-desc">
                {blocking.length} item(s) became unavailable. Return to the cart and remove them before placing the demo order.
              </p>
            </div>
          )}
          <div className="checkout-review">
            <div className="checkout-review-block">
              <h3>Shipping to</h3>
              <p>{shipping.name}</p>
              <p>{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ''}</p>
              <p>{shipping.city} {shipping.postalCode}</p>
              <p>{shipping.country}</p>
            </div>
            <div className="checkout-review-block">
              <h3>Items</h3>
              <ul className="checkout-items" role="list">
                {cartItems.map(({ record, qty }) => (
                  <li key={record.id} className="checkout-item">
                    <span className="checkout-item-title">{record.title}</span>
                    <span className="checkout-item-qty">Qty {qty}</span>
                    <span className="checkout-item-price">${(record.price * qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Totals totals={totals} />
          <p className="inline-state">Place the demo order to generate a reference and example status timeline. No charge occurs.</p>
          <div className="checkout-step-actions">
            <button className="btn btn-outline" type="button" onClick={() => goTo('payment')}>Back</button>
            <button
              className="btn btn-accent"
              type="button"
              disabled={placing || blocking.length > 0 || cartItems.length === 0 || store.isPending('cart')}
              onClick={handlePlaceOrder}
            >
              {placing ? 'Placing demo order...' : 'Place demo order'}
            </button>
          </div>
        </section>
      )}
    </div></main>
  );
}

function Totals({ totals }) {
  return (
    <div className="cart-summary" aria-label="Order summary">
      <div className="cart-summary-row"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
      <div className="cart-summary-row"><span>Shipping</span><span>${totals.shipping.toFixed(2)}</span></div>
      <div className="cart-summary-row total"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
    </div>
  );
}
