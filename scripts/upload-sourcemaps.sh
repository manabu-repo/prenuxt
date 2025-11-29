#!/usr/bin/env bash
# Example script to upload source maps to Sentry after build
# Requires: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, and sentry-cli installed on the runner

set -euo pipefail

BUILD_DIR=".output/public"
if [ ! -d "$BUILD_DIR" ]; then
  echo "Build directory $BUILD_DIR not found. Adjust BUILD_DIR in this script to match your project." >&2
  exit 2
fi

if [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  echo "SENTRY_AUTH_TOKEN is not set" >&2
  exit 2
fi

VERSION=${SENTRY_RELEASE:-"$(date +%s)-prenuxt"}

echo "Creating release $VERSION"
sentry-cli releases new -p "$SENTRY_PROJECT" "$VERSION"

echo "Uploading source maps from $BUILD_DIR"
sentry-cli releases files "$VERSION" upload-sourcemaps "$BUILD_DIR" --rewrite

echo "Finalizing release"
sentry-cli releases finalize "$VERSION"

echo "Sourcemaps uploaded for release $VERSION"
