from fastapi import APIRouter, Depends, HTTPException
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
    token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/users", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user
