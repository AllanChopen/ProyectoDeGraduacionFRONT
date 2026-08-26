import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const MERCH_CART_STORAGE_KEY = 'lito_merch_cart_v1';
const TICKET_CART_STORAGE_KEY = 'lito_ticket_cart_v1';
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [merchItems, setMerchItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem(MERCH_CART_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  const [ticketItems, setTicketItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem(TICKET_CART_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(MERCH_CART_STORAGE_KEY, JSON.stringify(merchItems));
  }, [merchItems]);

  useEffect(() => {
    localStorage.setItem(TICKET_CART_STORAGE_KEY, JSON.stringify(ticketItems));
  }, [ticketItems]);

  const addMerchItem = ({ productId, name, variantId, variantLabel, unitPrice, quantity = 1 }) => {
    setMerchItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.productId === productId && item.variantId === variantId
      );

      if (existingIndex === -1) {
        return [
          ...currentItems,
          {
            productId,
            name,
            variantId,
            variantLabel,
            unitPrice,
            quantity
          }
        ];
      }

      return currentItems.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    });
  };

  const addTicketItem = ({ showId, name, variantId, variantLabel, unitPrice, quantity = 1 }) => {
    setTicketItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.showId === showId && item.variantId === variantId
      );

      if (existingIndex === -1) {
        return [
          ...currentItems,
          {
            showId,
            name,
            variantId,
            variantLabel,
            unitPrice,
            quantity
          }
        ];
      }

      return currentItems.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    });
  };

  const updateMerchQuantity = (productId, variantId, quantity) => {
    setMerchItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateTicketQuantity = (showId, variantId, quantity) => {
    setTicketItems((currentItems) =>
      currentItems
        .map((item) =>
          item.showId === showId && item.variantId === variantId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeMerchItem = (productId, variantId) => {
    setMerchItems((currentItems) =>
      currentItems.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const removeTicketItem = (showId, variantId) => {
    setTicketItems((currentItems) =>
      currentItems.filter((item) => !(item.showId === showId && item.variantId === variantId))
    );
  };

  const clearMerchCart = () => setMerchItems([]);
  const clearTicketCart = () => setTicketItems([]);

  const merchTotalItems = useMemo(
    () => merchItems.reduce((total, item) => total + item.quantity, 0),
    [merchItems]
  );

  const ticketTotalItems = useMemo(
    () => ticketItems.reduce((total, item) => total + item.quantity, 0),
    [ticketItems]
  );

  const merchSubtotal = useMemo(
    () => merchItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [merchItems]
  );

  const ticketSubtotal = useMemo(
    () => ticketItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [ticketItems]
  );

  const value = useMemo(
    () => ({
      merchItems,
      ticketItems,
      addMerchItem,
      addTicketItem,
      updateMerchQuantity,
      updateTicketQuantity,
      removeMerchItem,
      removeTicketItem,
      clearMerchCart,
      clearTicketCart,
      merchTotalItems,
      ticketTotalItems,
      merchSubtotal,
      ticketSubtotal
    }),
    [
      merchItems,
      ticketItems,
      merchTotalItems,
      ticketTotalItems,
      merchSubtotal,
      ticketSubtotal
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
