// Pure helpers for the simulated (FFP-08) checkout. No real payment, no backend
// order, no persistence beyond the current browser session.

export const DEMO_SHIPPING = 6;
export const DEMO_PAYMENT_LABEL = 'Demonstration payment';

export const COUNTRY_OPTIONS = [
  'Thailand',
  'United States',
  'United Kingdom',
  'Japan',
  'Singapore',
  'Australia',
  'Germany',
  'Other',
];

const DRAFT_KEY = 'groovehaus.checkout-draft.v1';
const ORDER_KEY_PREFIX = 'groovehaus.demo-order.';

export const STEPS = ['cart', 'shipping', 'payment', 'review'];

export const EMPTY_SHIPPING = {
  name: '',
  address1: '',
  address2: '',
  city: '',
  postalCode: '',
  country: '',
};

export function validateShipping(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Full name is required.';
  if (!form.address1?.trim()) errors.address1 = 'Address line 1 is required.';
  if (!form.city?.trim()) errors.city = 'City is required.';
  if (!form.postalCode?.trim()) errors.postalCode = 'Postal code is required.';
  if (!form.country?.trim()) errors.country = 'Country is required.';
  return errors;
}

export function computeTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.record?.price) || 0) * item.qty, 0);
  const shipping = cartItems.length > 0 ? DEMO_SHIPPING : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

// Items that block a demo order: anything no longer in the catalog or out of
// stock. The user must return to the cart and resolve these before confirming.
export function findBlockingItems(cartItems) {
  return cartItems.filter((item) => !item.record || item.record.stock === 'out');
}

export function generateDemoReference() {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(6);
    cryptoObj.getRandomValues(bytes);
    const code = Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .slice(0, 8);
    return `DEMO-${code}`;
  }
  // Deterministic fallback (rare path; crypto.getRandomValues is widely available).
  return `DEMO-${Date.now().toString(36).toUpperCase().slice(-8)}`;
}

export function snapshotOrder({ cartItems, shipping, totals, reference }) {
  return {
    reference,
    createdAt: new Date().toISOString(),
    shipping: {
      name: shipping.name,
      address1: shipping.address1,
      address2: shipping.address2,
      city: shipping.city,
      postalCode: shipping.postalCode,
      country: shipping.country,
    },
    items: cartItems.map((item) => ({
      id: item.record.id,
      title: item.record.title,
      artist: item.record.artist,
      price: Number(item.record.price),
      qty: item.qty,
    })),
    totals,
  };
}

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function readDraft() {
  try {
    return safeParse(sessionStorage.getItem(DRAFT_KEY));
  } catch {
    return null;
  }
}

export function writeDraft(state) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage may be unavailable; the in-memory flow still works.
  }
}

export function writeOrder(reference, order) {
  try {
    sessionStorage.setItem(`${ORDER_KEY_PREFIX}${reference}`, JSON.stringify(order));
    return true;
  } catch {
    return false;
  }
}

export function readOrder(reference) {
  try {
    return safeParse(sessionStorage.getItem(`${ORDER_KEY_PREFIX}${reference}`));
  } catch {
    return null;
  }
}
