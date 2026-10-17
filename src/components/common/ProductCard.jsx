import { useState } from 'react';
import { Heart, Star, ShoppingCart, Plus, Minus, Gift, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist, useToggleWishlist } from '@/features/customer/wishlist/hooks/useWishlist.js';
import { useAddToCart } from '@/features/customer/cart/hooks/useCart.js';
import { getText } from '@/utils/getText.js';

export function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);

  const { data: wishlist = [] } = useWishlist();
  const toggleWishlistMutation = useToggleWishlist();
  const addToCartMutation = useAddToCart();

  if (!product) return null;

  const id = product._id || product.id;
  const name = getText(product.name || product.title);

  // Determine price from variants or legacy price in EGP
  let displayPrice = 0;
  let originalPrice = null;
  let hasDiscount = false;
  let defaultVariant = null;

  if (product.variants && product.variants.length > 0) {
    const activeVariants = product.variants.filter((v) => v.isActive !== false);
    const sorted = [...activeVariants].sort((a, b) => a.priceEGP - b.priceEGP);
    defaultVariant = sorted[0];

    if (defaultVariant) {
      displayPrice = defaultVariant.priceEGP / 100;
      if (defaultVariant.compareAtPrice && defaultVariant.compareAtPrice > defaultVariant.priceEGP) {
        originalPrice = defaultVariant.compareAtPrice / 100;
        hasDiscount = true;
      }
    }
  } else if (product.price !== undefined) {
    displayPrice = Number(product.price);
    if (product.originalPrice && product.originalPrice > displayPrice) {
      originalPrice = Number(product.originalPrice);
      hasDiscount = true;
    }
  }

  const rating = product.ratingsAverage ?? product.rating ?? 4.5;
  const reviewsCount = product.ratingsQuantity ?? product.reviewsCount ?? 0;
  // 5% loyalty points in EGP (floor to nearest piastre)
  const pointsEarnedPiastres = Math.floor(Math.round(displayPrice * 100) * 5 / 100);
  const pointsEarnedEgp = (pointsEarnedPiastres / 100).toFixed(2);

  const discountPercentage = hasDiscount && originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const badge = hasDiscount && discountPercentage > 0 ? `${discountPercentage}% OFF` : null;

  const image = (product.images && product.images.length > 0)
    ? (product.images.find((img) => img.isCover)?.url || product.images[0].url)
    : (product.imageCover || product.image);

  const isFavorite = wishlist.some((item) => (item._id || item.id || item) === id);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistMutation.mutate({ productId: id, isFavorite });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate({
      product,
      variant: defaultVariant,
      quantity,
    });
  };

  // Distinct sizes available
  const availableSizes = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size?.code || v.size).filter(Boolean)))
    : [];

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full text-start">
      {/* Product Image Link */}
      <Link to={`/products/${id}`} className="block relative overflow-hidden bg-secondary/30 aspect-square">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <Package className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={toggleWishlistMutation.isPending}
          aria-label="Add to wishlist"
          className="absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-card/90 border border-border shadow-2xs flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-foreground text-foreground' : ''
            }`}
          />
        </button>

        {/* Tag / Badge */}
        {badge && (
          <span className="absolute top-2.5 start-2.5 z-10 bg-primary text-primary-foreground text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
            {badge}
          </span>
        )}
      </Link>

      {/* Product Info & Actions Area */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-start">
        {/* Title & Rating */}
        <div className="space-y-1">
          <Link to={`/products/${id}`}>
            <h3 className="font-serif text-sm sm:text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-0.5 font-bold text-foreground">
              <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
              {rating.toFixed(1)}
            </span>
            <span>({reviewsCount})</span>
          </div>

          {/* Sizes preview */}
          {availableSizes.length > 0 && (
            <div className="flex items-center gap-1 pt-1 flex-wrap">
              {availableSizes.slice(0, 4).map((s) => (
                <span key={s} className="text-[10px] font-medium border border-border px-1.5 py-0.5 rounded-md bg-secondary/60 text-muted-foreground">
                  {s}
                </span>
              ))}
              {availableSizes.length > 4 && (
                <span className="text-[10px] text-muted-foreground font-semibold">+{availableSizes.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Price & Currency */}
        <div className="space-y-0.5 text-start">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-foreground">
              EGP {displayPrice?.toFixed(2)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-xs text-muted-foreground line-through font-medium">
                EGP {originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Points Earned Subtext */}
          {pointsEarnedEgp > 0 && (
            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 pt-0.5">
              <Gift className="w-3 h-3 text-foreground" />
              <span>Earn EGP {pointsEarnedEgp} loyalty credit (5%)</span>
            </p>
          )}
        </div>

        {/* Quantity Controls & Add to Cart */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between border border-border rounded-xl px-2 py-1 bg-secondary/40 text-xs font-semibold">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center text-foreground font-bold text-xs">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-xs shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
