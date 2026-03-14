"""
One-shot migration: adds the new threat intelligence columns to the
existing threat_reports table if they don't already exist.
Safe to run multiple times (IF NOT EXISTS semantics via try/except).
"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "threats.db")

NEW_COLUMNS = [
    ("ip_address",       "VARCHAR(50)"),
    ("country",          "VARCHAR(50)"),
    ("risk_score",       "INTEGER DEFAULT 0"),
    ("url_features_json","TEXT"),
]

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

# Get existing columns
cur.execute("PRAGMA table_info(threat_reports)")
existing = {row[1] for row in cur.fetchall()}
print(f"Existing columns: {existing}")

for col_name, col_type in NEW_COLUMNS:
    if col_name not in existing:
        sql = f"ALTER TABLE threat_reports ADD COLUMN {col_name} {col_type}"
        cur.execute(sql)
        print(f"  ✓ Added column: {col_name}")
    else:
        print(f"  – Already exists: {col_name}")

conn.commit()
conn.close()
print("\nMigration complete.")
