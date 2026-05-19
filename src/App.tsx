import { RouterProvider } from 'react-router-dom';

import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

import { router } from './router';

export function App() {
  return (
    <AnalyticsProvider>
      <RouterProvider router={router} />
    </AnalyticsProvider>
  );
}
