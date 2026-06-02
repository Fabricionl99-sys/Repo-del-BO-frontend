#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

: "${S2G_PRODUCTION_BUCKET:?Set S2G_PRODUCTION_BUCKET (e.g. social2game-prod-frontend-bo)}"
: "${S2G_PRODUCTION_CF_DISTRIBUTION_ID:?Set S2G_PRODUCTION_CF_DISTRIBUTION_ID}"
AWS_REGION="${AWS_REGION:-sa-east-1}"

echo "→ Building production bundle..."
npm run build:production

echo "→ Syncing hashed assets (immutable, sin --delete) to s3://${S2G_PRODUCTION_BUCKET}/assets/..."
# No borramos chunks viejos en el mismo deploy: browsers con index-*.js cacheado
# pueden seguir pidiendo ModerationPage-<hash-viejo>.js. Si S3/CloudFront devuelve
# index.html (SPA fallback) el dynamic import falla con "Failed to fetch module".
aws --region "$AWS_REGION" s3 sync dist/assets/ "s3://${S2G_PRODUCTION_BUCKET}/assets/" \
  --cache-control "public,max-age=31536000,immutable"

echo "→ Syncing root static files..."
aws --region "$AWS_REGION" s3 sync dist/ "s3://${S2G_PRODUCTION_BUCKET}/" \
  --cache-control "public,max-age=3600" \
  --exclude "index.html" \
  --exclude "*.html" \
  --exclude "assets/*"

echo "→ Uploading index.html (no-cache)..."
aws --region "$AWS_REGION" s3 cp dist/index.html "s3://${S2G_PRODUCTION_BUCKET}/index.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html"

echo "→ Invalidating CloudFront ${S2G_PRODUCTION_CF_DISTRIBUTION_ID}..."
aws --region "$AWS_REGION" cloudfront create-invalidation \
  --distribution-id "${S2G_PRODUCTION_CF_DISTRIBUTION_ID}" \
  --paths "/assets/*" "/index.html" \
  --query 'Invalidation.{id:Id,status:Status}' --output table

echo "✓ Production deploy complete → https://app.social2game.com"
echo "  Tip: hard refresh (Cmd+Shift+R) si ves chunks viejos en cache del browser."
