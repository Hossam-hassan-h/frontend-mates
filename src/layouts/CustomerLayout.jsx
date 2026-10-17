import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Heart,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore.js";
import { useCartStore } from "@/store/useCartStore.js";
import { useUiStore } from "@/store/useUiStore.js";
import { ROUTE_PATHS } from "@/app/router/routePaths.js";
import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { useCategories } from "@/features/customer/categories/hooks/useCategories.js";
import { useCart } from "@/features/customer/cart/hooks/useCart.js";
import { Footer } from "@/components/layout/Footer.jsx";
import { CartDrawer } from "@/components/layout/CartDrawer.jsx";
import { ScrollToTop } from "@/components/common/ScrollToTop.jsx";
import { BrandLogo } from "@/components/common/BrandLogo.jsx";
import { ThemeToggle } from "@/components/common/ThemeToggle.jsx";
import { useStoreSettings } from "@/features/settings/useStoreSettings.js";
import { getText } from "@/utils/getText.js";

export function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState("");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = user?.role === "admin";
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isMobileMenuOpen = useUiStore((state) => state.isMobileMenuOpen);
  const toggleMobileMenu = useUiStore((state) => state.toggleMobileMenu);
  const closeMobileMenu = useUiStore((state) => state.closeMobileMenu);
  const { logout } = useAuth();
  const {
    data: storeSettings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useStoreSettings();

  // Dynamic Categories from API
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  // Cart total count (API if auth, Zustand if guest)
  const { totalQuantity: cartCount } = useCart();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`${ROUTE_PATHS.PRODUCTS}?keyword=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
      closeMobileMenu();
    }
  };

  // Up to 4 categories in navbar
  const visibleCategories = categories.slice(0, 4);
  const extraCategories = categories.slice(4);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="ltr">
      <ScrollToTop />

      {/* Top Bar Announcement */}
      <div className="bg-primary text-primary-foreground text-xs font-semibold py-2 px-4 text-center tracking-wide">
        {isSettingsLoading ? (
          <span className="mx-auto block h-4 w-64 max-w-full animate-pulse rounded bg-primary-foreground/20" />
        ) : isSettingsError ? (
          <button type="button" onClick={() => refetchSettings()} className="underline">
            Failed to load announcement — Retry
          </button>
        ) : (
          getText(storeSettings?.announcement) || 'Welcome to Mates Store! Earn 5% loyalty cashback on every order.'
        )}
      </div>

      {/* Cart Drawer Overlay */}
      <CartDrawer />

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-2xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Mobile Menu Button & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={ROUTE_PATHS.HOME} className="group shrink-0 flex items-center" aria-label="Mates Store">
              <BrandLogo />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, matching sets..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full h-10 ps-10 pe-4 rounded-full border border-border bg-card/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all"
              />
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Wishlist Link */}
            <Link
              to={ROUTE_PATHS.WISHLIST}
              className="p-2.5 rounded-xl border border-border bg-card/50 hover:bg-secondary transition-colors text-foreground hidden sm:inline-flex"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            {isAdmin ? (
              <Link
                to={ROUTE_PATHS.ADMIN.DASHBOARD}
                className="sm:hidden p-2.5 rounded-xl border border-border bg-card/50 text-foreground hover:bg-secondary transition-colors"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-xl border border-border bg-card/50 hover:bg-secondary transition-colors text-foreground cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -end-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Auth / Account Profile */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTE_PATHS.PROFILE}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-secondary/80 rounded-xl hover:bg-secondary transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline">{user?.name?.split(" ")[0] || "Account"}</span>
                </Link>
                {isAdmin && (
                  <Link
                    to={ROUTE_PATHS.ADMIN.DASHBOARD}
                    className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-bold text-foreground bg-secondary rounded-lg hover:bg-card transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to={ROUTE_PATHS.AUTH.LOGIN}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Sub-Navigation Strip (Desktop Category Links) */}
        <nav className="border-t border-border bg-card/40 hidden md:block">
          <div className="container mx-auto px-4 flex items-center justify-center gap-8 h-11 text-xs font-medium">
            <Link
              to={ROUTE_PATHS.HOME}
              className={`hover:text-foreground transition-colors py-1 ${
                location.pathname === ROUTE_PATHS.HOME && !location.search
                  ? "text-foreground font-bold border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Home
            </Link>

            <Link
              to={ROUTE_PATHS.PRODUCTS}
              className={`hover:text-foreground transition-colors py-1 ${
                location.pathname === ROUTE_PATHS.PRODUCTS && !location.search
                  ? "text-foreground font-bold border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Products
            </Link>

            <Link
              to={ROUTE_PATHS.SETS}
              className={`hover:text-foreground transition-colors py-1 ${
                location.pathname === ROUTE_PATHS.SETS
                  ? "text-foreground font-bold border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Couples Sets
            </Link>

            {/* Dynamic Categories from API */}
            {isCategoriesLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-4 bg-muted/60 animate-pulse rounded-md" />
                <div className="w-16 h-4 bg-muted/60 animate-pulse rounded-md" />
              </div>
            ) : isCategoriesError ? (
              <button
                type="button"
                onClick={() => refetchCategories()}
                className="text-destructive hover:underline"
              >
                Failed to load categories
              </button>
            ) : visibleCategories.length === 0 ? null : (
              visibleCategories.map((cat) => {
                const isActive = location.search.includes(`category=${cat._id}`);
                return (
                  <Link
                    key={cat._id}
                    to={`${ROUTE_PATHS.PRODUCTS}?category=${cat._id}`}
                    className={`hover:text-foreground transition-colors py-1 ${
                      isActive
                        ? "text-foreground font-bold border-b-2 border-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {getText(cat.name)}
                  </Link>
                );
              })
            )}

            {/* Extra categories dropdown if more than 4 */}
            {extraCategories.length > 0 && (
              <div className="relative group py-1">
                <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium">
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute start-0 top-full hidden group-hover:block bg-card border border-border shadow-md rounded-xl p-2 min-w-[140px] z-50 space-y-1">
                  {extraCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`${ROUTE_PATHS.PRODUCTS}?category=${cat._id}`}
                      className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      {getText(cat.name)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`${ROUTE_PATHS.PRODUCTS}?discounted=true`}
              className={`hover:text-foreground transition-colors py-1 ${
                location.search.includes("discounted=true")
                  ? "text-foreground font-bold border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Sale
            </Link>

            {isAuthenticated && user?.role !== "admin" && (
              <Link
                to={ROUTE_PATHS.PROFILE}
                className={`hover:text-foreground transition-colors py-1 ${
                  location.pathname === ROUTE_PATHS.PROFILE
                    ? "text-foreground font-bold border-b-2 border-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Orders & Points
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Search & Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card p-4 space-y-4 animate-fade-in shadow-lg">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clothing, matching sets..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full h-10 ps-9 pe-4 rounded-xl border border-border bg-background text-sm"
              />
            </form>
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <Link
                to={ROUTE_PATHS.HOME}
                onClick={closeMobileMenu}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                Home
              </Link>
              <Link
                to={ROUTE_PATHS.PRODUCTS}
                onClick={closeMobileMenu}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                Products
              </Link>
              <Link
                to={ROUTE_PATHS.SETS}
                onClick={closeMobileMenu}
                className="p-2 hover:bg-secondary rounded-lg font-bold text-foreground"
              >
                Couples Sets
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`${ROUTE_PATHS.PRODUCTS}?category=${cat._id}`}
                  onClick={closeMobileMenu}
                  className="p-2 hover:bg-secondary rounded-lg ps-4 text-xs text-muted-foreground"
                >
                  {getText(cat.name)}
                </Link>
              ))}
              <Link
                to={`${ROUTE_PATHS.PRODUCTS}?discounted=true`}
                onClick={closeMobileMenu}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                Sale
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to={ROUTE_PATHS.WISHLIST}
                    onClick={closeMobileMenu}
                    className="p-2 hover:bg-secondary rounded-lg"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to={ROUTE_PATHS.PROFILE}
                    onClick={closeMobileMenu}
                    className="p-2 hover:bg-secondary rounded-lg"
                  >
                    {user?.role === "admin" ? "Profile" : "Orders & Loyalty Points"}
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Theme Toggle Section */}
            <div className="pt-3 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground block mb-2">Theme:</span>
              <ThemeToggle variant="segmented" className="w-full justify-between" />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={location.pathname === ROUTE_PATHS.HOME ? "flex-1 w-full" : "flex-1 container mx-auto px-4 py-6"}>
        <Outlet />
      </main>

      {/* Customer Footer */}
      <Footer />
    </div>
  );
}

export default CustomerLayout;
