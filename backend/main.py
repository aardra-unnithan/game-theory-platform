from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pathlib
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
    },
    "centipede": {
        "total_stages": 4,
        "agent_type": "rational",
        "session_code": None,
        "initial_payoff_high": 0.40,
        "initial_payoff_low": 0.10,
        "multiplier": 2
    },
    "travelers_dilemma": {
        "total_rounds": 5,
        "agent_type": "rational",
        "session_code": None,
        "min_claim": 4.0,
        "max_claim": 8.0,
        "increment": 0.5,
        "penalty_reward": 1.0
    }
}


# --- MODELS ---

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

class TravelerMoveRequest(BaseModel):
    session_id: str
    student_claim: float

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

class TravelerSettingsUpdate(BaseModel):
    total_rounds: int = None
    agent_type: str = None
    min_claim: float = None
    max_claim: float = None
    penalty_reward: float = None

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


# --- HELPERS ---

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


def get_traveler_payoff(student_claim: float, ai_claim: float, penalty_reward: float) -> dict:
    if student_claim == ai_claim:
        return {"student": round(student_claim, 2), "ai": round(ai_claim, 2)}
    lower = min(student_claim, ai_claim)
    if student_claim < ai_claim:
        return {
            "student": round(lower + penalty_reward, 2),
            "ai": round(lower - penalty_reward, 2)
        }
    else:
        return {
            "student": round(lower - penalty_reward, 2),
            "ai": round(lower + penalty_reward, 2)
        }


# --- ROOT ---

@app.get("/")
def root():
    return {"message": "Game Theory Platform is running"}


# --- JOIN ---

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

    elif data.game_type == "travelers_dilemma":
        sessions[session_id] = {
            "session_id": session_id,
            "game_type": "travelers_dilemma",
            "student_name": data.student_name,
            "joined_at": str(datetime.datetime.now()),
            "game_status": "playing",
            "moves": [],
            "total_student_score": 0,
            "total_ai_score": 0,
            "current_round": 1,
            "total_rounds": settings["total_rounds"],
            "agent_type": settings["agent_type"],
            "min_claim": settings["min_claim"],
            "max_claim": settings["max_claim"],
            "increment": settings["increment"],
            "penalty_reward": settings["penalty_reward"],
            "hint": None
        }
        return {
            "success": True,
            "session_id": session_id,
            "message": f"Welcome {data.student_name}!",
            "total_rounds": settings["total_rounds"],
            "min_claim": settings["min_claim"],
            "max_claim": settings["max_claim"],
            "increment": settings["increment"],
            "penalty_reward": settings["penalty_reward"]
        }


# --- PRISONER'S DILEMMA ---

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
Play rationally to maximize your score. Testify is the dominant strategy.
Respond with ONLY this exact JSON on one line:
{{"move": "silence", "reasoning": "brief reason"}} or {{"move": "testify", "reasoning": "brief reason"}}"""

    elif agent_type == "adaptive":
        prompt = f"""You are an AI playing Prisoner's Dilemma like a human would.
{payoff_info}
History: {history_text}
Play like a human — start cooperatively, build trust, reciprocate what the student does. Humans tend to stay silent more than game theory predicts. Mirror the student's behavior with a slight cooperative bias.
Respond with ONLY this exact JSON on one line:
{{"move": "silence", "reasoning": "brief reason"}} or {{"move": "testify", "reasoning": "brief reason"}}"""

    else:
        prompt = f"""You are playing a game. Two players choose silence or testify simultaneously.
{payoff_info}
History: {history_text}
Make your decision based purely on the situation with no strategic guidance.
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


