from fastapi import FastAPI

app = FastAPI() # Instantiate FastAPI class

@app.get("/") # GET method - "/" is default homepage endpoint
def test():
    return 'hello world!'
