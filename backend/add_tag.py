from sqlalchemy import create_engine, text
import uuid

# Database URL from fix_db.py
DB_URL = "postgresql://neondb_owner:npg_oXIsAa8VfRc9@ep-rough-fog-apsygzr0-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DB_URL)

tag_id = '36958f78-9af3-4f1e-a115-31e0530fdc11'

try:
    with engine.connect() as conn:
        # Use uppercase for enums as discovered in DB
        sql = text("""
            INSERT INTO tags (id, status, tag_type) 
            VALUES (:id, 'INACTIVE', 'TECH') 
            ON CONFLICT (id) DO NOTHING;
        """)
        conn.execute(sql, {"id": tag_id})
        conn.commit()
    print(f"✅ Tag {tag_id} successfully added or already exists.")
except Exception as e:
    print(f"❌ Error adding tag: {e}")
