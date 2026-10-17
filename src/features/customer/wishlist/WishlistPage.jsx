import { Link } from "react-router-dom";
import { Heart, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore.js";
import { ProductCard } from "@/components/common/ProductCard.jsx";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton.jsx";
import { EmptyState } from "@/components/feedback/EmptyState.jsx";
import { ErrorState } from "@/components/feedback/ErrorState.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ROUTE_PATHS } from "@/app/router/routePaths.js";
import { useWishlist } from "@/features/customer/wishlist/hooks/useWishlist.js";

export function WishlistPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: wishlistItems = [], isLoading, isError, refetch } = useWishlist();

  return (
    <div className="space-y-6 py-6 animate-fade-in text-start">
      <div className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-black text-foreground">Saved Items</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Garments and outfits you have saved for later
        </p>
      </div>

      {!isAuthenticated ? (
        <EmptyState
          title="Please log in to view your wishlist"
          description="Log in to your account to save your favorite garments and sync them across all devices."
          icon={Heart}
          action={
            <Link to={ROUTE_PATHS.AUTH.LOGIN}>
              <Button className="mt-4 rounded-xl font-bold bg-[#155a29] hover:bg-[#0e3d1b] text-white gap-2">
                <LogIn className="w-4 h-4" />
                <span>Log In Now</span>
              </Button>
            </Link>
          }
        />
      ) : isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          role="status"
          aria-label="Loading wishlist"
        >
          {[...Array(4)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load wishlist"
          message="An error occurred while fetching your wishlist from the server."
          onRetry={refetch}
        />
      ) : wishlistItems.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Browse the catalog and save your favorite clothing pieces by clicking the heart icon."
          icon={Heart}
          action={
            <Link to={ROUTE_PATHS.PRODUCTS}>
              <Button className="mt-4 rounded-xl font-bold bg-[#155a29] hover:bg-[#0e3d1b] text-white">
                Browse Products
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
