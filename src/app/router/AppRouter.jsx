import { useRoutes } from 'react-router-dom';
import { customerRoutes } from './customerRoutes.jsx';
import { authRoutes } from './authRoutes.jsx';
import { adminRoutes } from './adminRoutes.jsx';
import { managerRoutes } from './managerRoutes.jsx';

export function AppRouter() {
  const routes = useRoutes([customerRoutes, authRoutes, adminRoutes, managerRoutes]);
  return routes;
}

export default AppRouter;
