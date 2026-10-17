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
    <div className="space-y-6 py-6 animate-fade-in dir-rtl text-start">
      <div className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-black text-foreground">المنتجات المفضلة</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          الخضروات والفواكه التي قمت بحفظها لشرائها لاحقاً
        </p>
      </div>

      {!isAuthenticated ? (
        <EmptyState
          title="يرجى تسجيل الدخول لعرض المفضلة"
          description="قم بتسجيل الدخول إلى حسابك لتتمكن من حفظ خضرواتك وفواكهك المفضلة ومزامنتها عبر جميع أجهزتك."
          icon={Heart}
          action={
            <Link to={ROUTE_PATHS.AUTH.LOGIN}>
              <Button className="mt-4 rounded-xl font-bold bg-[#155a29] hover:bg-[#0e3d1b] text-white gap-2">
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول الآن</span>
              </Button>
            </Link>
          }
        />
      ) : isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          role="status"
          aria-label="جاري تحميل المفضلة"
        >
          {[...Array(4)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="تعذر تحميل المفضلة"
          message="حدث خطأ أثناء جلب قائمة المفضلة من الخادم."
          onRetry={refetch}
        />
      ) : wishlistItems.length === 0 ? (
        <EmptyState
          title="قائمتك المفضلة فارغة"
          description="تصفح المتجر وأضف خضرواتك وفواكهك المفضلة بالنقر على أيقونة القلب."
          icon={Heart}
          action={
            <Link to={ROUTE_PATHS.PRODUCTS}>
              <Button className="mt-4 rounded-xl font-bold bg-[#155a29] hover:bg-[#0e3d1b] text-white">
                تصفح المنتجات
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
