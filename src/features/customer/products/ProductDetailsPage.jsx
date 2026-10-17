import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Star, ShoppingCart, Plus, Minus, Heart, Gift, Package } from 'lucide-react';
import { useProductDetails, useProductReviews, useCreateReview, useDeleteReview } from '@/features/products/hooks/useProducts.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useAddToCart } from '@/features/customer/cart/hooks/useCart.js';
import { toast } from 'sonner';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/feedback/Skeleton.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import { apiClient } from '@/api/apiClient.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Seo, getSiteUrl } from '@/components/common/Seo.jsx';
import { getText } from '@/utils/getText.js';

export function ProductDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewIdToDelete, setReviewIdToDelete] = useState(null);

  // Fetch product details
  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProduct,
  } = useProductDetails(id);

  // Fetch reviews
  const {
    data: reviews = [],
    refetch: refetchReviews,
  } = useProductReviews(id);

  // Active variants
  const variants = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    return product.variants.filter((v) => v.isActive !== false);
  }, [product]);

  // Unique sizes & colors available
  const availableSizes = useMemo(() => {
    const sizeMap = new Map();
    variants.forEach((v) => {
      const s = v.size;
      if (s && s.code) {
        sizeMap.set(s.code, s);
      }
    });
    return Array.from(sizeMap.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [variants]);

  const availableColors = useMemo(() => {
    const colorMap = new Map();
    variants.forEach((v) => {
      const c = v.color;
      if (c && c.slug) {
        colorMap.set(c.slug, c);
      }
    });
    return Array.from(colorMap.values());
  }, [variants]);

  // Automatically select first size and color if not chosen yet
  useMemo(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].code);
    }
    if (!selectedColor && availableColors.length > 0) {
      setSelectedColor(availableColors[0].slug);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor]);

  // Find currently active variant matching BOTH selectedSize and selectedColor
  const activeVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return variants.find(
      (v) => (v.size?.code === selectedSize) && (v.color?.slug === selectedColor)
    ) || null;
  }, [variants, selectedSize, selectedColor]);

  // Pricing
  const priceEgp = activeVariant
    ? (activeVariant.priceEGP / 100)
    : (product?.price || 0);

  const compareAtEgp = activeVariant?.compareAtPrice
    ? (activeVariant.compareAtPrice / 100)
    : (product?.originalPrice || null);

  const hasDiscount = compareAtEgp && compareAtEgp > priceEgp;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtEgp - priceEgp) / compareAtEgp) * 100)
    : 0;

  // 5% loyalty points (floor to nearest piastre)
  const pointsEarnedPiastres = Math.floor(Math.round(priceEgp * 100) * 5 / 100);
  const pointsEarnedEgp = (pointsEarnedPiastres / 100).toFixed(2);

  const stockAvailable = activeVariant ? activeVariant.stockQuantity : (product?.quantity || 0);
  const isAvailable = stockAvailable > 0;

  // Product Images
  const galleryImages = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.map((img) => img.url);
    }
    if (product?.imageCover || product?.image) {
      return [product.imageCover || product.image];
    }
    return [];
  }, [product]);

  // Wishlist
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await apiClient.get('/wishlist');
      return response.data?.data?.map((p) => p._id || p) || [];
    },
    enabled: isAuthenticated,
  });

  const isFavorite = wishlist.includes(id);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiClient.delete(`/wishlist/${id}`);
      }
      return apiClient.post('/wishlist', { productId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(isFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'فشل تعديل المفضلة');
    },
  });

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة');
      return;
    }
    toggleWishlistMutation.mutate();
  };

  // Add to cart
  const addToCartMutation = useAddToCart();

  const handleAddToCart = () => {
    if (!product) return;
    if (variants.length > 0 && !activeVariant) {
      toast.warning('يرجى تحديد مقاس ولون متوفرين');
      return;
    }
    if (stockAvailable < quantity) {
      toast.warning(`الكمية المتوفرة حالياً هي ${stockAvailable} فقط`);
      return;
    }

    addToCartMutation.mutate({
      product,
      variant: activeVariant,
      quantity,
    });
  };

  // Reviews
  const createReviewMutation = useCreateReview();
  const deleteReviewMutation = useDeleteReview();

  const handleConfirmDelete = () => {
    if (!reviewIdToDelete) return;
    deleteReviewMutation.mutate(
      { productId: id, reviewId: reviewIdToDelete },
      { onSettled: () => setReviewIdToDelete(null) }
    );
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewTitle.trim()) {
      toast.warning('يرجى كتابة نص المراجعة');
      return;
    }
    createReviewMutation.mutate(
      { productId: id, ratings: reviewRating, title: reviewTitle.trim() },
      {
        onSuccess: () => {
          setReviewTitle('');
          refetchReviews();
        },
      }
    );
  };

  if (isProductLoading) {
    return (
      <div className="py-8 space-y-8 animate-pulse dir-rtl">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="py-12">
        <ErrorState
          title="لم نتمكن من العثور على المنتج"
          description="قد يكون تم حذف المنتج أو نقل رابطه"
          onRetry={refetchProduct}
        />
      </div>
    );
  }

  const productName = getText(product.name || product.title);
  const productDescription = getText(product.description);

  return (
    <div className="space-y-12 py-6 animate-fade-in dir-rtl text-start">
      <Seo
        title={`${productName} | Mates Store`}
        description={productDescription || 'تسوق أزياء Mates Store الأنيقة للأفراد والأزواج'}
        image={galleryImages[0] || '/favicon.svg'}
        url={getSiteUrl(`/products/${id}`)}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to={ROUTE_PATHS.HOME} className="hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        <Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-primary transition-colors">
          الملابس
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{productName}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left (Image Gallery) */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-border/60 bg-secondary/20 shadow-sm">
            {galleryImages[activeImageIndex] ? (
              <img
                src={galleryImages[activeImageIndex]}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                <Package className="h-20 w-20" />
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 start-4 z-10 w-10 h-10 rounded-full bg-white/95 dark:bg-card/95 shadow-md flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
              aria-label="المفضلة"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>

            {hasDiscount && (
              <span className="absolute top-4 end-4 z-10 bg-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                خصم {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right (Product Info, Variant Selectors, Pricing) */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Mates Store • {product.gender === 'men' ? 'رجالي' : (product.gender === 'women' ? 'نسائي' : 'للجنسين')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">{productName}</h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-sm font-bold text-foreground ms-1">
                  {(product.ratingsAverage || 4.5).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({reviews.length} تقييمات من العملاء)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {priceEgp.toFixed(2)} ج.م
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through font-semibold">
                  {compareAtEgp.toFixed(2)} ج.م
                </span>
              )}
            </div>

            {pointsEarnedEgp > 0 && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <Gift className="w-3.5 h-3.5" />
                <span>تكسب {pointsEarnedEgp} ج.م رصيد نقاط ولاء (5%) عند شراء هذه القطعة!</span>
              </p>
            )}
          </div>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-foreground flex justify-between items-center">
                <span>المقاس:</span>
                <span className="text-muted-foreground text-[11px] font-bold">{selectedSize || 'اختر المقاس'}</span>
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {availableSizes.map((sz) => (
                  <button
                    key={sz.code}
                    onClick={() => setSelectedSize(sz.code)}
                    className={`h-11 min-w-[50px] px-3.5 rounded-xl border text-xs font-black transition-all ${
                      selectedSize === sz.code
                        ? 'border-primary bg-primary text-white shadow-sm scale-105'
                        : 'border-border/80 bg-card hover:bg-secondary/40 text-foreground'
                    }`}
                  >
                    {sz.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-foreground flex justify-between items-center">
                <span>اللون:</span>
                <span className="text-muted-foreground text-[11px] font-bold">
                  {getText(availableColors.find((c) => c.slug === selectedColor)?.name) || selectedColor}
                </span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {availableColors.map((col) => {
                  const isSelected = selectedColor === col.slug;
                  return (
                    <button
                      key={col.slug}
                      onClick={() => setSelectedColor(col.slug)}
                      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : 'border-border/80 bg-card hover:bg-secondary/40'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs font-bold text-foreground">
                        {getText(col.name)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Availability */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className={isAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}>
              {isAvailable
                ? `متوفر في المخزون (${stockAvailable} قطعة متبقية)`
                : 'غير متوفر بهذا المقاس واللون حالياً'}
            </span>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-border/80 rounded-2xl bg-card p-1 shadow-xs">
              <button
                onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-40"
                aria-label="إنقاص"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-black text-sm text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => (q < stockAvailable ? q + 1 : q))}
                disabled={!isAvailable || quantity >= stockAvailable}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-40"
                aria-label="زيادة"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!isAvailable || addToCartMutation.isPending}
              className="flex-1 h-12 rounded-2xl font-semibold text-sm shadow-xs gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
            </Button>
          </div>

          {/* Description */}
          {productDescription && (
            <div className="border-t border-border/60 pt-5 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                وصف المنتج
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {productDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-border/60 pt-10 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground">آراء وتقييمات العملاء ({reviews.length})</h2>
        </div>

        {/* Leave Review Form */}
        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="bg-card border border-border/60 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-foreground">شارك رأيك في هذا المنتج</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">التقييم:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setReviewRating(st)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        st <= reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              required
              rows={3}
              placeholder="اكتب تقييمك وتجربتك مع المقاس والجودة..."
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full p-3 rounded-2xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="bg-primary text-white rounded-xl text-xs font-bold"
            >
              نشر التقييم
            </Button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {rev.user?.name || 'عميل'}
                </span>
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold text-foreground ms-1">{rev.ratings}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{rev.title}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              كن أول من يقيم هذا المنتج!
            </p>
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={Boolean(reviewIdToDelete)}
        title="حذف المراجعة"
        message="هل أنت متأكد من حذف هذه المراجعة؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => setReviewIdToDelete(null)}
      />
    </div>
  );
}

export default ProductDetailsPage;
