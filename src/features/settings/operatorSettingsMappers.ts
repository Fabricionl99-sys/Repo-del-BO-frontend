import type {
  OperatorConfigApiResponse,
  OperatorConfigUpdatePayload,
} from '@/types/operatorConfig';

/** Campos que el backend persiste en PATCH /admin/operator-config. */
export type OperatorSettingsDraft = {
  notification_email: string;
  timezone: string;
  language: string;
};

export type OperatorSettingsPersistedPatch = {
  notification_email: string;
  timezone: string;
  language: string;
};

export function readOperatorSettings(config: OperatorConfigApiResponse): OperatorSettingsDraft {
  const ext = config as OperatorConfigApiResponse & {
    notification_email?: string;
    timezone?: string;
    language?: string;
  };

  return {
    notification_email:
      ext.notification_email ??
      config.notifications_preferences.notification_emails[0] ??
      config.contact_info.primary_email ??
      '',
    timezone: ext.timezone ?? config.localization.timezone,
    language: ext.language ?? config.localization.primary_language,
  };
}

export function toOperatorSettingsPatch(draft: OperatorSettingsDraft): OperatorSettingsPersistedPatch {
  return {
    notification_email: draft.notification_email.trim(),
    timezone: draft.timezone,
    language: draft.language,
  };
}

export function toOperatorSettingsUpdatePayload(
  draft: OperatorSettingsDraft,
): OperatorConfigUpdatePayload {
  return toOperatorSettingsPatch(draft);
}

export function buildSettingsSaveToastMessage(patch: OperatorSettingsPersistedPatch): string {
  const saved: string[] = [];
  if (patch.notification_email) saved.push(`email de notificaciones`);
  if (patch.timezone) saved.push(`zona horaria`);
  if (patch.language) saved.push(`idioma`);
  return saved.length > 0
    ? `Cambios guardados: ${saved.join(', ')}.`
    : 'Cambios guardados.';
}
