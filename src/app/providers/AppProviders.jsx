import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from './QueryProvider.jsx';
import '@/api/interceptors.js';

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <BrowserRouter>
        {children}
        <Toaster position="top-center" dir="ltr" richColors closeButton />
      </BrowserRouter>
    </QueryProvider>
  );
}

export default AppProviders;
