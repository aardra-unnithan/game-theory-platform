from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import datetime
import anthropic
import os
from dotenv import load_dotenv
import json
import random
import string

load_dotenv()

app = FastAPI(title="Game Theory Learning Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

game_settings = {
    "prisoners_dilemma": {
        "total_rounds": 5,
        "agent_type": "rational",
        "payoff_matrix": {
            "both_silence": {"student": 3, "ai": 3},
            "student_testify_ai_silence": {"student": 4, "ai": 1},
            "student_silence_ai_testify": {"student": 1, "ai": 4},
            "both_testify": {"student": 2, "ai": 2},
        },
        "session_code": None,
        "active": False
    },
    "centipede": {
        "total_stages": 4,
        "agent_type": "rational",
        "session_code": None,
        "active": False,
        "initial_payoff_high": 0.40,
        "initial_payoff_low": 0.10,
        "multiplier": 2
    }
}


class JoinGame(BaseModel):
    student_name: str
    game_type: str
    session_code: str = None

class PDMoveRequest(BaseModel):
    session_id: str
    student_move: str

class CentipedeMoveRequest(BaseModel):
    session_id: str
    student_move: str

class HintRequest(BaseModel):
    session_id: str
    professor_message: str

class PDSettingsUpdate(BaseModel):
    total_rounds: int = None
    agent_type: str = None

class CentipedeSettingsUpdate(BaseModel):
    total_stages: int = None
    agent_type: str = None
    initial_payoff_high: float = None
    initial_payoff_low: float = None
    multiplier: float = None

class PayoffUpdate(BaseModel):
    both_silence_student: int
    both_silence_ai: int
    student_testify_ai_silence_student: int
    student_testify_ai_silence_ai: int
    student_silence_ai_testify_student: int
    student_silence_ai_testify_ai: int
    both_testify_student: int
    both_testify_ai: int

class SessionCodeRequest(BaseModel):
    game_type: str


def generate_session_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def get_centipede_payoffs(stage: int, settings: dict) -> dict:
    high = settings["initial_payoff_high"] * (settings["multiplier"] ** (stage - 1))
    low = settings["initial_payoff_low"] * (settings["multiplier"] ** (stage - 1))
    if stage % 2 == 1:
        return {"student": round(high, 2), "ai": round(low, 2)}
    else:
        return {"student": round(low, 2), "ai": round(high, 2)}


def get_final_centipede_payoffs(settings: dict, total_stages: int = 4) -> dict:
    high = settings["initial_payoff_high"] * (settings["multiplier"] ** total_stages)
    low = settings["initial_payoff_low"] * (settings["multiplier"] ** total_stages)
    return {"student": round(high, 2), "ai": round(low, 2)}


@app.get("/")
def root():
    return {"message": "Game Theory Platform is running"}


@app.post("/join")
def join_game(data: JoinGame):
    settings = game_settings.get(data.game_type)
    if not settings:
        return {"success": False, "message": "Invalid game type"}

    if settings["session_code"] and data.session_code != settings["session_code"]:
        return {"success": False, "message": "Invalid session code"}

    session_id = str(uuid.uuid4())

    if data.game_type == "prisoners_dilemma":
        sessions[session_id] = {
            "session_id": session_id,
            "game_type": "prisoners_dilemma",
            "student_name": data.student_name,
            "joined_at": str(datetime.datetime.now()),
            "game_status": "playing",
            "moves": [],
            "total_student_score": 0,
            "total_ai_score": 0,
            "current_round": 1,
            "total_rounds": settings["total_rounds"],
            "agent_type": settings["agent_type"],
            "payoff_matrix": settings["payoff_matrix"].copy(),
            "hint": None
        }
        return {
            "success": True,
            "session_id": session_id,
            "message": f"Welcome {data.student_name}!",
            "total_rounds": settings["total_rounds"]
        }

    elif data.game_type == "centipede":
        sessions[session_id] = {
            "session_id": session_id,
            "game_type": "centipede",
            "student_name": data.student_name,
            "joined_at": str(datetime.datetime.now()),
            "game_status": "playing",
            "moves": [],
            "current_stage": 1,
            "total_stages": settings["total_stages"],
            "agent_type": settings["agent_type"],
            "student_total": 0,
            "ai_total": 0,
            "hint": None,
            "settings": {
                "initial_payoff_high": settings["initial_payoff_high"],
                "initial_payoff_low": settings["initial_payoff_low"],
                "multiplier": settings["multiplier"]
            }
        }
        return {
            "success": True,
            "session_id": session_id,
            "message": f"Welcome {data.student_name}!",
            "total_stages": settings["total_stages"]
        }


def get_pd_payoff(student_move: str, ai_move: str, payoff_matrix: dict) -> dict:
    if student_move == "testify" and ai_move == "testify":
        return payoff_matrix["both_testify"]
    if student_move == "testify" and ai_move == "silence":
        return payoff_matrix["student_testify_ai_silence"]
    if student_move == "silence" and ai_move == "testify":
        return payoff_matrix["student_silence_ai_testify"]
    return payoff_matrix["both_silence"]


def get_pd_ai_move(moves_history: list, agent_type: str, payoff_matrix: dict) -> tuple:
    history_text = "This is the first round." if not moves_history else "\n".join(
        [f"Round {i+1}: Student chose {m['student_move']}, AI chose {m['ai_move']}. Student got {m['student_payoff']} pts, AI got {m['ai_payoff']} pts."
         for i, m in enumerate(moves_history)]
    )

    payoff_info = f"""
Payoff matrix:
- Both Silence: Student gets {payoff_matrix['both_silence']['student']}, AI gets {payoff_matrix['both_silence']['ai']}
- Student Testifies AI Silent: Student gets {payoff_matrix['student_testify_ai_silence']['student']}, AI gets {payoff_matrix['student_testify_ai_silence']['ai']}
- Student Silent AI Testifies: Student gets {payoff_matrix['student_silence_ai_testify']['student']}, AI gets {payoff_matrix['student_silence_ai_testify']['ai']}
- Both Testify: Student gets {payoff_matrix['both_testify']['student']}, AI gets {payoff_matrix['both_testify']['ai']}
"""

    if agent_type == "rational":
        prompt = f"""You are an AI playing Prisoner's Dilemma using rational game theory.
{payoff_info}
History: {history_text}
Play rationally to maximize your score.
Respond with ONLY this exact JSON on one line:
{{"move": "silence", "reasoning": "brief reason"}} or {{"move": "testify", "reasoning": "brief reason"}}"""

    elif agent_type == "adaptive":
        prompt = f"""You are an AI playing Prisoner's Dilemma. Study the student's pattern and adapt.
{payoff_info}
History: {history_text}
Analyze the student's pattern and decide based on what maximizes your score.
Respond with ONLY this exact JSON on one line:
{{"move": "silence", "reasoning": "brief reason"}} or {{"move": "testify", "reasoning": "brief reason"}}"""

    else:
        prompt = f"""You are playing a game. Two players choose silence or testify simultaneously.
{payoff_info}
History: {history_text}
Make your decision based purely on the situation.
Respond with ONLY this exact JSON on one line:
{{"move": "silence", "reasoning": "brief reason"}} or {{"move": "testify", "reasoning": "brief reason"}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = response.content[0].text.strip()

    if not response_text:
        return "testify", "Default rational choice"

    if "```" in response_text:
        parts = response_text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                response_text = part
                break

    try:
        parsed = json.loads(response_text)
        return parsed["move"], parsed["reasoning"]
    except json.JSONDecodeError:
        if "silence" in response_text.lower():
            return "silence", "AI chose silence"
        return "testify", "AI chose testify"


@app.post("/move/pd")
def pd_move(data: PDMoveRequest):
    session = sessions.get(data.session_id)
    if not session or session["game_type"] != "prisoners_dilemma":
        return {"success": False, "message": "Session not found"}

    pd_settings = game_settings["prisoners_dilemma"]
    session["agent_type"] = pd_settings["agent_type"]
    session["payoff_matrix"] = pd_settings["payoff_matrix"].copy()

    ai_move, ai_reasoning = get_pd_ai_move(
        session["moves"], session["agent_type"], session["payoff_matrix"]
    )
    payoff = get_pd_payoff(data.student_move, ai_move, session["payoff_matrix"])

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

    game_over = session["current_round"] > session["total_rounds"]
    analysis = None

    if game_over:
        session["game_status"] = "complete"
        analysis = get_pd_analysis(session)
        session["analysis"] = analysis

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
        "round": move_record["round"],
        "total_rounds": session["total_rounds"]
    }


def get_pd_analysis(session: dict) -> str:
    moves = session["moves"]
    history = "\n".join([
        f"Round {m['round']}: Student chose {m['student_move']}, AI chose {m['ai_move']}. Student got {m['student_payoff']} pts."
        for m in moves
    ])
    prompt = f"""You are a game theory professor analyzing a student's Prisoner's Dilemma performance.
Student: {session['student_name']}
Total rounds: {session['total_rounds']}
Student score: {session['total_student_score']}
AI score: {session['total_ai_score']}
Agent type: {session['agent_type']}
History:
{history}

Write 3 sentences analyzing this student's performance. Reference dominant strategy, Nash Equilibrium, and the dilemma between individual and collective rationality. Write directly to the student. No markdown, no asterisks, plain prose only."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()


def get_centipede_ai_move(session: dict) -> tuple:
    current_stage = session["current_stage"]
    total_stages = session["total_stages"]
    settings = session["settings"]
    moves_history = session["moves"]
    agent_type = session["agent_type"]

    payoff_table = []
    for stage in range(1, total_stages + 1):
        p = get_centipede_payoffs(stage, settings)
        mover = "Student (A)" if stage % 2 == 1 else "AI (B)"
        payoff_table.append(
            f"Stage {stage} — {mover} stops: Student gets {p['student']}, AI gets {p['ai']}"
        )

    final = get_final_centipede_payoffs(settings, total_stages)
    payoff_table.append(
        f"Final auto-stop: Student gets {final['student']}, AI gets {final['ai']}"
    )

    history_text = "No moves yet." if not moves_history else "\n".join(
        [f"Stage {m['stage']}: {m['mover']} chose {m['move']}" for m in moves_history]
    )

    if agent_type == "rational":
        prompt = f"""You are an AI playing the Centipede Game as Player B using backward induction.
Current stage: {current_stage} of {total_stages}. It is YOUR turn as Player B.
Payoff table:
{chr(10).join(payoff_table)}
Game history:
{history_text}
Use backward induction to decide your move.
Respond with ONLY this exact JSON on one line:
{{"move": "stop", "reasoning": "brief reason"}} or {{"move": "continue", "reasoning": "brief reason"}}"""

    elif agent_type == "adaptive":
        prompt = f"""You are an AI playing the Centipede Game as Player B. Study the student's pattern.
Current stage: {current_stage} of {total_stages}. It is YOUR turn as Player B.
Payoff table:
{chr(10).join(payoff_table)}
Game history:
{history_text}
Analyze the student's pattern and decide your move.
Respond with ONLY this exact JSON on one line:
{{"move": "stop", "reasoning": "brief reason"}} or {{"move": "continue", "reasoning": "brief reason"}}"""

    else:
        prompt = f"""You are playing a game as Player B. Choose Stop or Continue.
Current stage: {current_stage} of {total_stages}.
Payoff table:
{chr(10).join(payoff_table)}
History: {history_text}
Respond with ONLY this exact JSON on one line:
{{"move": "stop", "reasoning": "brief reason"}} or {{"move": "continue", "reasoning": "brief reason"}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = response.content[0].text.strip()

    if not response_text:
        return "stop", "No response from AI"

    if "```" in response_text:
        parts = response_text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                response_text = part
                break

    try:
        parsed = json.loads(response_text)
        return parsed["move"], parsed["reasoning"]
    except json.JSONDecodeError:
        if "continue" in response_text.lower():
            return "continue", "AI decided to continue"
        return "stop", "AI decided to stop"


@app.post("/move/centipede")
def centipede_move(data: CentipedeMoveRequest):
    session = sessions.get(data.session_id)
    if not session or session["game_type"] != "centipede":
        return {"success": False, "message": "Session not found"}

    current_stage = session["current_stage"]
    total_stages = session["total_stages"]
    settings = session["settings"]

    session["agent_type"] = game_settings["centipede"]["agent_type"]

    student_move = data.student_move
    session["moves"].append({
        "stage": current_stage,
        "mover": "Student (A)",
        "move": student_move
    })

    if student_move == "stop":
        payoff = get_centipede_payoffs(current_stage, settings)
        session["student_total"] = payoff["student"]
        session["ai_total"] = payoff["ai"]
        session["game_status"] = "complete"
        analysis = get_centipede_analysis(session)
        session["analysis"] = analysis
        return {
            "success": True,
            "game_over": True,
            "stopped_by": "student",
            "stage": current_stage,
            "student_payoff": payoff["student"],
            "ai_payoff": payoff["ai"],
            "analysis": analysis,
            "moves": session["moves"]
        }

    next_stage = current_stage + 1

    if next_stage > total_stages:
        payoff = get_final_centipede_payoffs(settings, total_stages)
        session["student_total"] = payoff["student"]
        session["ai_total"] = payoff["ai"]
        session["game_status"] = "complete"
        session["moves"].append({
            "stage": next_stage,
            "mover": "Auto",
            "move": "stop"
        })
        analysis = get_centipede_analysis(session)
        session["analysis"] = analysis
        return {
            "success": True,
            "game_over": True,
            "stopped_by": "auto",
            "stage": next_stage,
            "student_payoff": payoff["student"],
            "ai_payoff": payoff["ai"],
            "analysis": analysis,
            "moves": session["moves"]
        }

    session["current_stage"] = next_stage
    ai_move, ai_reasoning = get_centipede_ai_move(session)

    session["moves"].append({
        "stage": next_stage,
        "mover": "AI (B)",
        "move": ai_move,
        "reasoning": ai_reasoning
    })

    if ai_move == "stop":
        payoff = get_centipede_payoffs(next_stage, settings)
        session["student_total"] = payoff["student"]
        session["ai_total"] = payoff["ai"]
        session["game_status"] = "complete"
        analysis = get_centipede_analysis(session)
        session["analysis"] = analysis
        return {
            "success": True,
            "game_over": True,
            "stopped_by": "ai",
            "stage": next_stage,
            "ai_move": ai_move,
            "ai_reasoning": ai_reasoning,
            "student_payoff": payoff["student"],
            "ai_payoff": payoff["ai"],
            "analysis": analysis,
            "moves": session["moves"]
        }

    session["current_stage"] = next_stage + 1
    return {
        "success": True,
        "game_over": False,
        "ai_move": ai_move,
        "ai_reasoning": ai_reasoning,
        "current_stage": session["current_stage"],
        "total_stages": total_stages,
        "moves": session["moves"]
    }


def get_centipede_analysis(session: dict) -> str:
    moves = session["moves"]
    history = "\n".join([
        f"Stage {m['stage']}: {m['mover']} chose {m['move']}"
        for m in moves
    ])
    prompt = f"""You are a game theory professor analyzing a student's Centipede Game performance.
Student: {session['student_name']}
Total stages available: {session['total_stages']}
Student earnings: {session['student_total']}
AI earnings: {session['ai_total']}
Move history:
{history}

Write 3 sentences analyzing this student's performance. Reference backward induction and subgame perfect Nash equilibrium. Explain what the student's choices reveal about strategic thinking versus human behavior. Write directly to the student. No markdown, plain prose only."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()


@app.post("/professor/hint")
def send_hint(data: HintRequest):
    session = sessions.get(data.session_id)
    if not session:
        return {"success": False}
    session["hint"] = data.professor_message
    return {"success": True}


@app.get("/hint/{session_id}")
def get_hint(session_id: str):
    session = sessions.get(session_id)
    if not session:
        return {"hint": None}
    hint = session.get("hint")
    session["hint"] = None
    return {"hint": hint}


@app.post("/professor/broadcast")
def broadcast(data: HintRequest):
    for session in sessions.values():
        if session["game_status"] == "playing":
            session["hint"] = data.professor_message
    return {"success": True}


@app.get("/professor/stats")
def get_stats():
    all_sessions = list(sessions.values())
    pd_sessions = [s for s in all_sessions if s["game_type"] == "prisoners_dilemma"]
    centipede_sessions = [s for s in all_sessions if s["game_type"] == "centipede"]

    pd_cooperate = sum(1 for s in pd_sessions for m in s["moves"] if m["student_move"] == "silence")
    pd_defect = sum(1 for s in pd_sessions for m in s["moves"] if m["student_move"] == "testify")

    centipede_stop = sum(
        1 for s in centipede_sessions
        for m in s["moves"]
        if m.get("mover") == "Student (A)" and m["move"] == "stop"
    )
    centipede_continue = sum(
        1 for s in centipede_sessions
        for m in s["moves"]
        if m.get("mover") == "Student (A)" and m["move"] == "continue"
    )

    return {
        "total_students": len(all_sessions),
        "prisoners_dilemma": {
            "sessions": pd_sessions,
            "total_cooperate": pd_cooperate,
            "total_defect": pd_defect
        },
        "centipede": {
            "sessions": centipede_sessions,
            "total_stop": centipede_stop,
            "total_continue": centipede_continue
        },
        "game_settings": game_settings
    }


@app.post("/professor/settings/pd")
def update_pd_settings(data: PDSettingsUpdate):
    if data.total_rounds is not None:
        game_settings["prisoners_dilemma"]["total_rounds"] = data.total_rounds
    if data.agent_type is not None:
        game_settings["prisoners_dilemma"]["agent_type"] = data.agent_type
    return {"success": True, "settings": game_settings["prisoners_dilemma"]}


@app.post("/professor/settings/centipede")
def update_centipede_settings(data: CentipedeSettingsUpdate):
    if data.total_stages is not None:
        game_settings["centipede"]["total_stages"] = data.total_stages
    if data.agent_type is not None:
        game_settings["centipede"]["agent_type"] = data.agent_type
    if data.initial_payoff_high is not None:
        game_settings["centipede"]["initial_payoff_high"] = data.initial_payoff_high
    if data.initial_payoff_low is not None:
        game_settings["centipede"]["initial_payoff_low"] = data.initial_payoff_low
    if data.multiplier is not None:
        game_settings["centipede"]["multiplier"] = data.multiplier
    return {"success": True, "settings": game_settings["centipede"]}


@app.post("/professor/payoff/pd")
def update_pd_payoff(data: PayoffUpdate):
    game_settings["prisoners_dilemma"]["payoff_matrix"] = {
        "both_silence": {
            "student": data.both_silence_student,
            "ai": data.both_silence_ai
        },
        "student_testify_ai_silence": {
            "student": data.student_testify_ai_silence_student,
            "ai": data.student_testify_ai_silence_ai
        },
        "student_silence_ai_testify": {
            "student": data.student_silence_ai_testify_student,
            "ai": data.student_silence_ai_testify_ai
        },
        "both_testify": {
            "student": data.both_testify_student,
            "ai": data.both_testify_ai
        }
    }
    return {"success": True}


@app.post("/professor/session-code")
def generate_session_code_endpoint(data: SessionCodeRequest):
    code = generate_session_code()
    if data.game_type in game_settings:
        game_settings[data.game_type]["session_code"] = code
    return {"success": True, "session_code": code}


@app.post("/professor/clear-session-code")
def clear_session_code(data: SessionCodeRequest):
    if data.game_type in game_settings:
        game_settings[data.game_type]["session_code"] = None
    return {"success": True}


@app.get("/game/settings")
def get_game_settings():
    return game_settings