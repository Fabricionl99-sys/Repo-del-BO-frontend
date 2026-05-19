#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/docs-site"

: "${S2G_DOCS_BUCKET:?Set S2G_DOCS_BUCKET (e.g. social2game-prod-docs)}"
: "${S2G_DOCS_CF_DISTRIBUTION_ID:?Set S2G_DOCS_CF_DISTRIBUTION_ID}"

echo "→ Installing docs dependencies..."
npm ci

echo "→ Building Docusaurus site..."
npm run build

echo "→ Syncing to s3://${S2G_DOCS_BUCKET}..."
aws s3 sync build/ "s3://${S2G_DOCS_BUCKET}/" --delete

aws cloudfront create-invalidation \
  --distribution-id "${S2G_DOCS_CF_DISTRIBUTION_ID}" \
  --paths "/*"

echo "✓ Docs deploy complete → https://docs.social2game.com"
