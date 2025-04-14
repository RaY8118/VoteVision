# from app.api.v1.api import api_router
# from app.core.config import settings
from app.db.database import get_db
from fastapi import Depends, FastAPI

app = FastAPI(title="Voting System with Face Recognition")

# app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root(db=Depends(get_db)):
    return {"message": "Database connected successfully!"}
