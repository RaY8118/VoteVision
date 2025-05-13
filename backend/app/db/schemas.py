from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr
from app.db import models


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


class UserInfo(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    role: str


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


class CandidateCreate(CandidateBase):
    pass


class CandidateOut(CandidateBase):
    candidate_id: str

    class Config:
        from_attributes = True


class VoteCreate(BaseModel):
    candidate_id: str


class VoteOut(BaseModel):
    vote_id: str
    election_id: str
    voter_id: str
    candidate_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


class VoteResults(BaseModel):
    name: str
    party: str
    vote_count: int


class VoteSummary(BaseModel):
    results: list[VoteResults]
    winner: VoteResults


class VotingSessionBase(BaseModel):
    is_active: bool


class VotingSessionCreate(VotingSessionBase):
    pass


class VotingSessionOut(VotingSessionBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime]

    class Config:
        from_attributes = True


class ElectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime


class ElectionCreate(ElectionBase):
    pass


class ElectionOut(ElectionBase):
    election_id: str
    status: str
    candidates: List[CandidateOut] = []

    class Config:
        from_attributes = True
        json_encoders = {
            models.ElectionStatus: lambda v: v.value
        }


class FaceVerificationRequest(BaseModel):
    face_image: str  # Base64 encoded image


class FaceRegistrationRequest(BaseModel):
    face_image: str  # Base64 encoded image


class FaceVerificationSession(BaseModel):
    user_id: str
    expires_at: datetime

    class Config:
        from_attributes = True
