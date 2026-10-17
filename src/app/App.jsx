import { AppProviders } from "./providers/AppProviders.jsx";
import { AppRouter } from "./router/AppRouter.jsx";
import { useCurrentUser } from "@/features/auth/hooks/useAuth.js";
import { Loader } from "@/components/feedback/Loader.jsx";
import { useAuthStore } from "@/store/useAuthStore.js";
import { SeoManager } from "@/components/common/SeoManager.jsx";
import { ErrorBoundary } from "@/components/common/ErrorBoundary.jsx";

function AuthInitializer({ children }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  useCurrentUser();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader text="Restoring session..." />
      </div>
    );
  }

  return children;
}

export function App() {
  return (
    <AppProviders>
      <AuthInitializer>
        <SeoManager />
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </AuthInitializer>
    </AppProviders>
  );
}

export default App;
