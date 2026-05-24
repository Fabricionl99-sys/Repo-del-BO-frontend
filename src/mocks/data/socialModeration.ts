import type { SocialModerationConfig, SocialReportPending } from '@/types/socialModeration';

export const mockSocialReports: SocialReportPending[] = [
  {
    id: 'rep-1',
    post_id: 'post-1',
    post_content: 'Este post contiene spam repetido sobre bonos externos',
    post_author_display_name: 'JugadorX',
    post_author_player_state_id: 'ps-1',
    reporter_display_name: 'ModeradorTest',
    reason: 'spam',
    created_at: new Date(Date.now() - 3600_000).toISOString(),
    total_reports_on_post: 2,
    banned_words_detected: ['casino'],
  },
];

export const mockSocialConfig: SocialModerationConfig = {
  block_links: true,
  banned_words: ['spam'],
  xp_per_post: 0,
  xp_per_like_received: 0,
  xp_daily_cap: 0,
};
