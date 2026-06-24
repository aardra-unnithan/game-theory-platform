from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import datetime

# This creates our FastAPI application
app = FastAPI(title="Game Theory Learning Platform")

# This allows our React frontend to talk to our FastAPI backend
# Without this, the browser would block the connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This is our temporary in-memory storage
# Later we will replace this with a real database
sessions = {}

# This defines what data we expect when a student joins
class JoinGame(BaseModel):
    class_code: str
    student_name: str

# Root endpoint - just confirms the server is running
@app.get("/")
def root():
    return {"message": "Game Theory Platform is running"}

# Student joins with class code and name
@app.post("/join")
def join_game(data: JoinGame):
    # Check if class code is correct
    if data.class_code != "GAMETHEORY2024":
        return {"success": False, "message": "Invalid class code"}
    
    # Create a unique ID for this student session
    session_id = str(uuid.uuid4())
    
    # Save the student session
    sessions[session_id] = {
        "session_id": session_id,
        "student_name": data.student_name,
        "joined_at": str(datetime.datetime.now()),
        "game_status": "waiting",
        "moves": []
    }
    
    return {
        "success": True,
        "session_id": session_id,
        "message": f"Welcome {data.student_name}!"
    }

# Professor endpoint - see all active students
@app.get("/professor/sessions")
def get_sessions():
    return {"sessions": list(sessions.values())}