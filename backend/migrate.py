from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Checking for additional_info column...")
        conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS additional_info TEXT;"))
        print("Checking for custom_data column...")
        conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';"))
        
        print("Checking for is_admin column on users...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
        
        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
