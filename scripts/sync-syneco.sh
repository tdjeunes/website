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

for w in \
overview-average \
overview-m1 \
overview-m2 \
overview-m3 \
overview-m4.1 \
overview-m4.2 \
overview-m4.3 \
overview-m4.4 \
overview-m5 \
;do
  ./scripts/fetch-google-sheets.sh "$SYNECO_GOOGLE_SHEETS_API_KEY" "$SYNECO_GOOGLE_SHEETS_SPREADSHEET_ID" "$w" ./app/unversioned/scripts/"$w".csv

  cp "$ROOT"/do-not-commit/google-sheets-to-csv/unversioned/scripts/"$w".csv "$ROOT"/docs/data/"$w".csv
done
