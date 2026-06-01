import { RouterProvider } from 'react-router-dom';

import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

import { router } from './router';

export function App() {
  return (
    <AppErrorBoundary>
      <AnalyticsProvider>
        <RouterProvider router={router} />
      </AnalyticsProvider>
    </AppErrorBoundary>
  );
}
