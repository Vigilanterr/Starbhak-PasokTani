#!/usr/bin/env bash
# Starbhak-PasokTani - E2E Verification Runner Script
# Usage: ./scripts/run_e2e_tests.sh [--milestone <M1..M5|all>] [--tier <1..4|all>] [--strict|--progressive] [--skip-build] [--skip-lint] [--json]

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

node test/run_all_tests.mjs "$@"
