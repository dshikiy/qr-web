from sqlalchemy import create_engine, text

# Твоя реальная ссылка на базу данных Neon
DB_URL = "postgresql://neondb_owner:npg_oXIsAa8VfRc9@ep-rough-fog-apsygzr0-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DB_URL)

try:
    with engine.connect() as conn:
        # Добавляем недостающие колонки
        conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS additional_info TEXT;"))
        conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;"))
        conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
        conn.commit()
    print("✅ Успешно: База данных Neon обновлена! Новые колонки добавлены.")
except Exception as e:
    print(f"❌ Ошибка: {e}")