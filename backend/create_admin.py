import auth
import models
import database
from sqlalchemy.orm import Session

def create_admin():
    db = next(database.get_db())
    email = "ds@gmail.com"
    password = "admin"
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        user.is_admin = True
        user.password_hash = auth.get_password_hash(password)
        db.commit()
        print(f"✅ User {email} is now admin. Password: {password}")
    else:
        new_user = models.User(
            email=email,
            password_hash=auth.get_password_hash(password),
            is_admin=True
        )
        db.add(new_user)
        db.commit()
        print(f"✅ Admin user {email} created. Password: {password}")

if __name__ == "__main__":
    create_admin()
