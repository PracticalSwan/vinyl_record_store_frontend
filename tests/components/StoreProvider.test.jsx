import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../src/context/authContext';
import { TrackingContext } from '../../src/context/trackingContext';
import { StoreProvider } from '../../src/context/StoreProvider';
import { useStore } from '../../src/context/useStore';
import { GUEST_STORE_KEY, writeGuestStore } from '../../src/lib/guestStore';
import * as api from '../../src/lib/api';

vi.mock('../../src/lib/api', () => ({
  fetchWishlist: vi.fn(),
  fetchCart: vi.fn(),
  fetchRatings: vi.fn(),
  mergeGuestState: vi.fn(),
  addWishlistProduct: vi.fn(),
  removeWishlistProduct: vi.fn(),
  setCartProduct: vi.fn(),
  removeCartProduct: vi.fn(),
  setProductRating: vi.fn(),
  removeProductRating: vi.fn(),
}));

const anonymous = { status: 'anonymous', user: null };
const authenticated = {
  status: 'authenticated',
  user: { publicId: 'user-1', username: 'listener', role: 'customer' },
};
// Brand-new account: guest data merges into it.
const registered = { ...authenticated, authMethod: 'register' };
// Existing account sign-in: guest data is discarded, not merged.
const signedIn = { ...authenticated, authMethod: 'login' };
// Returning authenticated session via cookie restore: also discards, not merges.
const restored = { ...authenticated, authMethod: 'restore' };

function StoreProbe() {
  const store = useStore();
  const firstItem = store.cart.find((item) => item.id === 1);
  return (
    <>
      <output aria-label="Store status">{store.status}</output>
      <output aria-label="Store error">{store.error?.message || 'none'}</output>
      <output aria-label="Wishlist IDs">{store.wishlist.join(',')}</output>
      <output aria-label="Product 1 quantity">{firstItem?.qty ?? 0}</output>
      <button onClick={() => store.toggleWishlist(2)}>Toggle wishlist 2</button>
      <button onClick={() => store.toggleWishlist(3)}>Toggle wishlist 3</button>
      <button onClick={() => store.removeFromWishlist(3)}>Remove wishlist 3</button>
      <button onClick={() => store.addToCart(1)}>Add product 1</button>
      <button onClick={() => store.updateQty(1, -20)}>Decrease product 1</button>
      <button onClick={() => store.removeFromCart(1)}>Remove product 1</button>
      <button onClick={() => store.retry()}>Retry sync</button>
    </>
  );
}

function renderStore(auth = anonymous) {
  return render(
    <AuthContext.Provider value={auth}>
      <TrackingContext.Provider value={{ enabled: true, setEnabled: vi.fn(), track: vi.fn() }}>
        <StoreProvider><StoreProbe /></StoreProvider>
      </TrackingContext.Provider>
    </AuthContext.Provider>,
  );
}

