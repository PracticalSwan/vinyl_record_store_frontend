import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TRACKING_PREFERENCE_KEY } from '../../src/lib/identity';
import {
  flush,
  prepareTrackingIdentityChange,
  resetTrackingForTests,
  retryDelay,
  setTrackingEnabled,
  stripInternal,
  track,
  trackingQueueForTests,
} from '../../src/lib/tracking';
import { sendInteractions } from '../../src/lib/api';

vi.mock('../../src/lib/api', () => ({ sendInteractions: vi.fn() }));

describe('tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetTrackingForTests();
    setTrackingEnabled(true);
    vi.clearAllMocks();
  });

  it('builds a privacy-bounded event and deduplicates strict-mode effects', () => {
    expect(track('product_view', {
      productId: 1,
      surface: 'product-detail',
      dedupeKey: 'product-view:1',
    })).toBe(true);
    expect(track('product_view', {
      productId: 1,
      surface: 'product-detail',
      dedupeKey: 'product-view:1',
    })).toBe(false);
    expect(trackingQueueForTests()).toHaveLength(1);
    expect(stripInternal(trackingQueueForTests()[0])).toMatchObject({
      v: 1,
      type: 'product_view',
      productId: 1,
      source: 'groovehaus-frontend',
      surface: 'product-detail',
    });
    expect(JSON.stringify(trackingQueueForTests()[0])).not.toMatch(/username|cookie|email/i);
  });

  it('allows the same event after the short duplicate-suppression window', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000);
    expect(track('product_view', {
      productId: 1,
      surface: 'product-detail',
      dedupeKey: 'product-view:1',
    })).toBe(true);
    now.mockReturnValue(12_001);
    expect(track('product_view', {
      productId: 1,
      surface: 'product-detail',
      dedupeKey: 'product-view:1',
    })).toBe(true);
    expect(trackingQueueForTests()).toHaveLength(2);
    now.mockRestore();
  });

  it('keeps recommendation impressions deduplicated for the full request page view', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000);
    const payload = {
      productId: 1,
      surface: 'recommendations',
      dedupeKey: 'impression:request-1:1',
      dedupeWindowMs: Number.POSITIVE_INFINITY,
    };
    expect(track('recommendation_impression', payload)).toBe(true);
    now.mockReturnValue(60_000);
    expect(track('recommendation_impression', payload)).toBe(false);
    expect(trackingQueueForTests()).toHaveLength(1);
    now.mockRestore();
  });

  it('opt-out clears unsent events and prevents new capture', () => {
    track('wishlist_add', { productId: 2, surface: 'catalog' });
    setTrackingEnabled(false);
    expect(localStorage.getItem(TRACKING_PREFERENCE_KEY)).toBe('disabled');
    expect(trackingQueueForTests()).toEqual([]);
    expect(track('cart_add', { productId: 2, surface: 'catalog' })).toBe(false);
  });

  it('keeps opt-out authoritative when browser storage rejects the preference write', () => {
    track('wishlist_add', { productId: 2, surface: 'catalog' });
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    setTrackingEnabled(false);

    expect(trackingQueueForTests()).toEqual([]);
    expect(track('cart_add', { productId: 2, surface: 'catalog' })).toBe(false);
    storageWrite.mockRestore();
  });

  it('flushes accepted and duplicate events without surfacing network work', async () => {
    sendInteractions.mockResolvedValue({ data: { accepted: 1, duplicates: 0 } });
    track('wishlist_add', { productId: 2, surface: 'catalog' });
    await flush();
    expect(sendInteractions).toHaveBeenCalledWith([
      expect.objectContaining({ type: 'wishlist_add', productId: 2 }),
    ], { keepalive: false });
    expect(trackingQueueForTests()).toEqual([]);
  });

  it('flushes or discards queued events before an authentication identity changes', async () => {
    sendInteractions.mockRejectedValue(new Error('offline'));
    track('wishlist_add', { productId: 2, surface: 'catalog' });

    await prepareTrackingIdentityChange();

    expect(sendInteractions).toHaveBeenCalledTimes(1);
    expect(trackingQueueForTests()).toEqual([]);
    expect(localStorage.getItem('groovehaus.interaction-queue.v1')).toBeNull();
  });

  it('strips retry bookkeeping and caps exponential backoff', () => {
    expect(stripInternal({ eventId: 'a', _attempts: 3 })).toEqual({ eventId: 'a' });
    expect(retryDelay(99)).toBe(30_000);
  });
});
