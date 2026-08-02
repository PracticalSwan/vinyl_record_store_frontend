export const displayArtist = (record) => record?.artist || 'Unknown artist';
export const displayValue = (value, fallback = 'Not provided') => (
  value === null || value === undefined || value === '' ? fallback : value
);

export function formatMoney(price, currency) {
  if (!Number.isFinite(price) || !currency) return 'Price unavailable';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);
  } catch {
    return `${currency} ${Number(price).toFixed(2)}`;
  }
}

export function availabilityLabel(stock) {
  if (stock === 'in') return 'In stock';
  if (stock === 'low') return 'Low stock';
  if (stock === 'out') return 'Out of stock';
  return 'Availability unknown';
}

export const canPurchase = (record) => (
  Number.isFinite(record?.price)
  && Boolean(record?.currency)
  && ['in', 'low'].includes(record?.stock)
);
