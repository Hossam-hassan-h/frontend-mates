import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ArrowLeft, ShoppingBag, Gift, CheckCircle2, Trophy, Phone, MapPin, User as UserIcon } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { apiClient } from '@/api/apiClient.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { getText } from '@/utils/getText.js';
import { formatEGP } from '@/utils/formatEGP.js';

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isCustomer = user?.role === 'user';
  const { cartData, setCartData, guestItems, clearGuestCart } = useCartStore();

  const activeItems = (isCustomer && cartData?.cartItems?.length > 0)
    ? cartData.cartItems
    : guestItems;

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [redeemPointsEgp, setRedeemPointsEgp] = useState(0);

  // Sync user info if available
  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name || '');
      setPhone((prev) => prev || user.phone || '');
    }
  }, [user]);

  // Customer loyalty & address lookup by phone
  const cleanPhone = phone.trim();
  const { data: customerLookup, isFetching: isLookingUpCustomer } = useQuery({
    queryKey: ['customerLookup', cleanPhone],
    queryFn: async () => {
      if (!cleanPhone || cleanPhone.length < 8) return null;
      const res = await apiClient.get(`/customers/lookup?phone=${encodeURIComponent(cleanPhone)}`);
      return res.data?.data || null;
    },
    enabled: Boolean(cleanPhone && cleanPhone.length >= 8),
    staleTime: 1000 * 30,
  });

  // Autofill name and address from previous customer record if blank
  useEffect(() => {
    if (customerLookup) {
      if (!customerName && customerLookup.name) {
        setCustomerName(customerLookup.name);
      }
      if (!address && customerLookup.address) {
        setAddress(customerLookup.address);
      }
    }
  }, [customerLookup]);

  // Submit Order Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (orderPayload) => {
      const response = await apiClient.post('/orders', orderPayload);
      return response.data;
    },
    onSuccess: (resData) => {
      toast.success('Your order has been created successfully! Redirecting to WhatsApp to confirm...');
      setCartData(null);
      clearGuestCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customerLookup'] });

      if (resData.whatsappUrl) {
        setTimeout(() => {
          window.location.href = resData.whatsappUrl;
        }, 1200);
      } else {
        navigate(ROUTE_PATHS.HOME);
      }
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Failed to submit order. Please check your data and try again.';
      toast.error(errorMsg);
    },
  });

  // Calculations
  const getItemUnitPricePiastres = (it) => {
    if (it.price !== undefined && it.price !== null) return it.price;
    if (it.variant?.priceEGP !== undefined && it.variant?.priceEGP !== null) return it.variant.priceEGP;
    return 0;
  };

  const cartSubtotal = activeItems.reduce((acc, it) => {
    return acc + (getItemUnitPricePiastres(it) * (it.quantity || 1));
  }, 0);

  const availablePointsPiastres = customerLookup?.loyaltyPoints || 0;
  const maxRedeemablePiastres = Math.min(cartSubtotal, availablePointsPiastres);
  const maxRedeemableEgp = maxRedeemablePiastres / 100;
  const redeemPointsPiastres = Math.round((parseFloat(redeemPointsEgp) || 0) * 100);
  const effectiveRedeemPointsPiastres = Math.min(maxRedeemablePiastres, Math.max(0, redeemPointsPiastres));
  const effectiveRedeemPointsEgp = effectiveRedeemPointsPiastres / 100;

  const finalTotal = Math.max(0, cartSubtotal - effectiveRedeemPointsPiastres);

  // 5% loyalty rule: calculated on subtotal before points redemption
  const pointsEarnedPiastres = Math.floor((cartSubtotal * 5) / 100);

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please enter your name, phone number, and delivery address.');
      return;
    }

    if (activeItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const orderPayload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pointsToRedeem: effectiveRedeemPointsPiastres,
      items: activeItems.map((item) => ({
        product: item.product?._id || item.product?.id || item.product,
        variant: item.variant?._id || item.variant?.id || item.variant,
        quantity: item.quantity || 1,
        price: getItemUnitPricePiastres(item),
        setId: item.setId || undefined,
      })),
    };

    checkoutMutation.mutate(orderPayload);
  };

  if (activeItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <div className="w-20 h-20 bg-secondary rounded-3xl mx-auto flex items-center justify-center text-muted-foreground/40">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-xl font-bold">Your Cart is Empty</h2>
        <p className="text-xs text-muted-foreground">Add products to your cart before proceeding to checkout.</p>
        <Link to={ROUTE_PATHS.PRODUCTS}>
          <Button className="rounded-xl text-xs font-semibold px-6">Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 px-4 text-start">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Confirm your details to finalize your order and connect via WhatsApp.
          </p>
        </div>
        <Link to={ROUTE_PATHS.PRODUCTS} className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Customer Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmitOrder} className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <h3 className="font-serif text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-foreground" />
              <span>Customer & Delivery Information</span>
            </h3>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="customerName" className="text-xs font-semibold text-muted-foreground block">
                Full Name: <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="customerName"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-11 ps-10 pe-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground block">
                Phone Number (WhatsApp): <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="e.g. 01000000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 ps-10 pe-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all"
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Your phone number is your loyalty identifier to collect 5% cashback on every order.
              </p>
            </div>

            {/* Loyalty Lookup Badge */}
            {customerLookup ? (
              <div className="p-3.5 rounded-2xl bg-secondary border border-border flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-foreground shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-foreground block">
                    Welcome back, {customerLookup.name}!
                  </span>
                  <span className="text-muted-foreground">
                    Available loyalty balance: <strong className="text-foreground font-bold">{formatEGP(availablePointsPiastres)}</strong> ({availablePointsPiastres} piastres).
                  </span>
                </div>
              </div>
            ) : cleanPhone.length >= 8 && !isLookingUpCustomer ? (
              <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4 text-foreground shrink-0" />
                <span>New customer! You will earn 5% loyalty cashback immediately upon order confirmation.</span>
              </div>
            ) : null}

            {/* Address Details */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-semibold text-muted-foreground block">
                Delivery Address: <span className="text-destructive">*</span>
              </label>
              <textarea
                id="address"
                required
                placeholder="City, area, street, building and apartment number..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
                className="w-full p-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all resize-none"
              />
            </div>

            {/* Loyalty Points Redemption Section */}
            <div className="border-t border-border pt-6 space-y-4">
              <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-foreground" />
                <span>Loyalty Points Redemption</span>
              </h4>

              {availablePointsPiastres > 0 ? (
                <div className="space-y-3 bg-secondary/30 p-4 rounded-2xl border border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Available points balance:</span>
                    <span className="font-bold text-foreground">{formatEGP(availablePointsPiastres)}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full space-y-1.5">
                      <label htmlFor="redeemPoints" className="text-xs font-semibold text-muted-foreground block">
                        Redeem Amount (EGP):
                      </label>
                      <input
                        id="redeemPoints"
                        type="number"
                        min="0"
                        step="0.5"
                        max={maxRedeemableEgp}
                        value={effectiveRedeemPointsEgp || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setRedeemPointsEgp(Math.min(maxRedeemableEgp, Math.max(0, val)));
                        }}
                        placeholder="0.00"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRedeemPointsEgp(maxRedeemableEgp)}
                      className="shrink-0 text-xs font-semibold h-11 px-4 rounded-xl"
                    >
                      Redeem Max ({formatEGP(maxRedeemablePiastres)})
                    </Button>
                  </div>

                  {effectiveRedeemPointsPiastres > 0 && (
                    <div className="bg-card border border-border rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="text-foreground font-bold">Applied Points Discount:</span>
                      <span className="text-foreground font-bold text-sm">
                        -{formatEGP(effectiveRedeemPointsPiastres)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl font-medium">
                  {cleanPhone.length >= 8
                    ? 'No points balance yet. Earn 5% loyalty credit on this order!'
                    : 'Enter your phone number above to check available loyalty balance.'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={checkoutMutation.isPending}
              className="w-full rounded-xl py-6 font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              {checkoutMutation.isPending ? 'Preparing order...' : 'Confirm Order & Send to WhatsApp'}
            </Button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Order Summary ({activeItems.length})</span>
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pe-1">
              {activeItems.map((item, idx) => {
                const product = item.product || {};
                const name = getText(product.name || product.title) || 'Clothing piece';
                const size = item.variant?.size?.code || item.variant?.size || '';
                const color = getText(item.variant?.color?.name) || '';
                const unitPrice = getItemUnitPricePiastres(item);
                const itemTotal = unitPrice * (item.quantity || 1);

                return (
                  <div key={item._id || idx} className="flex justify-between items-start gap-2 text-xs py-2 border-b border-border/50 last:border-none">
                    <div className="space-y-0.5">
                      <span className="font-serif text-foreground font-bold line-clamp-1">
                        {name} {item.setId ? '(Matching Set)' : ''}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {size && <span className="bg-secondary px-1.5 py-0.5 rounded-md">Size: {size}</span>}
                        {color && <span className="bg-secondary px-1.5 py-0.5 rounded-md">Color: {color}</span>}
                        <span>x{item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-foreground font-bold shrink-0">
                      {formatEGP(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-border pt-4 space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="text-foreground">{formatEGP(cartSubtotal)}</span>
              </div>

              {effectiveRedeemPointsPiastres > 0 && (
                <div className="flex justify-between text-foreground font-bold">
                  <span>Loyalty Discount:</span>
                  <span>-{formatEGP(effectiveRedeemPointsPiastres)}</span>
                </div>
              )}

              <div className="border-t border-border pt-3 flex justify-between text-base font-bold text-foreground">
                <span>Total Due:</span>
                <span className="text-lg">{formatEGP(finalTotal)}</span>
              </div>
            </div>

            {/* Dynamic loyalty rewards notification (5% rule) */}
            <div className="bg-secondary border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-card rounded-xl text-foreground shrink-0 border border-border">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-[11px] text-foreground font-bold block">
                  5% Loyalty Cashback:
                </span>
                <span className="text-foreground font-bold text-sm block">
                  +{formatEGP(pointsEarnedPiastres)} ({pointsEarnedPiastres} piastres)
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Calculated on subtotal and added to your balance upon order confirmation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
