import { describe, expect, it } from 'vitest';
import {
  availabilityLabel,
  canPurchase,
  displayArtist,
  formatMoney,
} from '../../src/lib/productDisplay';

describe('dataset-safe product display', () => {
  it('uses explicit fallbacks and blocks unknown commercial state', () => {
    const record = { artist: null, price: null, currency: null, stock: null };
    expect(displayArtist(record)).toBe('Unknown artist');
    expect(formatMoney(record.price, record.currency)).toBe('Price unavailable');
    expect(availabilityLabel(record.stock)).toBe('Availability unknown');
    expect(canPurchase(record)).toBe(false);
  });

  it('allows purchase only for known priced inventory', () => {
    expect(canPurchase({ price: 25, currency: 'USD', stock: 'in' })).toBe(true);
    expect(canPurchase({ price: 25, currency: 'USD', stock: 'out' })).toBe(false);
  });
});
