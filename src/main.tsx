import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/api/queryClient';
import { AuthProvider } from '@/auth/AuthProvider';
import { ToastContainer } from '@/components/ui/Toast';
import { env } from '@/config/env';
import { initSentry } from '@/lib/sentry';
import { sanitizeBoPersistentState } from '@/lib/sanitizeBoPersistentState';

import { App } from './App';
import './styles/globals.css';

sanitizeBoPersistentState(queryClient);
initSentry();

async function enableMocks() {
  if (!env.useMocks) return;
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'warn' });
}

enableMocks().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <ToastContainer />
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
