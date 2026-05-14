import uuid, enum
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class TagType(enum.Enum):
    KIDS = "KIDS"
    PETS = "PETS"
    TRAVEL = "TRAVEL"
    TECH = "TECH"

class TagStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    LOST = "LOST"
    INACTIVE = "INACTIVE"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profiles = relationship("Profile", back_populates="owner")
    tags = relationship("Tag", back_populates="owner")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    additional_info = Column(Text, nullable=True)
    custom_data = Column(JSONB, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="profiles")
    tags = relationship("Tag", back_populates="profile")

class Tag(Base):
    __tablename__ = "tags"

    # The ID is the UUID used in the URL: domain.kz/t/{uuid}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    tag_type = Column(Enum(TagType), default=TagType.TECH)
    status = Column(Enum(TagStatus), default=TagStatus.INACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="tags")
    profile = relationship("Profile", back_populates="tags")
