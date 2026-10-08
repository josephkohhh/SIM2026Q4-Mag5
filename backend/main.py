from fastapi import FastAPI
from database.database import Base, engine
from boundary.register_boundary import router as register_router

app = FastAPI(title="FindMyID") # Instantiate FastAPI class

Base.metadata.create_all(bind=engine) # Create all tables in db defined in entity folder

app.include_router(register_router)


@app.get("/") # GET method - "/" is default homepage endpoint
def test():
    return 'hello world!'
