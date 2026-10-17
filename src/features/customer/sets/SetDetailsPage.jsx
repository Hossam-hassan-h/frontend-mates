import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Users, Gift, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { Button } from '@/components/ui/button.jsx';
import { useAddToCart } from '@/features/customer/cart/hooks/useCart.js';
import { useCartStore } from '@/store/useCartStore.js';
import { toast } from 'sonner';
import { getText } from '@/utils/getText.js';

export function SetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();
  const openCart = useCartStore((state) => state.openCart);

  // 1. Fetch Set Details
  const { data: set, isLoading, isError } = useQuery({
    queryKey: ['setDetails', id],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.SETS.DETAILS(id));
      return res.data?.data;
    },
    enabled: Boolean(id),
  });

  const piece1InitialVariant = set?.items?.[0] || null;
  const piece2InitialVariant = set?.items?.[1] || null;

  const piece1ProductId = piece1InitialVariant?.product?._id || piece1InitialVariant?.product;
  const piece2ProductId = piece2InitialVariant?.product?._id || piece2InitialVariant?.product;

  // 2. Fetch variants for Piece 1 Product
  const { data: p1Variants = [] } = useQuery({
    queryKey: ['productVariants', piece1ProductId],
    queryFn: async () => {
      if (!piece1ProductId) return [];
      const res = await apiClient.get(API_ENDPOINTS.VARIANTS.BY_PRODUCT(piece1ProductId));
      return res.data?.data || [];
    },
    enabled: Boolean(piece1ProductId),
  });

  // 3. Fetch variants for Piece 2 Product
  const { data: p2Variants = [] } = useQuery({
    queryKey: ['productVariants', piece2ProductId],
    queryFn: async () => {
      if (!piece2ProductId) return [];
      const res = await apiClient.get(API_ENDPOINTS.VARIANTS.BY_PRODUCT(piece2ProductId));
      return res.data?.data || [];
    },
    enabled: Boolean(piece2ProductId),
  });

  // Selected Variants for each person
  const [selectedVariant1, setSelectedVariant1] = useState(null);
  const [selectedVariant2, setSelectedVariant2] = useState(null);

  useEffect(() => {
    if (piece1InitialVariant && !selectedVariant1) {
      setSelectedVariant1(piece1InitialVariant);
    }
  }, [piece1InitialVariant, selectedVariant1]);

  useEffect(() => {
    if (piece2InitialVariant && !selectedVariant2) {
      setSelectedVariant2(piece2InitialVariant);
    }
  }, [piece2InitialVariant, selectedVariant2]);

  if (isLoading) {
    return (
      <div className="py-16 text-center max-w-4xl mx-auto px-4 dir-rtl">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted/60 rounded-xl w-1/2 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-64 bg-muted/40 rounded-3xl" />
            <div className="h-64 bg-muted/40 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !set) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto px-4 dir-rtl space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">تعذر العثور على الطقم المطلوب</h2>
        <Button onClick={() => navigate(ROUTE_PATHS.SETS)} variant="outline" className="rounded-xl">
          العودة للأطقم
        </Button>
      </div>
    );
  }

  const setName = getText(set.name) || 'Matching Set';
  const setDesc = getText(set.description) || '';

  // Pricing: bundlePrice overrides or sum of variants
  const activePrice1Egp = (selectedVariant1?.priceEGP || 0) / 100;
  const activePrice2Egp = (selectedVariant2?.priceEGP || 0) / 100;
  const bundlePriceEgp = set.bundlePrice
    ? set.bundlePrice / 100
    : activePrice1Egp + activePrice2Egp;

  // 5% Loyalty points earned on bundle
  const pointsEarnedEgp = Math.floor(bundlePriceEgp * 5) / 100;

  // Stock is the minimum of both selected variants
  const stock1 = selectedVariant1?.stockQuantity || 0;
  const stock2 = selectedVariant2?.stockQuantity || 0;
  const bundleStock = Math.min(stock1, stock2);
  const isOutOfStock = bundleStock < 1;

  // Handler to add the set into cart (both component variants linked to setId)
  const handleAddSetToCart = async () => {
    if (!selectedVariant1 || !selectedVariant2) {
      toast.error('يرجى تحديد المقاس واللون لكلتا القطعتين في الطقم');
      return;
    }

    if (stock1 < 1) {
      toast.error(`نعتذر، القطعة الأولى (${selectedVariant1.size?.code || ''}) غير متوفرة حالياً`);
      return;
    }
    if (stock2 < 1) {
      toast.error(`نعتذر، القطعة الثانية (${selectedVariant2.size?.code || ''}) غير متوفرة حالياً`);
      return;
    }

    try {
      // Add first item
      await addToCartMutation.mutateAsync({
        product: selectedVariant1.product || { name: `${setName} - Piece 1` },
        variant: selectedVariant1,
        quantity: 1,
        setId: set._id,
      });

      // Add second item
      await addToCartMutation.mutateAsync({
        product: selectedVariant2.product || { name: `${setName} - Piece 2` },
        variant: selectedVariant2,
        quantity: 1,
        setId: set._id,
      });

      toast.success('تمت إضافة طقم الكابلز إلى سلة التسوق بنجاح ✨');
      openCart();
    } catch {
      toast.error('حدث خطأ أثناء إضافة الطقم إلى السلة');
    }
  };

  // Helper renderer for each piece's variant selector
  const renderPieceConfig = (pieceNumber, initialVariant, variantsList, selectedVariant, setSelectedVariant) => {
    const product = initialVariant?.product || {};
    const effectiveVariants = variantsList.length > 0 ? variantsList : [initialVariant].filter(Boolean);

    // Group available sizes and colors
    const availableSizes = Array.from(
      new Set(effectiveVariants.map((v) => v.size?.code).filter(Boolean))
    );

    return (
      <div className="bg-card rounded-3xl border border-border/60 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
              {pieceNumber}
            </span>
            <h3 className="font-extrabold text-foreground text-sm">
              القطعة {pieceNumber === 1 ? 'الأولى (Person 1)' : 'الثانية (Person 2)'}
            </h3>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {getText(product.name) || 'Clothing piece'}
          </span>
        </div>

        {/* Variant selection: Size pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground block">
            اختر المقاس: <strong className="text-foreground">{selectedVariant?.size?.code || 'لم يحدد'}</strong>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((code) => {
              const variantMatch = effectiveVariants.find(
                (v) => v.size?.code === code && (!selectedVariant?.color || v.color?._id === selectedVariant?.color?._id)
              ) || effectiveVariants.find((v) => v.size?.code === code);

              const isSelected = selectedVariant?.size?.code === code;
              const isAvailable = (variantMatch?.stockQuantity || 0) > 0;

              return (
                <button
                  key={code}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => variantMatch && setSelectedVariant(variantMatch)}
                  className={`min-w-11 h-10 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : isAvailable
                      ? 'border-border/60 bg-secondary/30 hover:border-primary/50 text-foreground'
                      : 'border-border/30 bg-muted/20 text-muted-foreground line-through opacity-40 cursor-not-allowed'
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Variant selection: Color selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground block">
            اختر اللون: <strong className="text-foreground">{getText(selectedVariant?.color?.name) || 'لم يحدد'}</strong>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {effectiveVariants.map((v) => {
              const hex = v.color?.hex || '#111827';
              const isSelected = selectedVariant?._id === v._id;
              const hasStock = v.stockQuantity > 0;

              return (
                <button
                  key={v._id}
                  type="button"
                  disabled={!hasStock}
                  onClick={() => setSelectedVariant(v)}
                  title={`${getText(v.color?.name)} (متاح: ${v.stockQuantity})`}
                  className={`w-9 h-9 rounded-full border-2 transition-all relative flex items-center justify-center cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2 border-white' : 'border-border/60'
                  } ${!hasStock ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && (
                    <Check className={`w-4 h-4 ${hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected piece stock feedback */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">حالة توفر القطعة:</span>
          {(selectedVariant?.stockQuantity || 0) > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              متوفر ({selectedVariant.stockQuantity} قطعة)
            </span>
          ) : (
            <span className="text-destructive font-bold">نفد من المخزن</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-6 dir-rtl text-start max-w-6xl mx-auto px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <Link to={ROUTE_PATHS.HOME} className="hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        <Link to={ROUTE_PATHS.SETS} className="hover:text-primary transition-colors">
          أطقم الكابلز
        </Link>
        <span>/</span>
        <span className="text-foreground">{setName}</span>
      </div>

      {/* Main Set Header */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matching Set</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">{setName}</h1>
          </div>

          <div className="text-start sm:text-end">
            <span className="text-xs text-muted-foreground block font-bold">سعر الطقم بالكامل:</span>
            <span className="text-3xl font-black text-primary">{bundlePriceEgp.toFixed(2)} ج.م</span>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-black">
              <Gift className="w-3.5 h-3.5" />
              <span>+{pointsEarnedEgp.toFixed(2)} ج.م نقاط ولاء 5%</span>
            </div>
          </div>
        </div>

        {setDesc && <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">{setDesc}</p>}
      </div>

      {/* The Two Pieces Customization Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>تخصيص مقاس ولون كل شخص على حدة</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          اختر المقاس واللون لكل شخص بشكل مستقل. يُحسم المخزون مباشرة من القطعتين الأصليتين بدون تكرار.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderPieceConfig(1, piece1InitialVariant, p1Variants, selectedVariant1, setSelectedVariant1)}
          {renderPieceConfig(2, piece2InitialVariant, p2Variants, selectedVariant2, setSelectedVariant2)}
        </div>
      </div>

      {/* Action Strip */}
      <div className="bg-card rounded-3xl border border-border/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-start">
          <span className="text-xs text-muted-foreground font-bold block">جاهز للطلب؟</span>
          <div className="text-sm font-extrabold text-foreground">
            {isOutOfStock ? (
              <span className="text-destructive">أحد مقاسات الطقم غير متوفر حالياً بالمخزن</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">
                الطقم متوفر بالمخزن ({bundleStock} أطقم متاحة)
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handleAddSetToCart}
          disabled={isOutOfStock || addToCartMutation.isPending}
          className="w-full sm:w-auto px-8 py-6 rounded-2xl font-semibold text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{addToCartMutation.isPending ? 'Adding to bag...' : 'Add Set to Cart'}</span>
        </Button>
      </div>
    </div>
  );
}

export default SetDetailsPage;
