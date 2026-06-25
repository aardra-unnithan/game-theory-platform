import { useState } from "react";
import Landing from "./Landing";
import Game from "./Game";
import Results from "./Results";
import Dashboard from "./Dashboard";

const API = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("landing");
  const [studentName, setStudentName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [gameData, setGameData] = useState(null);

  // Professor state
  const [profPassword, setProfPassword] = useState("");
  const [profError, setProfError] = useState("");

  const PROF_PASSWORD = "DrPal@26";

  const handleStartGame = async (name) => {
    const res = await fetch(`${API}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_name: name }),
    });
    const data = await res.json();
    if (data.success) {
      setStudentName(name);
      setSessionId(data.session_id);
      setPage("game");
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
    setProfPassword("");
    setProfError("");
  };

  if (page === "landing") {
    return (
      <Landing
        onStartGame={() => setPage("intro")}
        onProfessor={() => setPage("professor")}
      />
    );
  }

  if (page === "intro") {
    return (
      <IntroPage
        onJoin={handleStartGame}
        onBack={() => setPage("landing")}
      />
    );
  }

  if (page === "game") {
    return (
      <Game
        studentName={studentName}
        sessionId={sessionId}
        onComplete={handleGameComplete}
        onBack={handleBack}
      />
    );
  }

  if (page === "results") {
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
    return <Dashboard onBack={handleBack} />;
  }
}

// INTRO PAGE
function IntroPage({ onJoin, onBack }) {
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    await onJoin(studentName);
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.left}>
          <p style={s.eyebrow}>Chapter 4 — Dominant Strategy</p>
          <h2 style={s.title}>The Interrogation Room</h2>
          <p style={s.desc}>
            It is 1950. You and your accomplice have been arrested and
            placed in separate rooms. You cannot communicate. The detective
            offers you both the same deal. You will face 5 rounds against
            an AI opponent that reasons about every move you make.
          </p>
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
        </div>
        <div style={s.right}>
          <p style={s.eyebrow}>Enter your name to begin</p>
          <input
            style={s.input}
            type="text"
            placeholder="Your first name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <button
            style={{ ...s.primaryBtn, opacity: studentName ? 1 : 0.4 }}
            onClick={handleJoin}
            disabled={loading || !studentName}
          >
            {loading ? "Entering..." : "Enter the Room"}
          </button>
          <button style={s.backBtn} onClick={onBack}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// PROFESSOR LOGIN PAGE
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
    gap: "28px",
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
    fontSize: "18px",
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