from app.api.v1.endpoints import auth, face_recognition, user, vote
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(user.router, prefix="/users", tags=["Users"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(vote.router, prefix="/vote", tags=["Voting"])
api_router.include_router(
    face_recognition.router, prefix="/face-recognition", tags=["Face Recognition"]
)
