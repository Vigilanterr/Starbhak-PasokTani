#!/usr/bin/env bash
# Resets the api-test Neon branch to its parent, then runs the API tests against it.
# The connection string stays in this shell's environment and is never printed.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_ID=small-field-32542778
BRANCH=api-test

if [ "$BRANCH" != "api-test" ]; then
  echo "Refusing to run: the API test branch must be api-test" >&2
  exit 1
fi

neon branches reset "$BRANCH" --project-id "$PROJECT_ID" --parent >/dev/null

API_TEST_DATABASE_URL="$(neon connection-string "$BRANCH" --project-id "$PROJECT_ID" --pooled)"
export API_TEST_DATABASE_URL

case "$API_TEST_DATABASE_URL" in
  *ep-damp-bird*) echo "Refusing to run: connection points at production" >&2; exit 1 ;;
esac

exec bun test --timeout 30000 tests
