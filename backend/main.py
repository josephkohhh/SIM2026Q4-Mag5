# main.py - application entry point

from fastapi import FastAPI
from database.database import Base, engine
from boundary.central_router import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FindMyID") # Instantiate FastAPI app

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine) # Create database tables 

app.include_router(router) # Register all boundary routes


# Homepage endpoint
@app.get("/")
def test():
    return 'hello world!'
