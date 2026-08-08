export const displayArtist = (record) => record?.artist || 'Unknown artist';
export const isResearchProduct = (record) => record?.catalogMode === 'research-only' || Boolean(record?.datasetKey);
export const displayYear = (record) => {
  const original = record?.originalReleaseYear
    ?? (record?.yearDisplayType === 'original' ? record?.year : null);
  if (original) return String(original);
  if (record?.editionReleaseYear) return `${record.editionReleaseYear} edition`;
  return 'Year unknown';
};
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
  !isResearchProduct(record)
  && Number.isFinite(record?.price)
  && Boolean(record?.currency)
  && ['in', 'low'].includes(record?.stock)
);