# --- CENTIPEDE ---

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
        prompt = f"""You are an AI playing the Centipede Game as Player B like a human would.
Current stage: {current_stage} of {total_stages}. It is YOUR turn as Player B.
Payoff table:
{chr(10).join(payoff_table)}
Game history:
{history_text}
Play like a human — humans almost never stop early. They tend to continue longer than rational theory predicts, driven by trust and optimism. Mirror the student's cooperative behavior and continue unless the student has been stopping early.
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


# --- TRAVELER'S DILEMMA ---

def get_traveler_ai_claim(moves_history: list, agent_type: str, session: dict) -> tuple:
    min_claim = session["min_claim"]
    max_claim = session["max_claim"]
    increment = session["increment"]
    penalty_reward = session["penalty_reward"]

    history_text = "This is the first round." if not moves_history else "\n".join(
        [f"Round {i+1}: Student claimed ${m['student_claim']}, AI claimed ${m['ai_claim']}. Student earned ${m['student_payoff']}, AI earned ${m['ai_payoff']}."
         for i, m in enumerate(moves_history)]
    )

    claims = []
    c = min_claim
    while c <= max_claim:
        claims.append(f"${c:.2f}")
        c += increment
    valid_claims = ", ".join(claims)

    if agent_type == "rational":
        prompt = f"""You are an AI playing the Traveler's Dilemma using iterated dominance reasoning.

Rules:
- Both you and the student independently choose a claim between ${min_claim} and ${max_claim} in ${increment} increments
- Both receive the LOWER of the two claims
- The lower claimer gets +${penalty_reward} reward
- The higher claimer gets -${penalty_reward} penalty
- If claims are equal both receive that amount

Valid claims: {valid_claims}

History:
{history_text}

Rational strategy: use iterated dominance — there is always incentive to undercut by ${increment}. Play toward the minimum claim of ${min_claim}.

Respond with ONLY this exact JSON on one line:
{{"claim": 4.0, "reasoning": "brief reason"}}"""

    elif agent_type == "adaptive":
        prompt = f"""You are an AI playing the Traveler's Dilemma like a human would.

Rules:
- Both you and the student independently choose a claim between ${min_claim} and ${max_claim} in ${increment} increments
- Both receive the LOWER of the two claims
- The lower claimer gets +${penalty_reward} reward
- The higher claimer gets -${penalty_reward} penalty
- If claims are equal both receive that amount

Valid claims: {valid_claims}

History:
{history_text}

Play like a human — humans typically claim much higher than the Nash equilibrium of ${min_claim}. They often claim around the middle or high range. Mirror what the student is doing with a slight upward bias toward higher claims. Be cooperative and trusting.

Respond with ONLY this exact JSON on one line:
{{"claim": 7.0, "reasoning": "brief reason"}}"""

    else:
        prompt = f"""You are playing the Traveler's Dilemma. Choose a claim amount.

Rules:
- Both you and the student independently choose a claim between ${min_claim} and ${max_claim} in ${increment} increments
- Both receive the LOWER of the two claims
- The lower claimer gets +${penalty_reward} reward
- The higher claimer gets -${penalty_reward} penalty

Valid claims: {valid_claims}

History:
{history_text}

Make your decision freely with no strategic guidance.

