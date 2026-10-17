import { create } from 'zustand';

export const useCartStore = create((set) => ({
  isCartOpen: false,
  cartData: null,
  guestItems: [],

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setCartData: (data) => set({ cartData: data }),

  addGuestItem: ({ product, variant, quantity = 1, setId = null }) =>
    set((state) => {
      const variantId = variant?._id || variant?.id;
      const existingIndex = state.guestItems.findIndex((item) => {
        if (variantId) {
          return item.variant?._id === variantId && item.setId === setId;
        }
        return (item.product._id || item.product.id) === (product._id || product.id);
      });

      const price = variant?.priceEGP !== undefined ? variant.priceEGP : (product.price || 0);

      if (existingIndex > -1) {
        const updated = [...state.guestItems];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].totalPrice = updated[existingIndex].quantity * price;
        return { guestItems: updated };
      }

      return {
        guestItems: [
          ...state.guestItems,
          {
            _id: `guest-${Date.now()}-${Math.random()}`,
            product,
            variant,
            setId,
            quantity,
            price,
            totalPrice: quantity * price,
          },
        ],
      };
    }),

  updateGuestQuantity: (itemId, quantity) =>
    set((state) => ({
      guestItems: state.guestItems.map((item) =>
        item._id === itemId
          ? { ...item, quantity, totalPrice: quantity * item.price }
          : item
      ),
    })),

  removeGuestItem: (itemId) =>
    set((state) => ({
      guestItems: state.guestItems.filter((item) => item._id !== itemId),
    })),

  clearGuestCart: () => set({ guestItems: [] }),
}));
