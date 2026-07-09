// Catalog enum options mirrored from the backend (src/models/constants.js).
// The backend validates every write, so these drive the form controls only.
export const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Soul', 'Electronic', 'Classical', 'Folk', 'Hip-Hop', 'Blues',
];

export const STOCK_OPTIONS = [
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
];

export const CONDITION_OPTIONS = ['M', 'NM', 'VG+', 'VG', 'G'];

export const FORMAT_OPTIONS = ['LP, 33 1/3 rpm', '2xLP', '3xLP', '2xLP + EP'];

export const STOCK_BADGE = { in: 'badge-in', low: 'badge-low', out: 'badge-out' };
export const STOCK_LABEL = { in: 'In stock', low: 'Low stock', out: 'Out of stock' };
