import { useState } from "react";
import Landing from "./Landing";
import Game from "./Game";
import CentipedeGame from "./CentipedeGame";
import Results from "./Results";
import CentipedeResults from "./CentipedeResults";
import Dashboard from "./Dashboard";

const API = "http://192.168.1.114:8000";

function App() {
  const [page, setPage] = useState("landing");
  const [selectedGame, setSelectedGame] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [gameData, setGameData] = useState(null);
  const [totalRounds, setTotalRounds] = useState(5);
  const [totalStages, setTotalStages] = useState(4);
  const [profError, setProfError] = useState("");

  const PROF_PASSWORD = "DrPal@26";

  const handleStartGame = (game) => {
    setSelectedGame(game);
    setPage("intro");
  };

  const handleJoin = async (name, sessionCode) => {
    const body = {
      student_name: name,
      game_type: selectedGame.gameType,
    };
    if (sessionCode) body.session_code = sessionCode;

    const res = await fetch(`${API}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      setStudentName(name);
      setSessionId(data.session_id);
      if (data.total_rounds) setTotalRounds(data.total_rounds);
      if (data.total_stages) setTotalStages(data.total_stages);
      setPage("game");
    } else {
      return data.message;
    }
  };

  const handleGameComplete = (data) => {
    setGameData(data);
    setPage("results");
  };

  const handleProfLogin = (password) => {
    if (password === PROF_PASSWORD) {
      setPage("dashboard");
      setProfError("");
    } else {
      setProfError("Incorrect password.");
    }
  };

  const handleBack = () => {
    setPage("landing");
    setStudentName("");
    setSessionId("");
    setGameData(null);
    setSelectedGame(null);
    setProfError("");
  };

  if (page === "landing") {
    return (
      <Landing
        onStartGame={handleStartGame}
        onProfessor={() => setPage("professor")}
      />
    );
  }

  if (page === "intro") {
    return (
      <IntroPage
        game={selectedGame}
        onJoin={handleJoin}
        onBack={() => setPage("landing")}
      />
    );
  }

  if (page === "game") {
    if (selectedGame?.gameType === "centipede") {
      return (
        <CentipedeGame
          studentName={studentName}
          sessionId={sessionId}
          totalStages={totalStages}
          onComplete={handleGameComplete}
          onBack={handleBack}
          api={API}
        />
      );
    }
    return (
      <Game
        studentName={studentName}
        sessionId={sessionId}
        totalRounds={totalRounds}
        onComplete={handleGameComplete}
        onBack={handleBack}
        api={API}
      />
    );
  }

  if (page === "results") {
    if (selectedGame?.gameType === "centipede") {
      return (
        <CentipedeResults
          studentName={studentName}
          gameData={gameData}
          onPlayAgain={() => setPage("intro")}
          onBack={handleBack}
        />
      );
    }
    return (
      <Results
        studentName={studentName}
        moves={gameData.moves}
        totalScore={gameData.totalScore}
        analysis={gameData.analysis}
        onPlayAgain={() => setPage("intro")}
        onBack={handleBack}
      />
    );
  }

  if (page === "professor") {
    return (
      <ProfLogin
        onLogin={handleProfLogin}
        onBack={() => setPage("landing")}
        error={profError}
      />
    );
  }

  if (page === "dashboard") {
    return <Dashboard onBack={handleBack} api={API} />;
  }
}

function IntroPage({ game, onJoin, onBack }) {
  const [studentName, setStudentName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    setError("");
    const err = await onJoin(studentName, sessionCode || null);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.left}>
          <h2 style={s.title}>{game.title}</h2>
          <p style={s.desc}>{game.story}</p>
          {game.gameType === "prisoners_dilemma" && (
            <div style={s.dealGrid}>
              <div style={s.dealItem}>
                <p style={s.dealNumber}>3, 3</p>
                <p style={s.dealLabel}>Both stay silent</p>
              </div>
              <div style={s.dealItem}>
                <p style={s.dealNumber}>4, 1</p>
                <p style={s.dealLabel}>You testify, they silent</p>
              </div>
              <div style={s.dealItem}>
                <p style={s.dealNumber}>1, 4</p>
                <p style={s.dealLabel}>You silent, they testify</p>
              </div>
              <div style={s.dealItem}>
                <p style={s.dealNumber}>2, 2</p>
                <p style={s.dealLabel}>Both testify</p>
              </div>
            </div>
          )}
          {game.gameType === "centipede" && (
            <div style={s.centipedeInfo}>
              <p style={s.infoTitle}>How it works</p>
              <p style={s.infoText}>
                You are Player A and go first. Each stage you choose Stop or
                Continue. If you Continue, the AI decides next. Payoffs grow
                each stage but whoever Stops gets the bigger share right now.
              </p>
              <div style={s.stageGrid}>
                <div style={s.stageItem}>
                  <p style={s.stageNum}>Stage 1</p>
                  <p style={s.stagePayoff}>You stop: $0.40 / $0.10</p>
                </div>
                <div style={s.stageItem}>
                  <p style={s.stageNum}>Stage 2</p>
                  <p style={s.stagePayoff}>AI stops: $0.20 / $0.80</p>
                </div>
                <div style={s.stageItem}>
                  <p style={s.stageNum}>Stage 3</p>
                  <p style={s.stagePayoff}>You stop: $1.60 / $0.40</p>
                </div>
                <div style={s.stageItem}>
                  <p style={s.stageNum}>Stage 4</p>
                  <p style={s.stagePayoff}>AI stops: $0.80 / $3.20</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={s.right}>
          <p style={s.eyebrow}>Enter your details to begin</p>
          <input
            style={s.input}
            type="text"
            placeholder="Your first name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <input
            style={s.inputOptional}
            type="text"
            placeholder="Session code (optional)"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
          />
          {error && <p style={s.errorText}>{error}</p>}
          <button
            style={{ ...s.primaryBtn, opacity: studentName ? 1 : 0.4 }}
            onClick={handleJoin}
            disabled={loading || !studentName}
          >
            {loading ? "Entering..." : "Enter the Game"}
          </button>
          <button style={s.backBtn} onClick={onBack}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfLogin({ onLogin, onBack, error }) {
  const [password, setPassword] = useState("");

  return (
    <div style={s.page}>
      <div style={s.loginCard}>
        <p style={s.eyebrow}>Professor Access</p>
        <h2 style={s.title}>Dashboard Login</h2>
        <p style={s.desc}>
          Enter your password to access the live student dashboard.
        </p>
        <input
          style={s.input}
          type="password"
          placeholder="Enter professor password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin(password)}
        />
        {error && <p style={s.errorText}>{error}</p>}
        <button style={s.primaryBtn} onClick={() => onLogin(password)}>
          Enter Dashboard
        </button>
        <button style={s.backBtn} onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  inner: {
    maxWidth: "1100px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "80px",
    alignItems: "center",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  loginCard: {
    maxWidth: "500px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  eyebrow: {
    fontSize: "11px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "3px",
    margin: 0,
    fontWeight: "700",
  },
  title: {
    fontSize: "48px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "900",
    lineHeight: "1.1",
    letterSpacing: "-1px",
  },
  desc: {
    fontSize: "16px",
    color: "#aaaaaa",
    lineHeight: "1.8",
    margin: 0,
  },
  dealGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  dealItem: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
  },
  dealNumber: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#c0392b",
    margin: "0 0 4px 0",
  },
  dealLabel: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
  },
  centipedeInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoTitle: {
    fontSize: "12px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  infoText: {
    fontSize: "15px",
    color: "#aaaaaa",
    lineHeight: "1.8",
    margin: 0,
  },
  stageGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  stageItem: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "center",
  },
  stageNum: {
    fontSize: "12px",
    color: "#c0392b",
    fontWeight: "700",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  stagePayoff: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
  },
  input: {
    padding: "16px 20px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    fontSize: "16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    outline: "none",
  },
  inputOptional: {
    padding: "14px 20px",
    borderRadius: "8px",
    border: "1px solid #222",
    backgroundColor: "#141414",
    color: "#888",
    fontSize: "14px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "700",
  },
  backBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
  },
  errorText: {
    color: "#c0392b",
    fontSize: "14px",
    margin: 0,
  },
};

export default App;