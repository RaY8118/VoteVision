from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str
    role: Optional[str] = "voter"


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


class CandidateOut(CandidateBase):
    candidate_id: str
    vote_count: int

    class Config:
        from_attributes = True


class VoterBase(BaseModel):
    user_id: int


class VoterCreate(BaseModel):
    candidate_id: str 


class VoterOut(VoterBase):
    id: int
    user_id: str 
    has_voted: bool

    class Config:
        from_attributes = True


class VoteBase(BaseModel):
    voter_id: str 
    candidate_id: str 


class VoteCreate(VoteBase):
    pass


class VoteOut(VoteBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
