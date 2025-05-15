from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import schemas
from app.db.database import get_db
from app.db.models import User
from app.services import user_service
from app.utils.auth_utils import get_current_user, require_role

router = APIRouter()


@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        db_user = user_service.get_user_by_email(db, user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        return user_service.create_user(db=db, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 0, db: Session = Depends(get_db)):
    """Get all users"""
    users = user_service.get_users(db)
    return users


@router.patch("/{user_id}/role")
def change_user_role(user_id:str, new_role:str,db:Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    """Change user role"""
    require_role(current_user, ["admin"])
    user = user_service.update_user_role(db, user_id, new_role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message":f"User {user.full_name} promoted to role: {user.role}"}
