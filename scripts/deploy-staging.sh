#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

: "${S2G_STAGING_BUCKET:?Set S2G_STAGING_BUCKET (e.g. s2g-bo-staging)}"
: "${S2G_STAGING_CF_DISTRIBUTION_ID:?Set S2G_STAGING_CF_DISTRIBUTION_ID}"
AWS_REGION="${AWS_REGION:-sa-east-1}"

echo "→ Building staging bundle..."
npm run build:staging

echo "→ Syncing hashed assets (immutable, sin --delete)..."
aws --region "$AWS_REGION" s3 sync dist/assets/ "s3://${S2G_STAGING_BUCKET}/assets/" \
  --cache-control "public,max-age=31536000,immutable"

echo "→ Syncing root static files..."
aws --region "$AWS_REGION" s3 sync dist/ "s3://${S2G_STAGING_BUCKET}/" \
  --cache-control "public,max-age=3600" \
  --exclude "index.html" \
  --exclude "*.html" \
  --exclude "assets/*"

echo "→ Uploading index.html (no-cache)..."
aws --region "$AWS_REGION" s3 cp dist/index.html "s3://${S2G_STAGING_BUCKET}/index.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html"

echo "→ Invalidating CloudFront ${S2G_STAGING_CF_DISTRIBUTION_ID}..."
aws --region "$AWS_REGION" cloudfront create-invalidation \
  --distribution-id "${S2G_STAGING_CF_DISTRIBUTION_ID}" \
  --paths "/*"

echo "✓ Staging deploy complete"
