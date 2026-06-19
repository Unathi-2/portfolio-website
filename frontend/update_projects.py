"""
update_projects.py

Fetches project data from a published Google Sheets CSV and writes it
to projects.json at the repo root, in the format the portfolio's
projects.html expects (see loadAutoProjects() in that file).

Usage:
    python update_projects.py

Environment variable:
    SHEET_CSV_URL   The published-to-web CSV URL for the Google Sheet.
                     If not set, falls back to the DEFAULT_CSV_URL below.
"""

import csv
import io
import json
import os
import sys
import urllib.request

DEFAULT_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSlNh9WB4v_Gra3viQnteebS5JuJ9ZzFYWPBI9FQOYAtKLtGVTJi4kYQScTccewIxZlj8e34LTfW5sC/pub?output=csv"
)

OUTPUT_PATH = "projects.json"

REQUIRED_COLUMNS = [
    "Project Name",
    "Description",
    "Skills Used",
    "Category",
    "Difficulty",
    "Project Link",
    "Image Link",
    "Status",
    "Date Added",
]


def fetch_csv(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read()
    return raw.decode("utf-8-sig")  # handles BOM Google sometimes adds


def parse_csv(csv_text: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(csv_text))

    missing = [c for c in REQUIRED_COLUMNS if c not in (reader.fieldnames or [])]
    if missing:
        print(f"WARNING: CSV is missing expected columns: {missing}", file=sys.stderr)

    rows = []
    for row in reader:
        # Skip completely empty rows
        if not any(value.strip() for value in row.values() if value):
            continue
        # Normalize whitespace on every field
        clean_row = {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
        rows.append(clean_row)
    return rows


def main() -> None:
    url = os.environ.get("SHEET_CSV_URL", DEFAULT_CSV_URL)
    print(f"Fetching CSV from: {url}")

    try:
        csv_text = fetch_csv(url)
    except Exception as exc:
        print(f"ERROR: failed to fetch CSV: {exc}", file=sys.stderr)
        sys.exit(1)

    projects = parse_csv(csv_text)
    published = [p for p in projects if p.get("Status", "").lower() == "published"]

    print(f"Parsed {len(projects)} row(s), {len(published)} marked Published.")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)

    print(f"Wrote {OUTPUT_PATH} ({len(projects)} total rows).")


if __name__ == "__main__":
    main()
