import type { FieldErrors } from 'react-hook-form';

import type { NotificationTemplateFormValues } from './notificationForm';

const FIELD_ORDER: (keyof NotificationTemplateFormValues)[] = [
  'code',
  'name',
  'description',
  'trigger_event',
  'language',
  'channels',
  'subject',
  'body',
  'body_html',
  'cta_text',
  'cta_url',
  'player_level_min',
  'player_level_max',
  'new_player_only_within_days',
];

function scrollIntoViewIfSupported(el: Element | null | undefined) {
  if (el && 'scrollIntoView' in el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function focusFirstTemplateFormError(
  errors: FieldErrors<NotificationTemplateFormValues>,
  scrollRoot?: HTMLElement | null,
) {
  const firstKey = FIELD_ORDER.find((key) => errors[key]);
  if (firstKey) {
    const el = document.querySelector(`[name="${String(firstKey)}"]`);
    if (el instanceof HTMLElement) {
      scrollIntoViewIfSupported(el);
      el.focus({ preventScroll: true });
      return;
    }
  }
  scrollIntoViewIfSupported(scrollRoot);
}
