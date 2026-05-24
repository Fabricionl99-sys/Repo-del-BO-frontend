import { http, HttpResponse } from 'msw';

import { mockSocialConfig, mockSocialReports } from '@/mocks/data/socialModeration';

let config = { ...mockSocialConfig };
let reports = [...mockSocialReports];

export const socialModerationHandlers = [
  http.get('*/admin/social/reports/pending', () =>
    HttpResponse.json({ data: { items: reports, next_cursor: null } }),
  ),
  http.post('*/admin/social/reports/:id/review', ({ params }) => {
    reports = reports.filter((r) => r.id !== params.id);
    return HttpResponse.json({ data: { ok: true } });
  }),
  http.get('*/admin/social/config', () => HttpResponse.json({ data: config })),
  http.patch('*/admin/social/config', async ({ request }) => {
    const body = (await request.json()) as Partial<typeof config>;
    config = { ...config, ...body, banned_words: body.banned_words ?? config.banned_words };
    return HttpResponse.json({ data: config });
  }),
  http.get('*/admin/social/profiles/banned', () => HttpResponse.json({ data: [] })),
  http.post('*/admin/social/profiles/:id/unban', () => HttpResponse.json({ data: { ok: true } })),
];

export function resetSocialModerationMocks() {
  config = { ...mockSocialConfig };
  reports = [...mockSocialReports];
}
