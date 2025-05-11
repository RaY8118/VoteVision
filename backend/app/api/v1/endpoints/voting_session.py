from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import schemas
from app.db.database import get_db
from app.services import voting_session_service
from app.utils.auth_utils import require_admin

router = APIRouter()


@router.post("/start", response_model=schemas.VotingSessionBase)
def start_voting_session(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    try:
        return voting_session_service.start_session(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/end", response_model=schemas.VotingSessionOut)
def end_voting_session(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    try:
        return voting_session_service.end_session(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