Respond with ONLY this exact JSON on one line:
{{"claim": 6.0, "reasoning": "brief reason"}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = response.content[0].text.strip()

    if not response_text:
        return min_claim, "Default minimum claim"

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
        claim = float(parsed["claim"])
        # Validate and round to nearest increment
        claim = max(min_claim, min(max_claim, claim))
        claim = round(round(claim / increment) * increment, 2)
        return claim, parsed.get("reasoning", "AI made a claim")
    except (json.JSONDecodeError, KeyError, ValueError):
        return min_claim, "AI chose minimum claim"


@app.post("/move/travelers")
def travelers_move(data: TravelerMoveRequest):
    session = sessions.get(data.session_id)
    if not session or session["game_type"] != "travelers_dilemma":
        return {"success": False, "message": "Session not found"}

    td_settings = game_settings["travelers_dilemma"]
    session["agent_type"] = td_settings["agent_type"]
    session["penalty_reward"] = td_settings["penalty_reward"]

    student_claim = round(data.student_claim, 2)
    ai_claim, ai_reasoning = get_traveler_ai_claim(
        session["moves"], session["agent_type"], session
    )

    payoff = get_traveler_payoff(student_claim, ai_claim, session["penalty_reward"])

    move_record = {
        "round": session["current_round"],
        "student_claim": student_claim,
        "ai_claim": ai_claim,
        "ai_reasoning": ai_reasoning,
        "student_payoff": payoff["student"],
        "ai_payoff": payoff["ai"]
    }

    session["moves"].append(move_record)
    session["total_student_score"] = round(session["total_student_score"] + payoff["student"], 2)
    session["total_ai_score"] = round(session["total_ai_score"] + payoff["ai"], 2)
    session["current_round"] += 1

    game_over = session["current_round"] > session["total_rounds"]
    analysis = None

    if game_over:
        session["game_status"] = "complete"
        analysis = get_traveler_analysis(session)
        session["analysis"] = analysis

    return {
        "success": True,
        "ai_claim": ai_claim,
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


def get_traveler_analysis(session: dict) -> str:
    moves = session["moves"]
    history = "\n".join([
        f"Round {m['round']}: Student claimed ${m['student_claim']}, AI claimed ${m['ai_claim']}. Student earned ${m['student_payoff']}."
        for m in moves
    ])
    avg_claim = sum(m["student_claim"] for m in moves) / len(moves) if moves else 0

    prompt = f"""You are a game theory professor analyzing a student's Traveler's Dilemma performance.
Student: {session['student_name']}
Total rounds: {session['total_rounds']}
Student total earnings: ${session['total_student_score']}
AI total earnings: ${session['total_ai_score']}
Student average claim: ${avg_claim:.2f}
Claim range: ${session['min_claim']} to ${session['max_claim']}
Nash Equilibrium prediction: ${session['min_claim']} (minimum claim)
History:
{history}

Write 3 sentences analyzing this student's performance. Reference iterated dominance reasoning — the Nash equilibrium predicts claiming the minimum but humans consistently claim higher. Explain what the student's average claim reveals about their strategic thinking versus the theory. Write directly to the student. No markdown, plain prose only."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()


# --- HINTS ---

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


# --- PROFESSOR STATS ---

@app.get("/professor/stats")
def get_stats():
    all_sessions = list(sessions.values())
    pd_sessions = [s for s in all_sessions if s["game_type"] == "prisoners_dilemma"]
    centipede_sessions = [s for s in all_sessions if s["game_type"] == "centipede"]
    td_sessions = [s for s in all_sessions if s["game_type"] == "travelers_dilemma"]

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

    td_avg_claim = 0
    td_total_moves = sum(len(s["moves"]) for s in td_sessions)
    if td_total_moves > 0:
        td_avg_claim = sum(
            m["student_claim"] for s in td_sessions for m in s["moves"]
        ) / td_total_moves

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
        "travelers_dilemma": {
            "sessions": td_sessions,
            "avg_claim": round(td_avg_claim, 2),
            "total_moves": td_total_moves
        },
        "game_settings": game_settings
    }


# --- PROFESSOR SETTINGS ---

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


@app.post("/professor/settings/travelers")
def update_travelers_settings(data: TravelerSettingsUpdate):
    if data.total_rounds is not None:
        game_settings["travelers_dilemma"]["total_rounds"] = data.total_rounds
    if data.agent_type is not None:
        game_settings["travelers_dilemma"]["agent_type"] = data.agent_type
    if data.min_claim is not None:
        game_settings["travelers_dilemma"]["min_claim"] = data.min_claim
    if data.max_claim is not None:
        game_settings["travelers_dilemma"]["max_claim"] = data.max_claim
    if data.penalty_reward is not None:
        game_settings["travelers_dilemma"]["penalty_reward"] = data.penalty_reward
    return {"success": True, "settings": game_settings["travelers_dilemma"]}


@app.post("/professor/payoff/pd")
def update_pd_payoff(data: PayoffUpdate):
    game_settings["prisoners_dilemma"]["payoff_matrix"] = {
        "both_silence": {"student": data.both_silence_student, "ai": data.both_silence_ai},
        "student_testify_ai_silence": {"student": data.student_testify_ai_silence_student, "ai": data.student_testify_ai_silence_ai},
        "student_silence_ai_testify": {"student": data.student_silence_ai_testify_student, "ai": data.student_silence_ai_testify_ai},
        "both_testify": {"student": data.both_testify_student, "ai": data.both_testify_ai}
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
