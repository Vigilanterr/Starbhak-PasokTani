#!/usr/bin/env bash
# Restores the api-test-demo Neon branch to the head of catalog-demo (the seeded demo catalog), then runs the
# public catalog tests against it. Kept apart from test-api.sh, because the onboarding tests need the
# unseeded neon_auth users that catalog-demo has used up.
# The connection string stays in this shell's environment and is never printed.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_ID=small-field-32542778
BRANCH=api-test-demo

neon branches restore "$BRANCH" catalog-demo --project-id "$PROJECT_ID" >/dev/null

API_TEST_DATABASE_URL="$(neon connection-string "$BRANCH" --project-id "$PROJECT_ID" --pooled)"
export API_TEST_DATABASE_URL

case "$API_TEST_DATABASE_URL" in
  *ep-damp-bird*) echo "Refusing to run: connection points at production" >&2; exit 1 ;;
esac

exec bun test --timeout 30000 tests/katalog.live.test.ts
