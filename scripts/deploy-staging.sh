#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

: "${S2G_STAGING_BUCKET:?Set S2G_STAGING_BUCKET (e.g. s2g-bo-staging)}"
: "${S2G_STAGING_CF_DISTRIBUTION_ID:?Set S2G_STAGING_CF_DISTRIBUTION_ID}"

echo "→ Building staging bundle..."
npm run build:staging

echo "→ Syncing to s3://${S2G_STAGING_BUCKET}..."
aws s3 sync dist/ "s3://${S2G_STAGING_BUCKET}/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --exclude "*.html"

aws s3 cp dist/index.html "s3://${S2G_STAGING_BUCKET}/index.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html"

echo "→ Invalidating CloudFront ${S2G_STAGING_CF_DISTRIBUTION_ID}..."
aws cloudfront create-invalidation \
  --distribution-id "${S2G_STAGING_CF_DISTRIBUTION_ID}" \
  --paths "/*"

echo "✓ Staging deploy complete"
