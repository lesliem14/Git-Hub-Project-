#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys

from sweep.config import Settings
from sweep.db import SweepDatabase
from sweep.pipeline import rebuild_excel, run_sweep, weekly_report


def cmd_sweep(args: argparse.Namespace) -> int:
    settings = Settings.load()
    result = run_sweep(settings, dry_run=args.dry_run)
    print(json.dumps(result.__dict__, indent=2))
    return 0


def cmd_excel(_: argparse.Namespace) -> int:
    settings = Settings.load()
    stamped, latest = rebuild_excel(settings)
    print(json.dumps({"stamped": stamped, "latest": latest}, indent=2))
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    settings = Settings.load()
    db = SweepDatabase(settings.database_path)
    ok = db.update_status(args.item_key, args.status, args.by)
    if not ok:
        print(f"No record updated for {args.item_key}", file=sys.stderr)
        return 1
    print(json.dumps({"updated": args.item_key, "status": args.status, "by": args.by}))
    return 0


def cmd_report(_: argparse.Namespace) -> int:
    settings = Settings.load()
    summary, csv_path = weekly_report(settings)
    print(json.dumps({"summary": summary, "csv": csv_path}, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Clientèle Social Complaints Sweep (v2)")
    sub = parser.add_subparsers(dest="command", required=True)

    sweep = sub.add_parser("sweep", help="Hourly collection + Excel queue")
    sweep.add_argument(
        "--dry-run",
        action="store_true",
        help="Collect and classify in memory only; no DB/Excel/alerts",
    )
    sweep.set_defaults(func=cmd_sweep)

    excel = sub.add_parser("excel", help="Rebuild Excel from database")
    excel.set_defaults(func=cmd_excel)

    status = sub.add_parser("status", help="Update one item status")
    status.add_argument("item_key", help="e.g. facebook:123_456")
    status.add_argument("status", help="Acknowledged | Resolved | Not a complaint | Open")
    status.add_argument("--by", dest="by", default=None, help="Handled By name")
    status.set_defaults(func=cmd_status)

    report = sub.add_parser("report", help="Weekly summary + CSV")
    report.set_defaults(func=cmd_report)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
