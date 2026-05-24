export interface SocialCursorPage<T> {
  items: T[];
  next_cursor: string | null;
}

export interface SocialReportPending {
  id: string;
  post_id: string;
  post_content: string;
  post_author_display_name: string;
  post_author_player_state_id: string;
  reporter_display_name: string;
  reason: string;
  created_at: string;
  total_reports_on_post: number;
  banned_words_detected?: string[];
}

export type SocialReportReviewAction = 'dismiss' | 'remove';

export interface SocialReportReviewPayload {
  action: SocialReportReviewAction;
  reviewer_notes?: string;
  ban_author?: boolean;
  ban_reason?: string;
}

export interface SocialModerationConfig {
  block_links: boolean;
  banned_words: string[];
  xp_per_post: number;
  xp_per_like_received: number;
  xp_daily_cap: number;
}

export interface SocialBannedProfile {
  player_state_id: string;
  display_name: string;
  banned_at: string;
  banned_reason: string | null;
}
