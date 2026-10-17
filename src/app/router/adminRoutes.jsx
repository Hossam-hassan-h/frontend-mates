import { Navigate } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

import { AdminDashboardPage } from "@/features/admin/dashboard/AdminDashboardPage.jsx";
import { AdminProductsPage } from "@/features/admin/products/AdminProductsPage.jsx";
import { AdminOrdersPage } from "@/features/admin/orders/AdminOrdersPage.jsx";
import { AdminCategoriesPage } from "@/features/admin/categories/AdminCategoriesPage.jsx";
import { AdminUsersPage } from "@/features/admin/users/AdminUsersPage.jsx";
import { AdminStoreSettingsPage } from "@/features/admin/settings/AdminStoreSettingsPage.jsx";
import { AdminReviewsPage } from "@/features/admin/reviews/AdminReviewsPage.jsx";
import { AdminBannersPage } from "@/features/admin/banners/AdminBannersPage.jsx";
import { ROUTE_PATHS } from "./routePaths.js";

export const adminRoutes = {
  element: <ProtectedRoute allowedRoles={["admin"]} />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        {
          path: ROUTE_PATHS.ADMIN.DASHBOARD,
          element: <AdminDashboardPage />,
        },
        {
          path: "/admin/dashboard",
          element: <Navigate to={ROUTE_PATHS.ADMIN.DASHBOARD} replace />,
        },
        {
          path: ROUTE_PATHS.ADMIN.PRODUCTS,
          element: <AdminProductsPage />,
        },
        {
          path: ROUTE_PATHS.ADMIN.ORDERS,
          element: <AdminOrdersPage />,
        },
        {
          path: ROUTE_PATHS.ADMIN.CATEGORIES,
          element: <AdminCategoriesPage />,
        },
        {
          path: ROUTE_PATHS.ADMIN.USERS,
          element: <AdminUsersPage />,
        },
        {
          path: ROUTE_PATHS.ADMIN.BANNERS,
          element: <AdminBannersPage />,
        },
        {
          path: ROUTE_PATHS.ADMIN.REVIEWS,
          element: <AdminReviewsPage />,
        },
        {
          path: ROUTE_PATHS.ADMIN.SETTINGS,
          element: <AdminStoreSettingsPage />,
        },
      ],
    },
  ],
};
