import face_recognition
import numpy as np
from fastapi import HTTPException, UploadFile
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.models import User
from app.utils.id_generator import generate_id

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def create_user(db: Session, user: schemas.UserCreate):
    while True:
        new_user_id = generate_id()
        if not db.query(User).filter_by(user_id=new_user_id).first():
            break

    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        user_id=new_user_id,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role or "voter"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str):
    """Verify a password"""
    return pwd_context.verify(plain_password, hashed_password)


def login_user(db: Session, email: str, password: str):
    """Login a user"""
    user = get_user_by_email(db, email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return user


def get_user_by_email(db: Session, email: str):
    """Get a user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: str):
    """Get a user by ID"""
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 10):
    """Get all users with pagination"""
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user_role(db: Session, user_id: str, new_role: str):
    """Update a user's role"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def create_user_with_face(db: Session, user: schemas.UserCreate, image_file: UploadFile):
    """Create a user with face data"""
    while True:
        new_user_id = generate_id()
        if not db.query(User).filter_by(user_id=new_user_id).first():
            break

    # Now process the image and save user
    image = face_recognition.load_image_file(image_file.file)
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        raise HTTPException(
            status_code=400, detail="No face found in the image")

    face_encoding = np.array(encodings[0])
    hashed_password = get_password_hash(user.password)

    db_user = models.User(
        user_id=new_user_id,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role or "voter",
        face_encoding=face_encoding.tobytes()
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def login_with_face(db: Session, image_file: UploadFile):
    """Login a user with face data"""
    image = face_recognition.load_image_file(image_file.file)
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        raise HTTPException(
            status_code=400, detail="No face found in the image")

    input_encoding = encodings[0]
    user = db.query(models.User).filter(
        models.User.face_encoding == input_encoding.tobytes()).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
