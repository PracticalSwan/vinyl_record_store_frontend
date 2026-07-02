import { useState } from 'react';
import { StoreContext } from './storeContext';

export function StoreProvider({ children }) {
  const [wishlist, setWishlist] = useState([2, 3, 4]);
  const [cart, setCart] = useState([
    { id: 1, qty: 1 },
    { id: 2, qty: 1 },
  ]);

  const toggleWishlist = (id) =>
    setWishlist((previous) =>
      previous.includes(id) ? previous.filter((itemId) => itemId !== id) : [...previous, id],
    );

  const addToCart = (id) =>
    setCart((previous) => {
      const existing = previous.find((item) => item.id === id);
      if (existing) {
        return previous.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...previous, { id, qty: 1 }];
    });

  const removeFromCart = (id) =>
    setCart((previous) => previous.filter((item) => item.id !== id));

  const updateQty = (id, delta) =>
    setCart((previous) =>
      previous.map((item) => item.id === id
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item),
    );

  const removeFromWishlist = (id) =>
    setWishlist((previous) => previous.filter((itemId) => itemId !== id));

  return (
    <StoreContext.Provider value={{
      wishlist,
      cart,
      toggleWishlist,
      addToCart,
      removeFromCart,
      updateQty,
      removeFromWishlist,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
