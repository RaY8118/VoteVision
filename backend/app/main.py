import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.db.database import Base, engine

load_dotenv()
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Voting System with Face Recogition")
app.include_router(api_router, prefix="/api/v1")

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS")
origins = [origins.strip()
           for origins in allowed_origins.split(",") if origins.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
