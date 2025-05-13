from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import models, schemas
from app.utils.id_generator import generate_id


def get_elections(db: Session):
    """Get all elections"""
    return db.query(models.Election).all()


def get_election(db: Session, election_id: str):
    """Get a specific election by ID"""
    election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Get candidates for this election
    candidates = db.query(models.Candidate).join(
        models.ElectionCandidate,
        models.ElectionCandidate.candidate_id == models.Candidate.candidate_id
    ).filter(
        models.ElectionCandidate.election_id == election_id
    ).all()
    
    # Add candidates to the election object
    election.candidates = candidates
    return election


def create_election(db: Session, election: schemas.ElectionCreate):
    """Create a new election"""
    while True:
        election_id = generate_id()
        if not db.query(models.Election).filter(models.Election.election_id == election_id).first():
            break

    db_election = models.Election(
        election_id=election_id,
        title=election.title,
        description=election.description,
        start_date=election.start_date,
        end_date=election.end_date,
        status=models.ElectionStatus.UPCOMING
    )
    db.add(db_election)
    db.commit()
    db.refresh(db_election)
    return db_election


def update_election(db: Session, election_id: str, election_update: schemas.ElectionCreate):
    """Update an election"""
    db_election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not db_election:
        raise HTTPException(status_code=404, detail="Election not found")

    for key, value in election_update.dict().items():
        setattr(db_election, key, value)

    db.commit()
    db.refresh(db_election)
    return db_election


def delete_election(db: Session, election_id: str):
    """Delete an election"""
    db_election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not db_election:
        raise HTTPException(status_code=404, detail="Election not found")

    # Delete all votes associated with this election
    db.query(models.Vote).filter(models.Vote.election_id == election_id).delete()
    
    # Delete all election-candidate associations
    db.query(models.ElectionCandidate).filter(models.ElectionCandidate.election_id == election_id).delete()
    
    # Now delete the election
    db.delete(db_election)
    db.commit()
    return {"message": "Election deleted successfully"}


def start_election(db: Session, election_id: str):
    """Start an election"""
    db_election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not db_election:
        raise HTTPException(status_code=404, detail="Election not found")

    if db_election.status != models.ElectionStatus.UPCOMING:
        raise HTTPException(status_code=400, detail="Election is not in upcoming status")

    db_election.status = models.ElectionStatus.ACTIVE
    db.commit()
    return {"message": "Election started successfully"}


def end_election(db: Session, election_id: str):
    """End an election"""
    db_election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not db_election:
        raise HTTPException(status_code=404, detail="Election not found")

    if db_election.status != models.ElectionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Election is not active")

    db_election.status = models.ElectionStatus.COMPLETED
    db.commit()
    return {"message": "Election ended successfully"}


def get_election_results(db: Session, election_id: str):
    """Get election results"""
    election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    if election.status != models.ElectionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Election results are not available yet")

    # Get vote counts for each candidate
    results = db.query(
        models.Candidate.name,
        models.Candidate.party,
        func.count(models.Vote.vote_id).label('vote_count')
    ).join(
        models.Vote,
        models.Vote.candidate_id == models.Candidate.candidate_id
    ).filter(
        models.Vote.election_id == election_id
    ).group_by(
        models.Candidate.candidate_id,
        models.Candidate.name,
        models.Candidate.party
    ).all()

    if not results:
        raise HTTPException(status_code=404, detail="No votes found for this election")

    # Convert to VoteResults objects
    vote_results = [
        schemas.VoteResults(
            name=result.name,
            party=result.party,
            vote_count=result.vote_count
        ) for result in results
    ]

    # Find winner
    winner = max(vote_results, key=lambda x: x.vote_count)

    return schemas.VoteSummary(
        results=vote_results,
        winner=winner
    )


def cast_vote(db: Session, election_id: str, vote: schemas.VoteCreate, current_user: models.User):
    """Cast a vote in an election"""
    # Check if election exists and is active
    election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if election.status != models.ElectionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Election is not active")

    # Check if user has already voted
    existing_vote = db.query(models.Vote).filter(
        models.Vote.election_id == election_id,
        models.Vote.voter_id == current_user.user_id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already voted in this election")

    # Check if candidate is registered in this election
    candidate_registration = db.query(models.ElectionCandidate).filter(
        models.ElectionCandidate.election_id == election_id,
        models.ElectionCandidate.candidate_id == vote.candidate_id
    ).first()
    if not candidate_registration:
        raise HTTPException(status_code=400, detail="Candidate is not registered for this election")

    # Create new vote
    vote_id = generate_id()
    new_vote = models.Vote(
        vote_id=vote_id,
        election_id=election_id,
        voter_id=current_user.user_id,
        candidate_id=vote.candidate_id,
        timestamp=datetime.utcnow()
    )
    db.add(new_vote)
    db.commit()
    return {"message": "Vote cast successfully"}


def add_candidate_to_election(db: Session, election_id: str, candidate_id: str):
    """Add a candidate to an election"""
    print(f"Adding candidate {candidate_id} to election {election_id}")
    
    # Check if election exists
    election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not election:
        print(f"Election {election_id} not found")
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Check if candidate exists
    candidate = db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first()
    if not candidate:
        print(f"Candidate {candidate_id} not found")
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if candidate is already in the election
    existing = db.query(models.ElectionCandidate).filter(
        models.ElectionCandidate.election_id == election_id,
        models.ElectionCandidate.candidate_id == candidate_id
    ).first()
    if existing:
        print(f"Candidate {candidate_id} is already in election {election_id}")
        raise HTTPException(status_code=400, detail="Candidate is already registered for this election")
    
    # Add candidate to election
    election_candidate = models.ElectionCandidate(
        election_id=election_id,
        candidate_id=candidate_id
    )
    db.add(election_candidate)
    db.commit()
    print(f"Successfully added candidate {candidate_id} to election {election_id}")
    
    return {"message": "Candidate added to election successfully"}


def remove_candidate_from_election(db: Session, election_id: str, candidate_id: str):
    """Remove a candidate from an election"""
    # Check if election exists
    election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Check if candidate exists
    candidate = db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if candidate is in the election
    election_candidate = db.query(models.ElectionCandidate).filter(
        models.ElectionCandidate.election_id == election_id,
        models.ElectionCandidate.candidate_id == candidate_id
    ).first()
    if not election_candidate:
        raise HTTPException(status_code=404, detail="Candidate is not registered for this election")
    
    # Remove candidate from election
    db.delete(election_candidate)
    db.commit()
    
    return {"message": "Candidate removed from election successfully"}


def get_election_candidates(db: Session, election_id: str):
    """Get all candidates registered for an election"""
    # Check if election exists
    election = db.query(models.Election).filter(models.Election.election_id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Get all candidates for the election
    candidates = db.query(models.Candidate).join(
        models.ElectionCandidate,
        models.ElectionCandidate.candidate_id == models.Candidate.candidate_id
    ).filter(
        models.ElectionCandidate.election_id == election_id
    ).all()
    
    return candidates 