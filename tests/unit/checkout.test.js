import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateShipping,
  computeTotals,
  findBlockingItems,
  generateDemoReference,
  snapshotOrder,
  readDraft,
  writeDraft,
  clearDraft,
  EMPTY_SHIPPING,
} from '../../src/lib/checkout';

describe('checkout helpers', () => {
  describe('validateShipping', () => {
    it('flags every required field when empty', () => {
      const errors = validateShipping(EMPTY_SHIPPING);
      expect(errors.name).toBeTruthy();
      expect(errors.address1).toBeTruthy();
      expect(errors.city).toBeTruthy();
      expect(errors.postalCode).toBeTruthy();
      expect(errors.country).toBeTruthy();
    });
    it('passes a complete shipping form', () => {
      const errors = validateShipping({
        name: 'Mira', address1: '12 Sukhumvit', city: 'Bangkok', postalCode: '10110', country: 'Thailand',
      });
      expect(Object.values(errors).some(Boolean)).toBe(false);
    });
  });

  describe('computeTotals', () => {
    it('sums price times quantity and adds shipping', () => {
      const totals = computeTotals([
        { record: { price: 48 }, qty: 2 },
        { record: { price: 10 }, qty: 1 },
      ]);
      expect(totals.subtotal).toBe(106);
      expect(totals.shipping).toBe(6);
      expect(totals.total).toBe(112);
    });
    it('zeros shipping for an empty cart', () => {
      const totals = computeTotals([]);
      expect(totals.subtotal).toBe(0);
      expect(totals.shipping).toBe(0);
      expect(totals.total).toBe(0);
    });
  });

  describe('findBlockingItems', () => {
    it('flags out-of-stock and missing records only', () => {
      const items = [
        { record: { stock: 'in' }, qty: 1 },
        { record: { stock: 'out' }, qty: 1 },
        { qty: 1 },
      ];
      expect(findBlockingItems(items)).toHaveLength(2);
    });
  });

  describe('generateDemoReference', () => {
    it('produces a DEMO- prefixed alphanumeric reference', () => {
      expect(generateDemoReference()).toMatch(/^DEMO-[A-Z0-9]{8}$/);
    });
  });

  describe('snapshotOrder', () => {
    it('captures a server-free order with item snapshots and totals', () => {
      const order = snapshotOrder({
        cartItems: [{ record: { id: 1, title: 'Kind of Blue', artist: 'Miles Davis', price: 48 }, qty: 2 }],
        shipping: { name: 'Mira', address1: '12 Sukhumvit', address2: '', city: 'Bangkok', postalCode: '10110', country: 'Thailand' },
        totals: { subtotal: 96, shipping: 6, total: 102 },
        reference: 'DEMO-ABCD1234',
      });
      expect(order.reference).toBe('DEMO-ABCD1234');
      expect(order.items[0]).toEqual({ id: 1, title: 'Kind of Blue', artist: 'Miles Davis', price: 48, qty: 2 });
      expect(order.totals.total).toBe(102);
      expect(order.shipping.name).toBe('Mira');
    });
  });

  describe('checkout draft storage', () => {
    beforeEach(() => sessionStorage.clear());

    it('round-trips the active step and shipping through sessionStorage', () => {
      writeDraft({ step: 'shipping', shipping: { ...EMPTY_SHIPPING, name: 'Mira' } });
      const restored = readDraft();
      expect(restored.step).toBe('shipping');
      expect(restored.shipping.name).toBe('Mira');
      clearDraft();
      expect(readDraft()).toBe(null);
    });
  });
});
