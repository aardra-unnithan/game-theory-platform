from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import datetime
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Game Theory Learning Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In memory storage for sessions
sessions = {}

# Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class JoinGame(BaseModel):
    student_name: str

class MoveRequest(BaseModel):
    session_id: str
    student_move: str  # "testify" or "silence"

class HintRequest(BaseModel):
    session_id: str
    professor_message: str

@app.get("/")
def root():
    return {"message": "Game Theory Platform is running"}

# Student joins the game
@app.post("/join")
def join_game(data: JoinGame):
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "session_id": session_id,
        "student_name": data.student_name,
        "joined_at": str(datetime.datetime.now()),
        "game_status": "playing",
        "moves": [],
        "total_student_score": 0,
        "total_ai_score": 0,
        "current_round": 1,
        "hint": None
    }
    return {
        "success": True,
        "session_id": session_id,
        "message": f"Welcome {data.student_name}!"
    }

# Claude AI agent decides its move
def get_ai_move(moves_history: list, ai_strategy: str = "rational") -> tuple:
    # Build the game history for Claude to reason over
    history_text = ""
    if len(moves_history) == 0:
        history_text = "This is the first round. No history yet."
    else:
        for i, move in enumerate(moves_history):
            history_text += f"Round {i+1}: Student chose {move['student_move']}, AI chose {move['ai_move']}. Student got {move['student_payoff']} pts, AI got {move['ai_payoff']} pts.\n"

    prompt = f"""You are an AI agent playing the Prisoner's Dilemma game from Harrington's Game Theory textbook Chapter 4.

The payoff matrix is:
- Both Silence: You get 3, Student gets 3
- You Testify, Student Silent: You get 4, Student gets 1  
- You Silent, Student Testify: You get 1, Student gets 4
- Both Testify: You get 2, Student gets 2

Game history so far:
{history_text}

Your strategy mode is: {ai_strategy}

If strategy is "rational": Play to maximize your own total score using game theory reasoning.
If strategy is "cooperative": Prefer silence to encourage mutual cooperation.
If strategy is "aggressive": Always testify to maximize individual gain.

Based on the game history and your strategy, decide your next move.
Reason carefully about what the student's pattern is and what maximizes your outcome.

Respond with ONLY a JSON object in this exact format:
{{"move": "silence", "reasoning": "your brief reasoning here"}}
or
{{"move": "testify", "reasoning": "your brief reasoning here"}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    response_text = response.content[0].text.strip()
    parsed = json.loads(response_text)
    return parsed["move"], parsed["reasoning"]

# Get payoff based on moves
def get_payoff(student_move: str, ai_move: str) -> dict:
    if student_move == "testify" and ai_move == "testify":
        return {"student": 2, "ai": 2}
    if student_move == "testify" and ai_move == "silence":
        return {"student": 4, "ai": 1}
    if student_move == "silence" and ai_move == "testify":
        return {"student": 1, "ai": 4}
    if student_move == "silence" and ai_move == "silence":
        return {"student": 3, "ai": 3}

# Student makes a move
@app.post("/move")
def make_move(data: MoveRequest):
    session = sessions.get(data.session_id)
    if not session:
        return {"success": False, "message": "Session not found"}

    # Claude agent decides its move
    ai_move, ai_reasoning = get_ai_move(
        session["moves"],
        ai_strategy=session.get("ai_strategy", "rational")
    )

    payoff = get_payoff(data.student_move, ai_move)

    move_record = {
        "round": session["current_round"],
        "student_move": data.student_move,
        "ai_move": ai_move,
        "ai_reasoning": ai_reasoning,
        "student_payoff": payoff["student"],
        "ai_payoff": payoff["ai"]
    }

    session["moves"].append(move_record)
    session["total_student_score"] += payoff["student"]
    session["total_ai_score"] += payoff["ai"]
    session["current_round"] += 1

    game_over = session["current_round"] > 5

    if game_over:
        session["game_status"] = "complete"
        analysis = get_game_analysis(session)
        session["analysis"] = analysis
    else:
        analysis = None

    return {
        "success": True,
        "ai_move": ai_move,
        "ai_reasoning": ai_reasoning,
        "student_payoff": payoff["student"],
        "ai_payoff": payoff["ai"],
        "total_student_score": session["total_student_score"],
        "total_ai_score": session["total_ai_score"],
        "game_over": game_over,
        "analysis": analysis,
        "round": move_record["round"]
    }

# Claude generates end game analysis
def get_game_analysis(session: dict) -> str:
    moves = session["moves"]
    student_name = session["student_name"]

    history = ""
    for move in moves:
        history += f"Round {move['round']}: Student chose {move['student_move']}, AI chose {move['ai_move']}. Student got {move['student_payoff']} pts.\n"

    prompt = f"""You are a game theory professor analyzing a student's performance in the Prisoner's Dilemma.

Student name: {student_name}
Total rounds: 5
Student total score: {session['total_student_score']}
AI total score: {session['total_ai_score']}

Round by round history:
{history}

Write a 3-4 sentence analysis of this student's performance. 
Reference these specific concepts from Harrington Chapter 4:
- Dominant strategy (testify is always dominant)
- Nash Equilibrium (both testify = Nash Equilibrium)
- The core dilemma (individual rationality vs collective rationality)

Be specific about what this student did, what it tells us about their strategic thinking,
and what the game theory concept behind it is. Write directly to the student using their name.
Keep it educational and encouraging. Do not use any markdown formatting, asterisks, or special characters. Write in plain prose only."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()

# Professor sees all sessions live
@app.get("/professor/sessions")
def get_sessions():
    return {"sessions": list(sessions.values())}

# Professor sends hint to a student
@app.post("/professor/hint")
def send_hint(data: HintRequest):
    session = sessions.get(data.session_id)
    if not session:
        return {"success": False, "message": "Session not found"}
    session["hint"] = data.professor_message
    return {"success": True, "message": "Hint sent"}

# Student checks for hints
@app.get("/hint/{session_id}")
def get_hint(session_id: str):
    session = sessions.get(session_id)
    if not session:
        return {"hint": None}
    hint = session.get("hint")
    session["hint"] = None  # Clear after reading
    return {"hint": hint}

# Professor sets AI strategy
@app.post("/professor/strategy/{session_id}")
def set_strategy(session_id: str, strategy: str):
    session = sessions.get(session_id)
    if not session:
        return {"success": False}
    session["ai_strategy"] = strategy
    return {"success": True, "strategy": strategy}
# Professor gets live class stats
@app.get("/professor/stats")
def get_stats():
    all_sessions = list(sessions.values())
    total_students = len(all_sessions)
    
    total_cooperate = 0
    total_defect = 0
    
    for session in all_sessions:
        for move in session["moves"]:
            if move["student_move"] == "silence":
                total_cooperate += 1
            else:
                total_defect += 1
    
    return {
        "total_students": total_students,
        "total_cooperate": total_cooperate,
        "total_defect": total_defect,
        "sessions": all_sessions
    }

# Professor broadcasts message to all students
@app.post("/professor/broadcast")
def broadcast(data: HintRequest):
    message = data.professor_message
    for session in sessions.values():
        if session["game_status"] == "playing":
            session["hint"] = message
    return {"success": True, "message": "Broadcast sent to all students"}