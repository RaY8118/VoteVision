from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.models import Candidate, Vote
from app.db.schemas import VoteResults, VoteSummary
from app.services.voting_session_service import get_active_session


def cast_vote(db: Session, current_user: models.User, vote_data: schemas.VoteCreate):
    if not get_active_session(db):
        raise HTTPException(
            status_code=400, detail="Voting session is not active")

    if current_user.has_voted:
        raise HTTPException(status_code=400, detail="You have already voted")

    candidate = db.query(Candidate).filter_by(
        candidate_id=vote_data.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    vote = models.Vote(candidate_id=candidate.candidate_id)
    db.add(vote)

    candidate.vote_count += 1
    current_user.has_voted = 1

    db.commit()
    return {"details": "Vote case successfully"}


def get_vote_results(db: Session):
    results = db.query(Candidate.name, Candidate.party, Candidate.vote_count).order_by(
        Candidate.vote_count.desc()).all()
    return results


def get_vote_results_with_winnder(db: Session):
    results = db.query(Candidate.name, Candidate.party, Candidate.vote_count).order_by(
        Candidate.vote_count.desc()).all()

    if not results:
        raise Exception("No candidates found")

    results_schmea = [VoteResults(
        name=r[0], party=r[1], vote_count=r[2]) for r in results]
    winner = results_schmea[0]

    return VoteSummary(results=results_schmea, winner=winner)
