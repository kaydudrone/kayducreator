#!/bin/bash
# Ping IndexNow so Bing (and Yandex, Naver, Seznam) re-crawl within minutes
# instead of waiting for their next scheduled crawl.
#
# Usage:
#   ./scripts/indexnow.sh                          # submits the 8 sitemap URLs
#   ./scripts/indexnow.sh /free-gpx /nuang         # submits just these paths
#   ./scripts/indexnow.sh https://kayducreator.com/free-gpx   # full URLs work too
#
# Run it AFTER `git push`, once Vercel has finished deploying — IndexNow
# fetches the page immediately, so the new content has to already be live.
#
# Google ignores IndexNow. For Google, use Search Console → URL Inspection →
# Request Indexing, or just wait for the sitemap crawl.

set -euo pipefail

HOST="kayducreator.com"
KEY="8bf98b3f0e5491f238882777978389a8"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

# Default set = everything in sitemap.xml
DEFAULT_PATHS=(
  "/"
  "/free-gpx"
  "/media-kit"
  "/kinabalu"
  "/rinjani"
  "/nuang"
  "/sepang"
  "/langkawi"
)

# Build the URL list from args, or fall back to the defaults
urls=()
if [ "$#" -gt 0 ]; then
  for arg in "$@"; do
    case "$arg" in
      https://*) urls+=("$arg") ;;
      /*)        urls+=("https://${HOST}${arg}") ;;
      *)         urls+=("https://${HOST}/${arg}") ;;
    esac
  done
else
  for p in "${DEFAULT_PATHS[@]}"; do
    [ "$p" = "/" ] && urls+=("https://${HOST}") || urls+=("https://${HOST}${p}")
  done
fi

# Confirm the key file is actually reachable — IndexNow rejects the whole
# submission with 403 if it can't verify ownership, and that failure is silent
# from the caller's point of view otherwise.
echo "Checking key file: ${KEY_LOCATION}"
served=$(curl -fsS --max-time 10 "$KEY_LOCATION" || true)
if [ "$served" != "$KEY" ]; then
  echo "ERROR: key file missing or wrong content at ${KEY_LOCATION}" >&2
  echo "       expected '${KEY}', got '${served:-<nothing>}'" >&2
  echo "       Has the deploy finished?" >&2
  exit 1
fi
echo "Key file OK."

# JSON body
list=$(printf '"%s",' "${urls[@]}"); list="${list%,}"
body=$(printf '{"host":"%s","key":"%s","keyLocation":"%s","urlList":[%s]}' \
       "$HOST" "$KEY" "$KEY_LOCATION" "$list")

echo "Submitting ${#urls[@]} URL(s):"
printf '  %s\n' "${urls[@]}"

code=$(curl -s -o /tmp/indexnow_resp.txt -w '%{http_code}' \
  -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --max-time 20 -d "$body")

case "$code" in
  200|202) echo "IndexNow accepted (HTTP $code)." ;;
  400) echo "HTTP 400 — bad request (malformed URL list)." >&2; cat /tmp/indexnow_resp.txt >&2; exit 1 ;;
  403) echo "HTTP 403 — key rejected. Check ${KEY_LOCATION} is public." >&2; exit 1 ;;
  422) echo "HTTP 422 — URLs don't match host ${HOST}." >&2; exit 1 ;;
  429) echo "HTTP 429 — too many requests. Wait, then retry." >&2; exit 1 ;;
  *)   echo "HTTP $code — unexpected." >&2; cat /tmp/indexnow_resp.txt >&2; exit 1 ;;
esac
