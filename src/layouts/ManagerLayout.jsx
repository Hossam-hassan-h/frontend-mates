import { Outlet, Link } from 'react-router-dom';
import { LogOut, Store } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore.js';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import storeLogo from '@/assets/images/Qassem logo.jpeg';

export function ManagerLayout() {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF6]/40 text-foreground font-sans" dir="ltr">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E6DC] bg-white px-4 md:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src={storeLogo}
            alt="Mates Store"
            className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain"
          />
          <div>
            <span className="block text-base font-extrabold tracking-tight text-[#1A1F16]">Mates Store</span>
            <span className="text-[10px] font-bold text-[#6B7464]">Orders Management (Manager)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-[#F0F2ED] px-3 py-1.5 sm:flex">
            <div className="w-6 h-6 rounded-full bg-[#1D6B36]/20 text-[#1D6B36] font-bold flex items-center justify-center text-xs">
              {user?.name?.[0]?.toUpperCase() || 'M'}
            </div>
            <span className="text-xs font-extrabold text-[#1A1F16]">{user?.name || 'Manager'}</span>
          </div>

          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E6DC] p-2 text-xs font-bold text-[#6B7464] transition-colors hover:bg-[#F0F2ED] hover:text-[#1A1F16] sm:px-3 sm:py-1.5"
            title="Storefront"
          >
            <Store className="w-4 h-4 text-[#6B7464]" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg p-2 text-xs font-bold text-[#EF4444] transition-colors hover:bg-[#EF4444]/10 sm:px-3 sm:py-1.5 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default ManagerLayout;
