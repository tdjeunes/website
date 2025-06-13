#!/bin/bash
# See https://docs.google.com/spreadsheets/d/1mZhrxwnM2VhfynTstiIp-PTUitLaBz28DV9Pi4ffT_M
# See https://github.com/dcycle/google-sheets-to-csv
set -e

ROOT="$(pwd)"

if [ -z "$SYNECO_GOOGLE_SHEETS_API_KEY" ]; then
  echo "Please set the environment variable SYNECO_GOOGLE_SHEETS_API_KEY; see https://github.com/dcycle/google-sheets-to-csv"
  exit 1
fi

if [ -z "$SYNECO_GOOGLE_SHEETS_SPREADSHEET_ID" ]; then
  echo "Please set the environment variable SYNECO_GOOGLE_SHEETS_SPREADSHEET_ID; see https://github.com/dcycle/google-sheets-to-csv"
  exit 1
fi

rm -rf "$ROOT"/do-not-commit/google-sheets-to-csv
mkdir -p "$ROOT"/do-not-commit
cd "$ROOT"/do-not-commit
git clone https://github.com/dcycle/google-sheets-to-csv
cd "$ROOT"/do-not-commit/google-sheets-to-csv
./scripts/fetch-google-sheets.sh "$SYNECO_GOOGLE_SHEETS_API_KEY" "$SYNECO_GOOGLE_SHEETS_SPREADSHEET_ID" overview ./app/unversioned/scripts/data.csv

mkdir -p "$ROOT"/docs/data

cp "$ROOT"/do-not-commit/google-sheets-to-csv/unversioned/scripts/data.csv "$ROOT"/docs/data/overview.csv
