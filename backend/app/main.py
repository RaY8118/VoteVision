from app.api.v1.api import api_router
from app.db.database import Base, engine
from fastapi import FastAPI

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Voting System with Face Recogition")
app.include_router(api_router, prefix="/api/v1")
