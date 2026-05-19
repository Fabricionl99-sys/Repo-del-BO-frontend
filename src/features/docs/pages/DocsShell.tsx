import { Navigate, Route, Routes } from 'react-router-dom';

import { DocsLayout } from '../layout/DocsLayout';
import DocsAuthPage from './DocsAuthPage';
import DocsBonusesPage from './DocsBonusesPage';
import DocsCallbackPage from './DocsCallbackPage';
import DocsEventsPage from './DocsEventsPage';
import DocsHomePage from './DocsHomePage';
import DocsPlayersPage from './DocsPlayersPage';
import DocsQuickstartPage from './DocsQuickstartPage';
import DocsReferencePage from './DocsReferencePage';

export default function DocsShell() {
  return (
    <Routes>
      <Route element={<DocsLayout />}>
        <Route index element={<DocsHomePage />} />
        <Route path="quickstart" element={<DocsQuickstartPage />} />
        <Route path="authentication" element={<DocsAuthPage />} />
        <Route path="operator-bonuses" element={<DocsBonusesPage />} />
        <Route path="events-webhook" element={<DocsEventsPage />} />
        <Route path="bonus-delivery" element={<DocsCallbackPage />} />
        <Route path="players" element={<DocsPlayersPage />} />
        <Route path="api-reference" element={<DocsReferencePage />} />
        <Route path="*" element={<Navigate to="/docs" replace />} />
      </Route>
    </Routes>
  );
}
