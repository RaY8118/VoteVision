from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer,
                        LargeBinary, String, func, Enum)
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(6), unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="voter")
    face_encoding = Column(LargeBinary, nullable=True)

    votes = relationship("Vote", back_populates="voter")
    verification_sessions = relationship("FaceVerificationSession", back_populates="user")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(6), unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    party = Column(String, nullable=False)
    manifesto = Column(String, nullable=False)

    votes = relationship("Vote", back_populates="candidate")
    elections = relationship("Election", secondary="election_candidates", back_populates="candidates")


class ElectionStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"


class Election(Base):
    __tablename__ = "elections"

    election_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum(ElectionStatus), nullable=False, default=ElectionStatus.UPCOMING)

    votes = relationship("Vote", back_populates="election")
    candidates = relationship("Candidate", secondary="election_candidates", back_populates="elections")


class Vote(Base):
    __tablename__ = "votes"

    vote_id = Column(String, primary_key=True)
    election_id = Column(String, ForeignKey("elections.election_id"), nullable=False)
    voter_id = Column(String(6), ForeignKey("users.user_id"), nullable=False)
    candidate_id = Column(String(6), ForeignKey("candidates.candidate_id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)

    election = relationship("Election", back_populates="votes")
    voter = relationship("User", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")


class ElectionCandidate(Base):
    __tablename__ = "election_candidates"

    election_id = Column(String, ForeignKey("elections.election_id"), primary_key=True)
    candidate_id = Column(String(6), ForeignKey("candidates.candidate_id"), primary_key=True)
    registration_date = Column(DateTime, nullable=False, server_default=func.now())


class FaceVerificationSession(Base):
    __tablename__ = "face_verification_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(6), ForeignKey("users.user_id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="verification_sessions")
