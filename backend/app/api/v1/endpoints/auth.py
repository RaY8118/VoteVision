from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.token import create_access_token
from app.db import models, schemas
from app.db.database import get_db
from app.services import user_service
from app.utils.auth_utils import get_current_user

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    exisiting_user = user_service.get_user_by_email(db, user.email)
    if exisiting_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(db, user)


@router.post("/login", response_model=schemas.TokenResponse)
def login_user(login_data: schemas.LoginInput, db: Session = Depends(get_db)):
    user = user_service.login_user(db, login_data.email, login_data.password)
    token = create_access_token(
        data={"sub": str(user.user_id)}, auth_type="password")
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
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
    user = user_service.login_with_face(db, image)
    token = create_access_token(
        data={"sub": str(user.user_id)}, auth_type="face")
    return {"access_token": token, "token_type": "bearer"}
