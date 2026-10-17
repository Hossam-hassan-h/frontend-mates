import { Outlet, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { BrandLogo } from '@/components/common/BrandLogo.jsx';
import { ThemeToggle } from '@/components/common/ThemeToggle.jsx';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 relative">
      <div className="absolute top-4 end-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <Link to={ROUTE_PATHS.HOME} className="inline-block group" aria-label="Mates Store">
            <BrandLogo className="text-3xl" />
          </Link>
        </div>

        {/* Auth Content Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md animate-fade-in">
          <Outlet />
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mates Store. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
