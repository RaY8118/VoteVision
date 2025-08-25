from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import EmailStr
from sqlalchemy.orm import Session
import base64
import numpy as np
import face_recognition

from app.core.token import create_access_token
from app.db import models, schemas
from app.db.database import get_db
from app.services import user_service, face_recognition_service
from app.utils.auth_utils import get_current_user

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    exisiting_user = user_service.get_user_by_email(db, user.email)
    if exisiting_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(db, user)


@router.post("/login", response_model=schemas.TokenResponse)
def login_user(login_data: schemas.LoginInput, db: Session = Depends(get_db)):
    """Login a user"""
    user = user_service.login_user(db, login_data.email, login_data.password)
    token = create_access_token(
        data={"sub": str(user.user_id), "auth_type": "password"})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserInfo)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """Get current user"""
    return current_user


@router.post("/register/face", response_model=schemas.UserOut)
def register_with_face(
    image: UploadFile = File(...),
    email: Optional[EmailStr] = Form(None),
    full_name: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    token: Optional[HTTPAuthorizationCredentials] = Security(
        HTTPBearer(auto_error=False)),
):
    """Register a new user with face data or add face data to an existing user"""
    current_user: Optional[models.User] = None
    if token:
        try:
            current_user = get_current_user(token=token, db=db)
        except HTTPException as e:
            if e.status_code != 401:
                raise

    if current_user:
        if current_user.face_encoding:
            raise HTTPException(
                status_code=400, detail="Face data already registered for this user")
        return user_service.add_face_data_to_user(db, current_user, image)
    else:
        if not email or not full_name or not password:
            raise HTTPException(
                status_code=400, detail="Email, full name, and password are required for new user registration")

        user_data = schemas.UserCreate(
            email=email,
            full_name=full_name,
            password=password,
            role=role
        )

        existing_user = user_service.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=400, detail="Email already registered")

        return user_service.create_user_with_face(db, user_data, image)


@router.post("/login/face")
def login_with_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Login a user with face data"""
    user = user_service.login_with_face(db, image)
    token = create_access_token(
        data={"sub": str(user.user_id), "auth_type": "face"})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/face/verify")
async def verify_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Verify user's face before voting"""
    if not current_user.face_encoding:
        raise HTTPException(
            status_code=400,
            detail="Face data not registered. Please register your face first."
        )

    image_data = face_recognition.load_image_file(image.file)
    encodings = face_recognition.face_encodings(image_data)
    if not encodings:
        raise HTTPException(
            status_code=400,
            detail="No face found in the image"
        )

    input_encoding = encodings[0]
    stored_encoding = np.frombuffer(
        current_user.face_encoding, dtype=np.float64)

    results = face_recognition.compare_faces(
        [stored_encoding], input_encoding, tolerance=0.6)

    if not results[0]:
        raise HTTPException(
            status_code=401,
            detail="Face verification failed"
        )

    try:
        verification_session = models.FaceVerificationSession(
            user_id=current_user.user_id,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(verification_session)
        db.commit()

        return {"message": "Face verification successful"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create verification session: {str(e)}"
        )


@router.get("/face-status", response_model=dict)
async def get_face_status(current_user: models.User = Depends(get_current_user)):
    return {
        "has_face_data": bool(current_user.face_encoding),
        "user_id": current_user.user_id
    }
