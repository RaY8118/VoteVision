from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_admin: bool = False


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True


class CandidateBase(BaseModel):
    name: str
    party: str
    manifesto: str


class CandidateCreate(CandidateBase):
    pass


class CandidateOut(CandidateBase):
    id: int

    class Config:
        orm_mode = True


class VoterBase(BaseModel):
    full_name: str
    email: EmailStr


class VoterCreate(VoterBase):
    password: str


class VoterOut(VoterBase):
    id: int

    class Config:
        orm_mode = True
