import { createContext, useContext, useState } from 'react';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [wishlist, setWishlist] = useState([2, 3, 4]);   // ids
  const [cart, setCart] = useState([
    { id: 1, qty: 1 },
    { id: 2, qty: 1 },
  ]);

  const toggleWishlist = (id) =>
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const addToCart = (id) =>
    setCart(prev => {
      const existing = prev.find(x => x.id === id);
      if (existing) return prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { id, qty: 1 }];
    });

  const removeFromCart = (id) =>
    setCart(prev => prev.filter(x => x.id !== id));

  const updateQty = (id, delta) =>
    setCart(prev =>
      prev.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x)
    );

  const removeFromWishlist = (id) =>
    setWishlist(prev => prev.filter(x => x !== id));

  return (
    <StoreContext.Provider value={{
      wishlist, cart,
      toggleWishlist, addToCart, removeFromCart, updateQty, removeFromWishlist,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
