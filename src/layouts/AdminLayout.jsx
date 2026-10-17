import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Store,
  Settings,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useUiStore } from '@/store/useUiStore.js';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import { cn } from '@/lib/utils.js';
import { BrandLogo } from '@/components/common/BrandLogo.jsx';
import { ThemeToggle } from '@/components/common/ThemeToggle.jsx';

export function AdminLayout() {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdminSidebarOpen = useUiStore((state) => state.isAdminSidebarOpen);
  const toggleAdminSidebar = useUiStore((state) => state.toggleAdminSidebar);
  const { logout } = useAuth();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileSidebarOpen]);

  const navItems = [
    {
      title: 'Dashboard',
      path: ROUTE_PATHS.ADMIN.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      title: 'Products',
      path: ROUTE_PATHS.ADMIN.PRODUCTS,
      icon: Package,
    },
    {
      title: 'Orders',
      path: ROUTE_PATHS.ADMIN.ORDERS,
      icon: ShoppingBag,
    },
    {
      title: 'Categories',
      path: ROUTE_PATHS.ADMIN.CATEGORIES,
      icon: FolderTree,
    },
    {
      title: 'Hero Banner',
      path: ROUTE_PATHS.ADMIN.BANNERS,
      icon: ImageIcon,
    },
    {
      title: 'Users',
      path: ROUTE_PATHS.ADMIN.USERS,
      icon: Users,
    },
    {
      title: 'Reviews',
      path: ROUTE_PATHS.ADMIN.REVIEWS,
      icon: MessageSquare,
    },
    {
      title: 'Settings',
      path: ROUTE_PATHS.ADMIN.SETTINGS,
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30 text-foreground" dir="ltr">
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-border/60 bg-card shadow-xl transition-all duration-300 lg:translate-x-0 lg:shadow-none',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isAdminSidebarOpen ? 'lg:w-64' : 'lg:w-20'
        )}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 border-b border-border/60 flex items-center justify-between px-4">
          <Link
            to={ROUTE_PATHS.ADMIN.DASHBOARD}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="flex min-w-0 items-center gap-2 overflow-hidden"
          >
            <div className={cn('min-w-0 truncate', !isAdminSidebarOpen && 'lg:hidden')}>
              <BrandLogo className="text-lg" />
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Admin Portal</span>
            </div>
            {!isAdminSidebarOpen && (
              <span className="hidden lg:block font-serif font-bold text-xl text-foreground">M</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggleAdminSidebar}
            className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary lg:block"
            title="Toggle menu"
          >
            {isAdminSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
                title={item.title}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                <span className={cn('truncate', !isAdminSidebarOpen && 'lg:hidden')}>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-border/60 bg-card">
          <div className={cn('flex items-center gap-3 rounded-xl bg-secondary/50 p-2', !isAdminSidebarOpen && 'lg:justify-center')}>
            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className={cn('min-w-0 flex-1 truncate', !isAdminSidebarOpen && 'lg:hidden')}>
              <p className="truncate text-xs font-bold text-foreground">{user?.name || 'Admin'}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email || 'admin@mates.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={cn('flex min-w-0 flex-1 flex-col transition-all duration-300', isAdminSidebarOpen ? 'lg:ms-64' : 'lg:ms-20')}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-card px-3 sm:px-4 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="shrink-0 rounded-lg border border-border/60 p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to={ROUTE_PATHS.ADMIN.DASHBOARD} className="hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="hidden h-3.5 w-3.5 sm:block" />
            <span className="hidden truncate font-semibold text-foreground sm:block">Overview</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              to={ROUTE_PATHS.HOME}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 p-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-3 sm:py-1.5"
              title="View Store"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg p-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10 sm:px-3 sm:py-1.5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
