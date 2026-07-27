#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://localhost:4000}"
NOTES_URL="${BASE_URL%/}/notes"
response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

request() {
  local description="$1"
  local expected_status="$2"
  shift 2

  printf '\n%s\n' "=== ${description} ==="
  RESPONSE_STATUS="$(
    curl --silent --show-error \
      --output "$response_file" \
      --write-out '%{http_code}' \
      "$@"
  )"
  RESPONSE_BODY="$(<"$response_file")"

  printf '%s\nHTTP status: %s\n' "$RESPONSE_BODY" "$RESPONSE_STATUS"

  if [[ "$RESPONSE_STATUS" != "$expected_status" ]]; then
    printf 'Expected HTTP status %s, received %s.\n' \
      "$expected_status" "$RESPONSE_STATUS" >&2
    exit 1
  fi
}

printf 'Testing Notes API at %s\n' "$NOTES_URL"

request "POST /notes — create (201)" 201 \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{"text":"Created by the curl smoke test"}' \
  "$NOTES_URL"

created_note="$RESPONSE_BODY"

note_id="$(
  printf '%s' "$created_note" |
    node -e '
      let input = "";
      process.stdin.on("data", (chunk) => (input += chunk));
      process.stdin.on("end", () => {
        const note = JSON.parse(input);
        if (!note.id) {
          throw new Error("Create response did not contain a note ID");
        }
        process.stdout.write(note.id);
      });
    '
)"

request "GET /notes — list all (200)" 200 "$NOTES_URL"
request "GET /notes/:id — retrieve existing note (200)" 200 "$NOTES_URL/$note_id"

request "PUT /notes/:id — update existing note (200)" 200 \
  --request PUT \
  --header "Content-Type: application/json" \
  --data '{"text":"Updated through PUT"}' \
  "$NOTES_URL/$note_id"

request "GET /notes/:id — unknown note (404)" 404 \
  "$NOTES_URL/does-not-exist"

request "PUT /notes/:id — unknown note (404)" 404 \
  --request PUT \
  --header "Content-Type: application/json" \
  --data '{"text":"Cannot update this note"}' \
  "$NOTES_URL/does-not-exist"

request "DELETE /notes/:id — delete existing note (200)" 200 \
  --request DELETE \
  "$NOTES_URL/$note_id"

request "GET /notes/:id — deleted note (404)" 404 "$NOTES_URL/$note_id"

request "DELETE /notes/:id — unknown note (404)" 404 \
  --request DELETE \
  "$NOTES_URL/$note_id"

request "GET /notes — list after deletion (200)" 200 "$NOTES_URL"

printf '\nNotes API smoke test completed.\n'
