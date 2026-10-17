import { CustomerLayout } from '@/layouts/CustomerLayout.jsx';
import { ErrorBoundary } from '@/components/common/ErrorBoundary.jsx';
import { HomePage } from '@/features/customer/home/HomePage.jsx';
import { ProductsPage } from '@/features/customer/products/ProductsPage.jsx';
import { ProductDetailsPage } from '@/features/customer/products/ProductDetailsPage.jsx';
import { SetsPage } from '@/features/customer/sets/SetsPage.jsx';
import { SetDetailsPage } from '@/features/customer/sets/SetDetailsPage.jsx';
import { CheckoutPage } from '@/features/customer/checkout/CheckoutPage.jsx';
import { WishlistPage } from '@/features/customer/wishlist/WishlistPage.jsx';
import { ProfilePage } from '@/features/customer/profile/ProfilePage.jsx';
import { ROUTE_PATHS } from './routePaths.js';

export const customerRoutes = {
  element: (
    <ErrorBoundary>
      <CustomerLayout />
    </ErrorBoundary>
  ),
  children: [
    {
      path: ROUTE_PATHS.HOME,
      element: <HomePage />,
    },
    {
      path: ROUTE_PATHS.PRODUCTS,
      element: <ProductsPage />,
    },
    {
      path: ROUTE_PATHS.PRODUCT_DETAILS,
      element: <ProductDetailsPage />,
    },
    {
      path: ROUTE_PATHS.SETS,
      element: <SetsPage />,
    },
    {
      path: ROUTE_PATHS.SET_DETAILS,
      element: <SetDetailsPage />,
    },
    {
      path: ROUTE_PATHS.CHECKOUT,
      element: <CheckoutPage />,
    },
    {
      path: ROUTE_PATHS.WISHLIST,
      element: <WishlistPage />,
    },
    {
      path: ROUTE_PATHS.PROFILE,
      element: <ProfilePage />,
    },
  ],
};

export default customerRoutes;
