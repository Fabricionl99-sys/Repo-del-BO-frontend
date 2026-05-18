/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_WIDGET_PREVIEW_URL?: string;
  readonly VITE_DOCS_URL?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
