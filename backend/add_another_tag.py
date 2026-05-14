from sqlalchemy import create_engine, text
import uuid

# Database URL from fix_db.py
DB_URL = "postgresql://neondb_owner:npg_oXIsAa8VfRc9@ep-rough-fog-apsygzr0-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DB_URL)

tag_id = 'ae023485-b639-486d-a15a-18e6b86e0bee'

try:
    with engine.connect() as conn:
        # Check if tag exists
        res = conn.execute(text("SELECT id FROM tags WHERE id = :id"), {"id": tag_id}).fetchone()
        if res:
            print(f"✅ Tag {tag_id} already exists.")
        else:
            # Insert tag
            sql = text("""
                INSERT INTO tags (id, status, tag_type) 
                VALUES (:id, 'INACTIVE', 'TECH')
            """)
            conn.execute(sql, {"id": tag_id})
            conn.commit()
            print(f"✅ Tag {tag_id} successfully added.")
except Exception as e:
    print(f"❌ Error: {e}")
