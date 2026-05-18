# Deploy — Social2Game Backoffice Frontend

Static SPA built with Vite, hosted on **Amazon S3** + **CloudFront**.

## Environments

| Mode | API | CDN | MSW |
|------|-----|-----|-----|
| `development` | `/api` (proxied or MSW) | `http://localhost` | `true` |
| `staging` | `https://staging-api.social2game.com` | `https://staging-cdn.social2game.com` | `false` |
| `production` | `https://api.social2game.com` | `https://cdn.social2game.com` | `false` |

Env files: `.env.development`, `.env.staging`, `.env.production` (see `.env.example`).

## Prerequisites

- Node.js 20+
- AWS CLI v2 configured (`aws configure` or SSO)
- IAM permissions: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`, `cloudfront:CreateInvalidation`
- S3 bucket + CloudFront distribution per environment

## Local build check

```bash
npm ci
npm run build:production
npm run preview:production
```

Open http://localhost:4173 — the app calls `https://api.social2game.com` (CORS must be enabled on the API).

## Deploy staging

```bash
export S2G_STAGING_BUCKET=s2g-bo-staging
export S2G_STAGING_CF_DISTRIBUTION_ID=E1234567890ABC

chmod +x scripts/deploy-staging.sh
./scripts/deploy-staging.sh
```

## Deploy production

```bash
export S2G_PRODUCTION_BUCKET=s2g-bo-production
export S2G_PRODUCTION_CF_DISTRIBUTION_ID=E0987654321XYZ

chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## CloudFront SPA routing (required)

S3 static hosting returns 404 for deep links (`/dashboard`, `/misiones`, etc.). Configure CloudFront custom error responses:

| HTTP code | Response page | Response code |
|-----------|---------------|---------------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

Alternative: duplicate `index.html` as `error.html` in the bucket root.

## Rollback

1. List previous S3 object versions (if versioning enabled) or redeploy a known-good git tag:
   ```bash
   git checkout <tag>
   ./scripts/deploy-production.sh
   ```
2. Invalidate CloudFront again after rollback sync.

## Auth & API

- JWT `access` token in memory (`useAuthStore`), `refresh` in `localStorage` key `niveles_refresh_token`.
- All API calls go through `apiClient` (`src/api/client.ts`) with `Authorization: Bearer` and `X-Tenant-Id`.
- `401` → refresh; on failure → redirect `/login`.
- `500` / network errors → toast (see interceptors).

## Optional Sentry

Set `VITE_SENTRY_DSN` in `.env.staging` / `.env.production` and add `@sentry/react` in `src/lib/sentry.ts` when ready.

## CI suggestion

```yaml
- run: npm ci
- run: npm run lint
- run: npm test
- run: npm run build:production
- run: ./scripts/deploy-production.sh
  env:
    S2G_PRODUCTION_BUCKET: ${{ secrets.S2G_PRODUCTION_BUCKET }}
    S2G_PRODUCTION_CF_DISTRIBUTION_ID: ${{ secrets.S2G_PRODUCTION_CF_DISTRIBUTION_ID }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
