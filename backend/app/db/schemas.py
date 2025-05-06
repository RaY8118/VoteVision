from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    user_id: str

    class Config:
        from_attributes = True


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class CandidateBase(BaseModel):
    name: str
    party: str
    manifesto: str
    position: str


class CandidateCreate(CandidateBase):
    pass


class CandidateOut(CandidateBase):
    id: int

    class Config:
        from_attributes = True


class VoterBase(BaseModel):
    user_id: int


class VoterCreate(VoterBase):
    pass


class VoterOut(VoterBase):
    id: int
    user_id: int
    has_voted: bool

    class Config:
        from_attributes = True


class VoteBase(BaseModel):
    voter_id: int
    candidate_id: int


class VoteCreate(VoteBase):
    pass


class VoteOut(VoteBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
