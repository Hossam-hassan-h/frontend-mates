import { Navigate } from "react-router-dom";
import { ManagerLayout } from "@/layouts/ManagerLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { AdminOrdersPage } from "@/features/admin/orders/AdminOrdersPage.jsx";
import { ROUTE_PATHS } from "./routePaths.js";

export const managerRoutes = {
  element: <ProtectedRoute allowedRoles={["manager"]} />,
  children: [
    {
      element: <ManagerLayout />,
      children: [
        {
          path: ROUTE_PATHS.MANAGER.ORDERS,
          element: <AdminOrdersPage />,
        },
        {
          path: "/manager",
          element: <Navigate to={ROUTE_PATHS.MANAGER.ORDERS} replace />,
        },
      ],
    },
  ],
};

export default managerRoutes;
