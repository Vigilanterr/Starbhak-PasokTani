#!/usr/bin/env bash
# Restores the api-test Neon branch to the head of chore-schema-v2 (the clean dev branch), then runs the API tests.
# The connection string stays in this shell's environment and is never printed.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_ID=small-field-32542778
BRANCH=api-test

if [ "$BRANCH" != "api-test" ]; then
  echo "Refusing to run: the API test branch must be api-test" >&2
  exit 1
fi

neon branches restore "$BRANCH" chore-schema-v2 --project-id "$PROJECT_ID" >/dev/null

API_TEST_DATABASE_URL="$(neon connection-string "$BRANCH" --project-id "$PROJECT_ID" --pooled)"
export API_TEST_DATABASE_URL

case "$API_TEST_DATABASE_URL" in
  *ep-damp-bird*) echo "Refusing to run: connection points at production" >&2; exit 1 ;;
esac

exec bun test --timeout 30000 --path-ignore-patterns "**/katalog.live.test.ts" tests
