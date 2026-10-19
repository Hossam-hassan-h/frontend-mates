import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ROUTE_PATHS } from "@/app/router/routePaths.js";
import { ProductCard } from "@/components/common/ProductCard.jsx";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton.jsx";
import { Skeleton } from "@/components/feedback/Skeleton.jsx";
import { EmptyState } from "@/components/feedback/EmptyState.jsx";
import { ErrorState } from "@/components/feedback/ErrorState.jsx";
import {
  useFeaturedProducts,
  useBestSellers,
  useCategories,
} from "@/features/products/hooks/useProducts.js";
import { useBanners } from "@/features/banners/hooks/useBanners.js";
import { apiClient } from "@/api/apiClient.js";
import { API_ENDPOINTS } from "@/api/apiEndpoints.js";
import { getText } from "@/utils/getText.js";

function ProductCollection({ products, isLoading, isError, onRetry, limit }) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        role="status"
        aria-label="Loading products"
      >
        {[...Array(limit)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load products"
        message="An error occurred while fetching products from the server."
        onRetry={onRetry}
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Products will appear here once added to the catalog."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {products.slice(0, limit).map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
}

export function HomePage() {
  const {
    data: featuredProducts = [],
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    refetch: refetchFeatured,
  } = useFeaturedProducts();

  const {
    data: bestSellers = [],
    isLoading: isBestSellersLoading,
    isError: isBestSellersError,
    refetch: refetchBestSellers,
  } = useBestSellers();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const displayedCategories = useMemo(() => categories.slice(0, 6), [categories]);

  // Real sets data for Couples Bundle section
  const { data: sets = [] } = useQuery({
    queryKey: ["setsList"],
    queryFn: async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.SETS.LIST);
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const featuredBundle = useMemo(() => {
    return sets.length > 0 ? sets[0] : null;
  }, [sets]);

  const { data: bannersData } = useBanners();
  const heroBanner = useMemo(() => {
    return (
      bannersData?.heroBanner ||
      (Array.isArray(bannersData?.data) ? bannersData.data[0] : bannersData?.data) ||
      bannersData?.banners?.[0] ||
      null
    );
  }, [bannersData]);

  const heroImageSrc =
    heroBanner?.isActive !== false && heroBanner?.image
      ? heroBanner.image
      : "/Minimalist Mates Fashion Hero.png";

  return (
    <div className="pb-12">
      {/* PART 1: Full-Bleed Hero Section with Real Image */}
      <section
        className="relative w-full min-h-[clamp(440px,75vh,640px)] sm:min-h-[clamp(480px,80vh,760px)] lg:min-h-[clamp(500px,85vh,880px)] overflow-hidden bg-card flex items-center"
        dir="ltr"
      >
        {/* Real Hero Image */}
        <div className="absolute inset-0 z-0 bg-card overflow-hidden">
          <img
            src={heroImageSrc}
            alt="Mates Store matching outfits"
            width={1536}
            height={1024}
            className="h-full w-full object-cover object-[65%_top] sm:object-top"
          />
        </div>

        {/* Semi-transparent black gradient overlay using theme variable (50-60% opacity) */}
        <div
          className="absolute inset-0 z-10 bg-hero-overlay transition-colors"
          style={{ background: "var(--hero-overlay)" }}
          aria-hidden="true"
        />

        {/* Hero Content Overlay (z-20) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-12 sm:py-16 flex flex-col justify-center items-start text-left">
          <div className="max-w-[90%] sm:max-w-xl lg:max-w-2xl space-y-5 sm:space-y-6">
            <h1 className="font-serif font-bold text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.08] tracking-tight text-[#F5F1E8]">
              Mates Store
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#F5F1E8]/90 max-w-xl leading-relaxed">
              Mates Store is a clothing brand for people who belong together. Every piece is designed
              to complement the one next to it, whether you are shopping as a couple, with a
              friend, or with a sibling.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-4 w-auto pt-2">
              <Link
                to={ROUTE_PATHS.SETS}
                className="inline-flex min-h-[44px] h-11 sm:h-12 px-4 sm:px-6 md:px-8 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#111111] font-semibold text-xs sm:text-sm shadow-md hover:bg-[#F5F1E8]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[#F5F1E8] focus:ring-offset-2 focus:ring-offset-black w-auto shrink-0 whitespace-nowrap"
              >
                Shop Couples
              </Link>
              <Link
                to={ROUTE_PATHS.PRODUCTS}
                className="inline-flex min-h-[44px] h-11 sm:h-12 px-4 sm:px-6 md:px-8 items-center justify-center rounded-xl border border-[#F5F1E8] text-[#F5F1E8] font-semibold text-xs sm:text-sm bg-transparent hover:bg-[#F5F1E8]/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#F5F1E8] focus:ring-offset-2 focus:ring-offset-black w-auto shrink-0 whitespace-nowrap"
              >
                Shop Individually
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Announcement Ticker: Flush beneath hero with solid dark/black background & cream/light text */}
      <aside
        aria-label="Announcement"
        className="ticker-container w-full overflow-hidden bg-[var(--color-dark)] text-[var(--color-cream)] h-9 sm:h-11 flex items-center select-none"
      >
        <div className="ticker-track">
          <div className="flex shrink-0 items-center whitespace-nowrap text-[14px] sm:text-[17px] font-bold font-sans uppercase tracking-wider text-[var(--color-cream)]">
            <span>Welcome to Mates Store! Earn 5% loyalty cashback on every order.</span>
            <span className="mx-6 text-[var(--color-cream)]/50" aria-hidden="true">•</span>
            <span>Welcome to Mates Store! Earn 5% loyalty cashback on every order.</span>
            <span className="mx-6 text-[var(--color-cream)]/50" aria-hidden="true">•</span>
          </div>
          <div
            aria-hidden="true"
            className="ticker-duplicate flex shrink-0 items-center whitespace-nowrap text-[14px] sm:text-[17px] font-bold font-sans uppercase tracking-wider text-[var(--color-cream)]"
          >
            <span>Welcome to Mates Store! Earn 5% loyalty cashback on every order.</span>
            <span className="mx-6 text-[var(--color-cream)]/50" aria-hidden="true">•</span>
            <span>Welcome to Mates Store! Earn 5% loyalty cashback on every order.</span>
            <span className="mx-6 text-[var(--color-cream)]/50" aria-hidden="true">•</span>
          </div>
        </div>
      </aside>

      {/* Content Container Below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-16">
        {/* Couples Bundle Section */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-10 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-xs uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>The Pair Collection</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                A better fit together.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Two pieces designed to move together through everyday life, side by side. Each person
                selects their preferred size and color.
              </p>

              {/* Real bundle price only */}
              {featuredBundle && featuredBundle.bundlePrice ? (
                <div className="pt-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground block">
                    Bundle Price
                  </span>
                  <div className="text-2xl font-bold text-foreground">
                    EGP {(featuredBundle.bundlePrice / 100).toLocaleString("en-US")}
                  </div>
                </div>
              ) : null}

              <div className="pt-2">
                <Link
                  to={
                    featuredBundle
                      ? `/sets/${featuredBundle._id || featuredBundle.id}`
                      : ROUTE_PATHS.SETS
                  }
                  className="inline-flex min-h-[44px] h-11 px-6 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Shop the Bundle
                </Link>
              </div>
            </div>

            {/* Two item placeholders joined by a '+' sign */}
            <div className="lg:col-span-7 flex items-center justify-center gap-3 sm:gap-6">
              {/* Item 1 */}
              <div className="flex-1 max-w-[240px] aspect-3/4 rounded-2xl border border-border/70 bg-secondary/40 flex flex-col items-center justify-center p-4 text-center">
                {featuredBundle?.items?.[0]?.images?.[0]?.url ? (
                  <img
                    src={featuredBundle.items[0].images[0].url}
                    alt={getText(featuredBundle.items[0]?.name) || "Piece One"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="space-y-2 text-muted-foreground">
                    <div className="w-12 h-12 mx-auto rounded-full bg-border/40 flex items-center justify-center font-serif text-lg font-bold text-foreground">
                      1
                    </div>
                    <span className="text-xs font-medium">Piece One</span>
                  </div>
                )}
              </div>

              {/* Plus Sign */}
              <div className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center shrink-0 shadow-xs text-foreground">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Item 2 */}
              <div className="flex-1 max-w-[240px] aspect-3/4 rounded-2xl border border-border/70 bg-secondary/40 flex flex-col items-center justify-center p-4 text-center">
                {featuredBundle?.items?.[1]?.images?.[0]?.url ? (
                  <img
                    src={featuredBundle.items[1].images[0].url}
                    alt={getText(featuredBundle.items[1]?.name) || "Piece Two"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="space-y-2 text-muted-foreground">
                    <div className="w-12 h-12 mx-auto rounded-full bg-border/40 flex items-center justify-center font-serif text-lg font-bold text-foreground">
                      2
                    </div>
                    <span className="text-xs font-medium">Piece Two</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Featured Products
            </h2>
            <Link
              to={ROUTE_PATHS.PRODUCTS}
              className="group inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-accent transition-colors sm:text-sm"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ProductCollection
            products={featuredProducts}
            isLoading={isFeaturedLoading}
            isError={isFeaturedError}
            onRetry={refetchFeatured}
            limit={8}
          />
        </section>

        {/* Categories Section */}
        {displayedCategories.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Shop by Category
              </h2>
              <Link
                to={ROUTE_PATHS.PRODUCTS}
                className="group inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-accent transition-colors sm:text-sm"
              >
                <span>View all</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {isCategoriesLoading ? (
              <div
                className="grid grid-cols-2 gap-3 md:grid-cols-6"
                role="status"
                aria-label="Loading categories"
              >
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex h-16 items-center justify-between rounded-2xl border border-border bg-card px-4"
                  >
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : isCategoriesError ? (
              <ErrorState title="Unable to load categories" onRetry={refetchCategories} />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                {displayedCategories.map((category) => (
                  <Link
                    key={category._id || category.id}
                    to={`${ROUTE_PATHS.PRODUCTS}?category=${category._id || category.id}`}
                    className="group flex h-16 items-center justify-between rounded-2xl border border-border bg-card px-4 transition-all duration-200 hover:border-accent hover:bg-secondary/50"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {getText(category.name)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Best Sellers
              </h2>
              <Link
                to={ROUTE_PATHS.PRODUCTS}
                className="group inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-accent transition-colors sm:text-sm"
              >
                <span>View all</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ProductCollection
              products={bestSellers}
              isLoading={isBestSellersLoading}
              isError={isBestSellersError}
              onRetry={refetchBestSellers}
              limit={4}
            />
          </section>
        )}
      </div>
    </div>
  );
}

export default HomePage;
