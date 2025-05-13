from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt
from sqlalchemy.orm import Session

from app.core.token import ALGORITHM, SECRET_KEY
from app.db.database import get_db
from app.services.user_service import get_user_by_id

security = HTTPBearer()


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Get the current user from the token"""
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY,
                             algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def require_role(user, allowed_roles: list[str]):
    """Require a user to have a specific role"""
    if user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Not authorized")


def require_admin(current_user=Depends(get_current_user)):
    """Require a user to have the admin role"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_voter(current_user=Depends(get_current_user)):
    """Require a user to have the voter role"""
    if current_user.role != "voter":
        raise HTTPException(
            status_code=403, detail="Access denied: Voter role required")
    return current_user
