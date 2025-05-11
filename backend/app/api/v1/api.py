from fastapi import APIRouter

from app.api.v1.endpoints import (auth, candidate, face_recognition, user,
                                  vote, voting_session)

api_router = APIRouter()

api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(vote.router, prefix="/vote", tags=["votes"])
api_router.include_router(
    candidate.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(voting_session.router,
                          prefix="/session", tags=["voting session"])
