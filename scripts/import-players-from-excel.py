"""
Build src/data/players.json from the auction registration Excel sheet.

- Reads `public/Auction Registration Form (Responses).xlsx`
- Dedupes by phone number (keeps the LAST / most recent submission)
- Matches each player to a local photo in `public/player-photos/` by checking
  the filename suffix " - <Player Name>.<ext>" (case-insensitive)
- Derives a default role from the rating mix (user can edit later)
- Writes `src/data/players.json` with auction-ready fields
- Drive photo URL is preserved on `photoDriveUrl` for later processing
"""

import json
import os
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
EXCEL_PATH = ROOT / "public" / "Auction Registration Form (Responses).xlsx"
PHOTO_DIR = ROOT / "public" / "player-photos"
OUT_PATH = ROOT / "src" / "data" / "players.json"

DEFAULT_BASE_PRICE = 100

# Manual aliases: photo filename has a different spelling than the registration.
# Map: <normalized excel name> -> <normalized photo-filename name>
PHOTO_NAME_ALIASES = {
    "saurabhhirve": "saurabhhivre",       # photo: "Saurabh Hivre"
    "sachinwarghde": "sachinwarghade",    # photo: "Sachin Warghade"
    "sagardeshpande": "saagardeshpande",  # photo: "Saagar Deshpande"
}


def normalize(name: str) -> str:
    """Lowercase + strip diacritics + collapse non-alphanumerics for matching."""
    if not name:
        return ""
    nfkd = unicodedata.normalize("NFKD", str(name))
    ascii_only = nfkd.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]", "", ascii_only.lower())


def name_tokens(name: str) -> list[str]:
    """Lowercase ASCII word tokens from a player name."""
    if not name:
        return []
    nfkd = unicodedata.normalize("NFKD", str(name))
    ascii_only = nfkd.encode("ascii", "ignore").decode("ascii")
    cleaned = re.sub(r"[^a-zA-Z\s]", " ", ascii_only)
    return [t.lower() for t in cleaned.split() if t]


def short_key(name: str) -> str:
    """First + last token only — good for ignoring middle names / initials."""
    toks = name_tokens(name)
    if len(toks) >= 2:
        return toks[0] + toks[-1]
    if toks:
        return toks[0]
    return ""


def build_photo_index(photo_dir: Path) -> tuple[dict[str, str], dict[str, str]]:
    """Build (full_normalized -> path, first_last -> path) indexes for photos."""
    full_index: dict[str, str] = {}
    short_index: dict[str, str] = {}
    if not photo_dir.exists():
        return full_index, short_index
    for entry in sorted(photo_dir.iterdir()):
        if not entry.is_file():
            continue
        stem = entry.stem
        # Filenames look like "<orig_name> - <Player Full Name>"
        if " - " in stem:
            player_part = stem.rsplit(" - ", 1)[1]
        else:
            player_part = stem
        public_path = f"/player-photos/{entry.name}"
        full_key = normalize(player_part)
        if full_key:
            full_index.setdefault(full_key, public_path)
        sk = short_key(player_part)
        if sk:
            short_index.setdefault(sk, public_path)
    return full_index, short_index


def find_photo(name: str, full_index: dict[str, str], short_index: dict[str, str]) -> str | None:
    if not name:
        return None
    full = normalize(name)
    aliased = PHOTO_NAME_ALIASES.get(full)
    if aliased and aliased in full_index:
        return full_index[aliased]
    if full in full_index:
        return full_index[full]
    sk = short_key(name)
    if sk and sk in short_index:
        return short_index[sk]
    # Last resort: substring match either direction on full keys.
    for k, v in full_index.items():
        if full and (full in k or k in full):
            return v
    return None


def derive_role(batting: int, bowling: int) -> str:
    """Best-guess role from rating spread; user can edit in admin later."""
    b = batting or 0
    bo = bowling or 0
    if b - bo >= 2 and b >= 3:
        return "Batsman"
    if bo - b >= 2 and bo >= 3:
        return "Bowler"
    return "All-Rounder"


def to_int_rating(value) -> int:
    if value is None:
        return 0
    try:
        return max(0, min(5, int(round(float(value)))))
    except (TypeError, ValueError):
        return 0


def main() -> None:
    if not EXCEL_PATH.exists():
        raise SystemExit(f"Excel not found: {EXCEL_PATH}")

    full_index, short_index = build_photo_index(PHOTO_DIR)
    print(f"Indexed {len(full_index)} photos in {PHOTO_DIR}")

    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb.active

    # Dedupe by phone (fallback: normalized name) keeping the LAST submission.
    by_key: dict[str, dict] = {}
    order: list[str] = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        timestamp, name, age, phone, photo_url, batting, bowling, fielding = row
        if not name:
            continue
        name = str(name).strip()
        phone_key = str(int(phone)) if isinstance(phone, (int, float)) else (str(phone).strip() if phone else "")
        key = phone_key or normalize(name)
        if not key:
            continue

        if key not in by_key:
            order.append(key)
        by_key[key] = {
            "name": name,
            "age": int(age) if isinstance(age, (int, float)) else None,
            "phone": phone_key or None,
            "photoDriveUrl": photo_url,
            "battingRating": to_int_rating(batting),
            "bowlingRating": to_int_rating(bowling),
            "fieldingRating": to_int_rating(fielding),
            "timestamp": timestamp.isoformat() if timestamp else None,
        }

    # Build final list
    players = []
    matched = 0
    for new_id, key in enumerate(order, start=1):
        rec = by_key[key]
        local_photo = find_photo(rec["name"], full_index, short_index)
        if local_photo:
            matched += 1

        players.append({
            "id": new_id,
            "name": rec["name"],
            "role": derive_role(rec["battingRating"], rec["bowlingRating"]),
            "battingRating": rec["battingRating"],
            "bowlingRating": rec["bowlingRating"],
            "fieldingRating": rec["fieldingRating"],
            "photo": local_photo,
            "photoDriveUrl": rec["photoDriveUrl"],
            "basePrice": DEFAULT_BASE_PRICE,
            "price": 0,
            "team": None,
            "sold": False,
            "description": "",
            "cricheroesUrl": None,
        })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(players, f, indent=2, ensure_ascii=False)
        f.write("\n")

    unmatched = [p["name"] for p in players if not p["photo"]]
    print(f"Wrote {len(players)} players -> {OUT_PATH.relative_to(ROOT)}")
    print(f"Photos matched: {matched}/{len(players)}")
    if unmatched:
        print(f"Unmatched (drive URL kept): {len(unmatched)}")
        for n in unmatched:
            print(f"  - {n}")


if __name__ == "__main__":
    main()
