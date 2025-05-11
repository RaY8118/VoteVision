import uuid

from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer, String,
                        func)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(6), unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="voter")
    has_voted = Column(Integer, default=0)

    votes = relationship("Vote", back_populates="voter")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(6), unique=True, nullable= False, index=True)
    name = Column(String, nullable=False)
    party = Column(String, nullable=False)
    manifesto = Column(String, nullable=False)
    vote_count = Column(Integer, default=0)

    votes = relationship("Vote", back_populates="candidate")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(String, ForeignKey("users.user_id"))
    candidate_id = Column(String, ForeignKey("candidates.candidate_id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    voter = relationship("User", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")


class VotingSession(Base):
    __tablename__ = "voting_sessions"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=False)
