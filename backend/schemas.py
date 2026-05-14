from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from models import TagType, TagStatus

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    is_admin: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    name: str
    phone_number: str
    photo_url: Optional[str] = None
    additional_info: Optional[str] = None
    custom_data: Optional[dict] = {}

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class TagBase(BaseModel):
    tag_type: TagType
    status: TagStatus

class TagResponse(TagBase):
    id: UUID
    user_id: Optional[UUID]
    profile_id: Optional[UUID]
    created_at: datetime
    class Config:
        from_attributes = True

# Public Response
class PublicTagResponse(BaseModel):
    name: str
    phone_number: str
    photo_url: Optional[str] = None
    status: TagStatus
    tag_type: TagType
    additional_info: Optional[str] = None
    custom_data: Optional[dict] = {}
