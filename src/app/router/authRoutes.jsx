import { AuthLayout } from '@/layouts/AuthLayout.jsx';
import { LoginPage } from '@/features/auth/pages/LoginPage.jsx';
import { RegisterPage } from '@/features/auth/pages/RegisterPage.jsx';
import { ROUTE_PATHS } from './routePaths.js';

export const authRoutes = {
  element: <AuthLayout />,
  children: [
    {
      path: ROUTE_PATHS.AUTH.LOGIN,
      element: <LoginPage />,
    },
    {
      path: ROUTE_PATHS.AUTH.REGISTER,
      element: <RegisterPage />,
    },
  ],
};
