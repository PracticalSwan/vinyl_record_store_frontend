import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { StoreProvider } from '../../src/context/StoreProvider';
import { useStore } from '../../src/context/useStore';

function StoreProbe() {
  const store = useStore();
  const firstItem = store.cart.find((item) => item.id === 1);
  return (
    <>
      <output aria-label="Wishlist IDs">{store.wishlist.join(',')}</output>
      <output aria-label="Product 1 quantity">{firstItem?.qty ?? 0}</output>
      <button onClick={() => store.toggleWishlist(2)}>Toggle wishlist 2</button>
      <button onClick={() => store.removeFromWishlist(3)}>Remove wishlist 3</button>
      <button onClick={() => store.addToCart(1)}>Add product 1</button>
      <button onClick={() => store.updateQty(1, -20)}>Decrease product 1</button>
      <button onClick={() => store.removeFromCart(1)}>Remove product 1</button>
    </>
  );
}

describe('StoreProvider', () => {
  it('keeps wishlist changes unique and removable', async () => {
    const user = userEvent.setup();
    render(<StoreProvider><StoreProbe /></StoreProvider>);

    await user.click(screen.getByRole('button', { name: 'Toggle wishlist 2' }));
    await user.click(screen.getByRole('button', { name: 'Remove wishlist 3' }));
    expect(screen.getByLabelText('Wishlist IDs')).toHaveTextContent('4');
  });

  it('increments, floors, and removes cart quantities safely', async () => {
    const user = userEvent.setup();
    render(<StoreProvider><StoreProbe /></StoreProvider>);

    await user.click(screen.getByRole('button', { name: 'Add product 1' }));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: 'Decrease product 1' }));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Remove product 1' }));
    expect(screen.getByLabelText('Product 1 quantity')).toHaveTextContent('0');
  });
});
