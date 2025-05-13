from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import EmailStr
from sqlalchemy.orm import Session
import base64

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
        data={"sub": str(user.user_id)}, auth_type="password")
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserInfo)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """Get current user"""
    return current_user


@router.post("/register/face", response_model=schemas.UserOut)
def register_with_face(
    email: EmailStr = Form(...),
    full_name: str = Form(...),
    password: str = Form(...),
    role: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Register a new user with face data"""
    user_data = schemas.UserCreate(
        email=email,
        full_name=full_name,
        password=password,
        role=role
    )

    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    return user_service.create_user_with_face(db, user_data, image)


@router.post("/login/face")
def login_with_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Login a user with face data"""
    user = user_service.login_with_face(db, image)
    token = create_access_token(
        data={"sub": str(user.user_id)}, auth_type="face")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/face/verify")    
async def verify_face(  
    face_data: schemas.FaceVerificationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Verify user's face before voting"""
    if not current_user.face_encoding:
        raise HTTPException(
            status_code=400,
            detail="Face data not registered. Please register your face first."
        )
    
    is_verified = face_recognition_service.verify_face(
        current_user.face_encoding,
        face_data.face_image
    )
    
    if not is_verified:
        raise HTTPException(
            status_code=401,
            detail="Face verification failed"
        )
    
    verification_session = models.FaceVerificationSession(
        user_id=current_user.user_id,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(verification_session)
    db.commit()
    
    return {"message": "Face verification successful"}


@router.post("/face/register")
async def register_face(
    face_data: schemas.FaceRegistrationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Register or update face data for users"""
    try:
        image_data = face_data.face_image.split(',')[1] 
        binary_data = base64.b64decode(image_data)
        
        current_user.face_encoding = binary_data
        db.commit()
        
        return {"message": "Face data registered successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process face data: {str(e)}"
        )


@router.get("/face-status", response_model=dict)
async def get_face_status(current_user: models.User = Depends(get_current_user)):
    return {
        "has_face_data": bool(current_user.face_encoding),
        "user_id": current_user.user_id
    }
