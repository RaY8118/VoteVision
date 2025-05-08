from app.db import schemas
from app.db.database import get_db
from app.services import voter_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=schemas.VoterOut)
def create_voter(voter: schemas.VoterCreate, db: Session = Depends(get_db)):
    return voter_service.create_voter(db, voter)


@router.get("/", response_model=list[schemas.VoterBase])
def list_voters(db: Session = Depends(get_db)):
    return voter_service.get_voters(db)


@router.put("/mark-voted/{user_id}", response_model=schemas.VoterBase)
def mark_as_voted(user_id: int, db: Session = Depends(get_db)):
    voter = voter_service.mark_voter_as_voted(db, user_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return voter
