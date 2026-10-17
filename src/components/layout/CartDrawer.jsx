import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Minus, Trash2, ShoppingCart, Gift } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.jsx';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { cartApi } from '@/features/customer/cart/services/cartApi.js';
import { getText } from '@/utils/getText.js';
import { formatEGP } from '@/utils/formatEGP.js';

export function CartDrawer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isCustomer = useAuthStore((state) => state.user?.role === 'user');

  const {
    isCartOpen,
    closeCart,
    setCartData,
    guestItems,
    updateGuestQuantity,
    removeGuestItem,
    clearGuestCart,
  } = useCartStore();

  // Fetch cart if authenticated
  const { data: backendCartData } = useQuery({
    queryKey: ['cartData'],
    queryFn: () => cartApi.getCart(),
    enabled: isCustomer && isCartOpen,
  });

  // Decide items to display: authenticated backend items vs guest items
  const items = isCustomer && backendCartData?.cartItems
    ? backendCartData.cartItems
    : guestItems;

  const getItemUnitPricePiastres = (it) => {
    if (it.price !== undefined && it.price !== null) return it.price;
    if (it.variant?.priceEGP !== undefined && it.variant?.priceEGP !== null) return it.variant.priceEGP;
    return 0;
  };

  const totalQuantity = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const subtotalPiastres = items.reduce((acc, it) => {
    return acc + (getItemUnitPricePiastres(it) * (it.quantity || 1));
  }, 0);

  // 5% loyalty points earned on subtotal (calculated in piastres)
  const earnedPointsPiastres = Math.floor((subtotalPiastres * 5) / 100);

  const handleQuantityChange = (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return;

    if (isCustomer) {
      cartApi.updateCartItem(item._id, newQty).then(() => {
        queryClient.invalidateQueries({ queryKey: ['cartData'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      });
    } else {
      updateGuestQuantity(item._id, newQty);
    }
  };

  const handleRemoveItem = (itemId) => {
    if (isCustomer) {
      cartApi.removeFromCart(itemId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['cartData'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      });
    } else {
      removeGuestItem(itemId);
    }
  };

  const handleClearCart = () => {
    if (isCustomer) {
      cartApi.clearCart().then(() => {
        setCartData(null);
        queryClient.invalidateQueries({ queryKey: ['cartData'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      });
    } else {
      clearGuestCart();
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate(ROUTE_PATHS.CHECKOUT);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 end-0 max-w-full flex">
        <div className="w-screen max-w-md bg-card border-s border-border shadow-2xl flex flex-col justify-between text-start">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-foreground">Your Shopping Bag</h3>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in bag
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center text-muted-foreground/40">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-foreground">Your bag is empty</h4>
                  <p className="text-xs text-muted-foreground max-w-[240px]">
                    Explore Mates Store matching sets and individual pieces to get started.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    closeCart();
                    navigate(ROUTE_PATHS.PRODUCTS);
                  }}
                  className="rounded-xl text-xs font-semibold"
                >
                  Shop Clothing Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const product = item.product || item.variant?.product || {};
                  const variant = item.variant || {};
                  const name = getText(product.name || product.title) || 'Clothing item';

                  const sizeCode = variant.size?.code || variant.size || item.size || null;
                  const colorObj = variant.color || item.color || null;
                  const colorName = typeof colorObj === 'object'
                    ? (getText(colorObj?.name) || colorObj?.slug || '')
                    : (colorObj || '');

                  const unitPricePiastres = getItemUnitPricePiastres(item);
                  const lineTotalPiastres = unitPricePiastres * (item.quantity || 1);
                  const image = (product.images && product.images[0]?.url) || product.imageCover || product.image;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-3.5 bg-background border border-border rounded-2xl p-3 shadow-2xs"
                    >
                      {/* Image */}
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground/40">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-xs font-bold text-foreground line-clamp-1">{name}</h4>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Size & Color Badges */}
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          {sizeCode && (
                            <span className="border border-border px-1.5 py-0.5 rounded-md bg-secondary/50">
                              Size: {sizeCode}
                            </span>
                          )}
                          {colorName && (
                            <span className="border border-border px-1.5 py-0.5 rounded-md bg-secondary/50">
                              Color: {colorName}
                            </span>
                          )}
                          {item.setId && (
                            <span className="bg-secondary text-foreground font-bold px-1.5 py-0.5 rounded-md">
                              Matching Set
                            </span>
                          )}
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col text-start">
                            <span className="text-xs font-bold text-foreground">
                              {item.quantity > 1 ? formatEGP(lineTotalPiastres) : formatEGP(unitPricePiastres)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {formatEGP(unitPricePiastres)} each
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-0.5 bg-secondary/40">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-foreground w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-card space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-bold text-foreground">{totalQuantity}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-bold">Subtotal:</span>
                  <span className="font-bold text-foreground text-base sm:text-lg">
                    {formatEGP(subtotalPiastres)}
                  </span>
                </div>

                {/* 5% Loyalty Preview */}
                {earnedPointsPiastres > 0 && (
                  <div className="bg-secondary border border-border p-2.5 rounded-xl text-[11px] text-foreground font-medium flex items-center gap-2">
                    <Gift className="w-4 h-4 shrink-0 text-foreground" />
                    <span>Earn {formatEGP(earnedPointsPiastres)} (5%) loyalty credit with this order!</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="rounded-xl text-xs font-semibold"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="flex-1 rounded-xl text-xs font-semibold py-3"
                >
                  <span>Proceed to Checkout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
