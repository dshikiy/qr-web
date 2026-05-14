import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'lib'))

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import models, schemas, database, auth
import cloudinary
import cloudinary.uploader
import os

# Initialize database
models.Base.metadata.create_all(bind=database.engine)

# Cloudinary Setup
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

app = FastAPI(title="SafeTag QR API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://qr-ppfaiml2p-dauletyardev-2755s-projects.vercel.app",
        "https://qr-web-frontend.vercel.app", # Potential production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ---
@app.post("/api/auth/register", response_model=schemas.UserResponse)
async def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- PROFILES (Protected) ---
@app.get("/api/profiles", response_model=List[schemas.ProfileResponse])
def get_my_profiles(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    try:
        profiles = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).all()
        return profiles
    except Exception as e:
        print(f"Error fetching profiles: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/profiles", response_model=schemas.ProfileResponse)
def create_profile(profile: schemas.ProfileCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_profile = models.Profile(
        user_id=current_user.id,
        name=profile.name,
        phone_number=profile.phone_number,
        photo_url=profile.photo_url,
        additional_info=profile.additional_info,
        custom_data=profile.custom_data or {}
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.put("/api/profiles/{profile_id}", response_model=schemas.ProfileResponse)
def update_profile(profile_id: UUID, profile_update: schemas.ProfileCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_profile = db.query(models.Profile).filter(models.Profile.id == profile_id, models.Profile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")
    
    db_profile.name = profile_update.name
    db_profile.phone_number = profile_update.phone_number
    db_profile.photo_url = profile_update.photo_url
    db_profile.additional_info = profile_update.additional_info
    db_profile.custom_data = profile_update.custom_data or {}
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.delete("/api/profiles/{profile_id}")
def delete_profile(profile_id: UUID, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_profile = db.query(models.Profile).filter(models.Profile.id == profile_id, models.Profile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")
    
    # Check if any tags are using this profile
    tags_using = db.query(models.Tag).filter(models.Tag.profile_id == profile_id).all()
    if tags_using:
        raise HTTPException(status_code=400, detail="Бұл профиль белсенді биркаларда қолданылуда. Алдымен оларды ажыратыңыз.")
    
    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"}

@app.post("/api/profiles/{profile_id}/upload-photo")
async def upload_profile_photo(
    profile_id: UUID,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_profile = db.query(models.Profile).filter(
        models.Profile.id == profile_id, 
        models.Profile.user_id == current_user.id
    ).first()
    
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        # Upload to Cloudinary with face detection crop
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="safetag_profiles",
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"}
            ]
        )
        
        photo_url = upload_result.get("secure_url")
        db_profile.photo_url = photo_url
        db.commit()
        db.refresh(db_profile)
        
        return {"photo_url": photo_url}
    except Exception as e:
        print(f"Cloudinary error: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")

# --- TAGS (Protected & Public) ---
@app.get("/api/tags/{tag_id}/public")
def get_public_tag(tag_id: UUID, db: Session = Depends(database.get_db)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # If tag is not activated yet
    if not tag.profile_id:
        return {"status": "unactivated"}
        
    if tag.status != models.TagStatus.ACTIVE:
        raise HTTPException(status_code=404, detail="Tag is not active")
    
    profile = db.query(models.Profile).filter(models.Profile.id == tag.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {
        "name": tag.profile.name,
        "phone_number": tag.profile.phone_number,
        "photo_url": tag.profile.photo_url,
        "additional_info": tag.profile.additional_info,
        "custom_data": tag.profile.custom_data,
        "status": tag.status,
        "tag_type": tag.tag_type
    }

@app.post("/api/tags/{tag_id}/activate", response_model=schemas.TagResponse)
def activate_tag(tag_id: UUID, payload: schemas.TagBase, profile_id: UUID, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    if tag.profile_id is not None:
        raise HTTPException(status_code=400, detail="Tag is already activated")
    
    # Verify profile belongs to user
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id, models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")
    
    tag.user_id = current_user.id
    tag.profile_id = profile_id
    tag.tag_type = payload.tag_type
    tag.status = models.TagStatus.ACTIVE
    
    db.commit()
    db.refresh(tag)
    return tag

@app.put("/api/tags/{tag_id}", response_model=schemas.TagResponse)
def update_tag(tag_id: UUID, payload: schemas.TagBase, profile_id: UUID, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found or access denied")
    
    # Verify profile belongs to user
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id, models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")
    
    tag.profile_id = profile_id
    tag.tag_type = payload.tag_type
    tag.status = payload.status
    
    db.commit()
    db.refresh(tag)
    return tag

@app.get("/api/users/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/api/users/me/password")
def change_password(payload: schemas.UserCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Here payload.email is not used, but UserCreate has password.
    # We use UserCreate because it already has email and password fields.
    current_user.password_hash = auth.get_password_hash(payload.password)
    db.commit()
    return {"message": "Password changed successfully"}

# --- ADMIN ---
@app.get("/api/admin/stats")
def get_admin_stats(admin_user: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    total_users = db.query(models.User).count()
    total_tags = db.query(models.Tag).count()
    active_tags = db.query(models.Tag).filter(models.Tag.status == models.TagStatus.ACTIVE).count()
    return {
        "total_users": total_users,
        "total_tags": total_tags,
        "active_tags": active_tags
    }

@app.post("/api/admin/tags/batch")
def batch_generate_tags(payload: dict, admin_user: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    count = payload.get("count", 1)
    if count > 1000:
        raise HTTPException(status_code=400, detail="Максимум 1000 бирка бір уақытта")
    
    new_tags = []
    base_url = "https://safetag.kz" # Should ideally be from env
    
    for _ in range(count):
        tag = models.Tag(
            status=models.TagStatus.INACTIVE,
            user_id=None,
            profile_id=None
        )
        db.add(tag)
        new_tags.append(tag)
    
    db.commit()
    
    return [
        {
            "id": str(t.id),
            "url": f"{base_url}/t/{t.id}"
        } for t in new_tags
    ]

@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def get_all_users(admin_user: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@app.get("/api/admin/tags", response_model=List[schemas.TagResponse])
def get_all_tags(admin_user: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    return db.query(models.Tag).all()

@app.post("/api/admin/tags/{tag_id}/unlink")
def admin_unlink_tag(tag_id: UUID, admin_user: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db_tag.user_id = None
    db_tag.profile_id = None
    db_tag.status = models.TagStatus.INACTIVE
    db.commit()
    return {"message": "Tag unlinked by admin"}

@app.get("/api/users/me/tags", response_model=List[schemas.TagResponse])
def get_my_tags(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Tag).filter(models.Tag.user_id == current_user.id).all()

@app.put("/api/tags/{tag_id}", response_model=schemas.TagResponse)
def update_tag(tag_id: UUID, tag_update: schemas.TagBase, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found or access denied")
    
    db_tag.tag_type = tag_update.tag_type
    db_tag.status = tag_update.status
    
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.delete("/api/tags/{tag_id}")
def delete_tag(tag_id: UUID, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found or access denied")
    
    # We don't actually delete the tag record (since it's a physical QR), we just unlink it
    db_tag.user_id = None
    db_tag.profile_id = None
    db_tag.status = models.TagStatus.INACTIVE
    
    db.commit()
    return {"message": "Tag unlinked successfully"}

# --- SEEDING (Dev only) ---
@app.post("/api/test/create-tag")
def create_unactivated_tag(db: Session = Depends(database.get_db)):
    import uuid
    new_tag = models.Tag(
        id=uuid.uuid4(),
        status=models.TagStatus.INACTIVE,
        user_id=None,
        profile_id=None
    )
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return {"id": str(new_tag.id)}