describe('StoreProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    api.fetchWishlist.mockResolvedValue({ data: { productIds: [] } });
    api.fetchCart.mockResolvedValue({ data: { items: [], warnings: [] } });
    api.fetchRatings.mockResolvedValue({ data: { items: [] } });
  });

  it('starts guests empty and persists wishlist and cart changes', async () => {
    const user = userEvent.setup();
    renderStore();

    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 2' }));
    await user.click(screen.getByRole('button', { name: 'Add product 1' }));
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('2');
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('1');
    expect(JSON.parse(sessionStorage.getItem(GUEST_STORE_KEY))).toMatchObject({
      wishlist: [2],
      cart: [{ id: 1, qty: 1 }],
    });
  });

  it('increments, floors, and removes guest cart quantities safely', async () => {
    const user = userEvent.setup();
    renderStore();

    await user.click(screen.getByRole('button', { name: 'Add product 1' }));
    await user.click(screen.getByRole('button', { name: 'Add product 1' }));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: 'Decrease product 1' }));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Remove product 1' }));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('0');
  });

  it('merges guest state once and clears storage only after success', async () => {
    writeGuestStore({
      wishlist: [2],
      cart: [{ id: 1, qty: 2 }],
      ratings: [{ id: 3, rating: 5, updatedAt: new Date().toISOString() }],
    });
    api.mergeGuestState.mockResolvedValue({
      data: {
        wishlist: [2],
        cart: [{ productPublicId: 1, quantity: 2 }],
        ratings: [{ productPublicId: 3, rating: 5, updatedAt: new Date().toISOString() }],
        warnings: [],
      },
    });

    renderStore(registered);
    await screen.findByText('authenticated');
    expect(api.mergeGuestState).toHaveBeenCalledTimes(1);
    expect(api.mergeGuestState.mock.calls[0][0]).toMatchObject({
      wishlist: [2],
      cart: [{ productId: 1, quantity: 2 }],
      ratings: [{ productId: 3, rating: 5 }],
    });
    expect(api.mergeGuestState.mock.calls[0][0].mergeId).toMatch(/^guest-merge-/);
    expect(sessionStorage.getItem(GUEST_STORE_KEY)).toBeNull();
  });

  it('discards guest state instead of merging when signing in to an existing account', async () => {
    writeGuestStore({ wishlist: [2], cart: [{ id: 1, qty: 2 }] });
    api.fetchWishlist.mockResolvedValue({ data: { productIds: [5] } });

    renderStore(signedIn);
    await screen.findByText('authenticated');
    expect(api.mergeGuestState).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(GUEST_STORE_KEY)).toBeNull();
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('5');
  });

  it('discards guest state on session restore instead of merging', async () => {
    writeGuestStore({ wishlist: [2], cart: [{ id: 1, qty: 2 }] });
    api.fetchWishlist.mockResolvedValue({ data: { productIds: [5] } });

    renderStore(restored);
    await screen.findByText('authenticated');
    expect(api.mergeGuestState).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(GUEST_STORE_KEY)).toBeNull();
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('5');
  });

  it('re-attempts the merge when retrying after a failed sign-up merge', async () => {
    writeGuestStore({ wishlist: [2] });
    api.mergeGuestState
      .mockRejectedValueOnce(new Error('Merge failed'))
      .mockResolvedValueOnce({ data: { wishlist: [2], cart: [], ratings: [], warnings: [] } });
    const user = userEvent.setup();
    renderStore(registered);

    await screen.findByText('error');
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('2');
    expect(sessionStorage.getItem(GUEST_STORE_KEY)).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Retry sync' }));
    await screen.findByText('authenticated');
    expect(api.mergeGuestState).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem(GUEST_STORE_KEY)).toBeNull();
  });

  it('rolls back a rejected authenticated mutation and exposes a retryable error', async () => {
    api.addWishlistProduct.mockRejectedValue(new Error('Write failed'));
    const user = userEvent.setup();
    renderStore(authenticated);
    await screen.findByText('authenticated');

    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 2' }));
    await waitFor(() => expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent(''));
    expect(screen.getByLabelText('Store error')).toHaveTextContent('Write failed');
  });

  it('preserves the full guest snapshot when an automatic merge fails', async () => {
    writeGuestStore({ wishlist: [2, 3], cart: [{ id: 1, qty: 2 }] });
    api.mergeGuestState.mockRejectedValue(new Error('Merge failed'));
    const user = userEvent.setup();
    renderStore(registered);

    await screen.findByText('error');
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('2,3');
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('2');
    expect(JSON.parse(sessionStorage.getItem(GUEST_STORE_KEY))).toMatchObject({
      wishlist: [2, 3],
      cart: [{ id: 1, qty: 2 }],
    });
    expect(JSON.parse(sessionStorage.getItem(GUEST_STORE_KEY)).mergeId).toMatch(/^guest-merge-/);

    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 2' }));
    expect(JSON.parse(sessionStorage.getItem(GUEST_STORE_KEY))).toMatchObject({
      wishlist: [3],
      mergeId: null,
    });
  });

  it('does not post a guest merge unless its idempotency key is persisted', async () => {
    writeGuestStore({ wishlist: [2] });
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    renderStore(registered);

    await screen.findByText('error');
    expect(api.mergeGuestState).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Store error')).toHaveTextContent('safe merge');
    storageWrite.mockRestore();
  });

  it('guards a collection while an authenticated write is pending', async () => {
    let resolveWrite;
    api.addWishlistProduct.mockReturnValue(new Promise((resolve) => { resolveWrite = resolve; }));
    const user = userEvent.setup();
    renderStore(authenticated);
    await screen.findByText('authenticated');

    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 2' }));
    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 3' }));
    expect(api.addWishlistProduct).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('2');
    resolveWrite({ data: { productIds: [2] } });
    await waitFor(() => expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('2'));
  });

  it('rolls back only the failed collection when another collection succeeds concurrently', async () => {
    let rejectWishlist;
    api.addWishlistProduct.mockReturnValue(new Promise((resolve, reject) => {
      rejectWishlist = reject;
    }));
    api.setCartProduct.mockResolvedValue({
      data: { items: [{ productPublicId: 1, quantity: 1 }], warnings: [] },
    });
    const user = userEvent.setup();
    renderStore(authenticated);
    await screen.findByText('authenticated');

    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 2' }));
    await user.click(screen.getByRole('button', { name: 'Add product 1' }));
    await waitFor(() => expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('1'));
    rejectWishlist(new Error('Wishlist write failed'));

    await waitFor(() => expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent(''));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('1');
  });
});
