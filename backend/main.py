# main.py - application entry point

from fastapi import FastAPI
from database.database import Base, engine
from boundary.central_router import router

app = FastAPI(title="FindMyID") # Instantiate FastAPI app

Base.metadata.create_all(bind=engine) # Create database tables 

app.include_router(router) # Register all boundary routes


# Homepage endpoint
@app.get("/")
def test():
    return 'hello world!'
