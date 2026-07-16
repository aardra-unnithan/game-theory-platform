import { useState, useEffect } from "react";

function Game({ studentName, sessionId, totalRounds, onComplete, onBack, api }) {
  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [totalScore, setTotalScore] = useState({ student: 0, ai: 0 });
  const [aiThinking, setAiThinking] = useState(false);
  const [hint, setHint] = useState(null);
  const [currentPayoff, setCurrentPayoff] = useState(null);
  const [agentType, setAgentType] = useState("rational");

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`${api}/hint/${sessionId}`);
      const data = await res.json();
      if (data.hint) setHint(data.hint);
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId, api]);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch(`${api}/game/settings`);
      const data = await res.json();
      setCurrentPayoff(data.prisoners_dilemma.payoff_matrix);
      setAgentType(data.prisoners_dilemma.agent_type);
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, [api]);

  const handleMove = async (studentMove) => {
    setAiThinking(true);
    const res = await fetch(`${api}/move/pd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, student_move: studentMove }),
    });
    const data = await res.json();
    setAiThinking(false);

    const newMove = {
      round: data.round,
      studentMove,
      aiMove: data.ai_move,
      studentPayoff: data.student_payoff,
      aiPayoff: data.ai_payoff,
    };

    setMoves((prev) => [...prev, newMove]);
    setCurrentResult(newMove);
    setTotalScore({ student: data.total_student_score, ai: data.total_ai_score });

    if (data.game_over) {
      onComplete({
        moves: [...moves, newMove],
        totalScore: { student: data.total_student_score, ai: data.total_ai_score },
        analysis: data.analysis,
      });
    } else {
      setRound(data.round + 1);
    }
  };

  const matrixData = currentPayoff ? [
    {
      row: "You: Silence",
      cols: [
        { label: `${currentPayoff.both_silence.student}, ${currentPayoff.both_silence.ai}`, highlight: true },
        { label: `${currentPayoff.student_silence_ai_testify.student}, ${currentPayoff.student_silence_ai_testify.ai}`, highlight: false },
      ],
    },
    {
      row: "You: Testify",
      cols: [
        { label: `${currentPayoff.student_testify_ai_silence.student}, ${currentPayoff.student_testify_ai_silence.ai}`, highlight: false },
        { label: `${currentPayoff.both_testify.student}, ${currentPayoff.both_testify.ai}`, highlight: false },
      ],
    },
  ] : null;

  return (
    <div style={s.gamePage}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Prisoner's Dilemma</span>
          <span style={s.topSep}>|</span>
          <span style={s.agentBadge}>{agentType} agent</span>
        </div>
        <div style={s.topRight}>
          <button style={s.backToMenu} onClick={onBack}>Back to Menu</button>
          <span style={s.roundBadge}>Round {round} of {totalRounds}</span>
          <span style={s.scoreBadge}>You: {totalScore.student} | AI: {totalScore.ai}</span>
        </div>
      </div>

      <div style={s.gameInner}>
        <div style={s.gameLeft}>
          <h2 style={s.gameTitle}>Interrogation Room</h2>
          <p style={s.gameDesc}>
            The detective slides two pieces of paper across the table.
            Your accomplice is in the next room facing the same choice
            right now. You cannot communicate. What do you do?
          </p>

          <div style={s.matrixSection}>
            <p style={s.sectionLabel}>Live Payoff Matrix</p>
            <table style={s.matrix}>
              <thead>
                <tr>
                  <th style={s.mh}></th>
                  <th style={s.mh}>AI: Silence</th>
                  <th style={s.mh}>AI: Testify</th>
                </tr>
              </thead>
              <tbody>
                {matrixData ? matrixData.map((row, i) => (
                  <tr key={i}>
                    <td style={s.mc}>{row.row}</td>
                    {row.cols.map((col, j) => (
                      <td key={j} style={col.highlight ? s.mcHL : s.mc}>{col.label}</td>
                    ))}
                  </tr>
                )) : (
                  <>
                    <tr>
                      <td style={s.mc}>You: Silence</td>
                      <td style={s.mcHL}>3, 3</td>
                      <td style={s.mc}>1, 4</td>
                    </tr>
                    <tr>
                      <td style={s.mc}>You: Testify</td>
                      <td style={s.mc}>4, 1</td>
                      <td style={s.mc}>2, 2</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {moves.length > 0 && (
            <div style={s.historySection}>
              <p style={s.sectionLabel}>Round History</p>
              {moves.map((m) => (
                <div key={m.round} style={s.historyRow}>
                  <span style={s.historyRound}>R{m.round}</span>
                  <span style={s.historyMove}>You: <strong>{m.studentMove}</strong></span>
                  <span style={s.historyMove}>AI: <strong>{m.aiMove}</strong></span>
                  <span style={s.historyScore}>+{m.studentPayoff} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.gameRight}>
          {hint && (
            <div style={s.hintBox}>
              <p style={s.hintLabel}>Message from Professor</p>
              <p style={s.hintText}>{hint}</p>
              <button style={s.hintDismiss} onClick={() => setHint(null)}>Dismiss</button>
            </div>
          )}

          {currentResult && (
            <div style={s.resultBox}>
              <p style={s.sectionLabel}>Round {currentResult.round} Result</p>
              <div style={s.resultRow}>
                <div style={s.resultItem}>
                  <p style={s.resultLabel}>You chose</p>
                  <p style={s.resultValue}>{currentResult.studentMove}</p>
                </div>
                <div style={s.resultItem}>
                  <p style={s.resultLabel}>AI chose</p>
                  <p style={s.resultValue}>{currentResult.aiMove}</p>
                </div>
                <div style={s.resultItem}>
                  <p style={s.resultLabel}>You earned</p>
                  <p style={s.resultValue}>{currentResult.studentPayoff} pts</p>
                </div>
              </div>
            </div>
          )}

          {aiThinking && (
            <div style={s.thinkingBox}>
              <div style={s.thinkingDot}></div>
              <p style={s.thinkingText}>AI is deliberating...</p>
            </div>
          )}

          {!aiThinking && (
            <div style={s.moveSection}>
              <p style={s.sectionLabel}>Your Decision, {studentName}</p>
              <button style={s.silenceBtn} onClick={() => handleMove("silence")}>
                <span style={s.btnTitle}>Stay Silent</span>
                <span style={s.btnSub}>Protect your accomplice</span>
              </button>
              <button style={s.testifyBtn} onClick={() => handleMove("testify")}>
                <span style={s.btnTitle}>Testify</span>
                <span style={s.btnSub}>Make a deal with the detective</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  gamePage: {
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    borderBottom: "1px solid #1f1f1f",
    backgroundColor: "#0a0a0a",
  },
  topLeft: { display: "flex", alignItems: "center", gap: "12px" },
  topLabel: { fontSize: "13px", color: "#777", textTransform: "uppercase", letterSpacing: "1.5px" },
  topSep: { color: "#333", fontSize: "13px" },
  agentBadge: {
    fontSize: "12px", color: "#f0b429", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "1px",
    backgroundColor: "#1a1500", padding: "4px 10px",
    borderRadius: "4px", border: "1px solid #4a3800",
  },
  topRight: { display: "flex", alignItems: "center", gap: "16px" },
  roundBadge: { fontSize: "13px", color: "#c0392b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  scoreBadge: { fontSize: "14px", color: "#ffffff", fontWeight: "700" },
  backToMenu: {
    padding: "8px 16px", borderRadius: "6px", border: "1px solid #333",
    backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer",
  },
  gameInner: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
  gameLeft: {
    padding: "48px 40px", borderRight: "1px solid #1f1f1f",
    display: "flex", flexDirection: "column", gap: "32px",
  },
  gameTitle: { fontSize: "44px", color: "#ffffff", margin: 0, fontWeight: "900", letterSpacing: "-1px" },
  gameDesc: { fontSize: "19px", color: "#cccccc", lineHeight: "1.8", margin: 0 },
  matrixSection: { display: "flex", flexDirection: "column", gap: "12px" },
  sectionLabel: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  historySection: { display: "flex", flexDirection: "column", gap: "8px" },
  historyRow: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "11px 14px", backgroundColor: "#1a1a1a",
    borderRadius: "6px", border: "1px solid #2a2a2a",
  },
  historyRound: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "28px" },
  historyMove: { fontSize: "14px", color: "#cccccc", flex: 1 },
  historyScore: { fontSize: "14px", color: "#ffffff", fontWeight: "700" },
  gameRight: {
    padding: "48px 40px", display: "flex",
    flexDirection: "column", gap: "24px", justifyContent: "center",
  },
  hintBox: {
    backgroundColor: "#1a1500", border: "1px solid #4a3800",
    borderRadius: "8px", padding: "20px",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  hintLabel: {
    fontSize: "11px", color: "#f0b429", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  hintText: { fontSize: "16px", color: "#f0b429", margin: 0, lineHeight: "1.6" },
  hintDismiss: {
    alignSelf: "flex-start", padding: "6px 14px", borderRadius: "4px",
    border: "1px solid #4a3800", backgroundColor: "transparent",
    color: "#f0b429", fontSize: "13px", cursor: "pointer",
  },
  resultBox: {
    backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "20px",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  resultRow: { display: "flex", gap: "16px" },
  resultItem: { flex: 1, textAlign: "center" },
  resultLabel: {
    fontSize: "12px", color: "#666", textTransform: "uppercase",
    letterSpacing: "1px", margin: "0 0 4px 0",
  },
  resultValue: { fontSize: "20px", color: "#ffffff", fontWeight: "700", margin: 0, textTransform: "capitalize" },
  thinkingBox: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 20px", backgroundColor: "#1a1a1a",
    borderRadius: "8px", border: "1px solid #2a2a2a",
  },
  thinkingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c0392b" },
  thinkingText: { fontSize: "15px", color: "#888", margin: 0 },
  moveSection: { display: "flex", flexDirection: "column", gap: "12px" },
  silenceBtn: {
    width: "100%", padding: "22px 24px", borderRadius: "8px",
    border: "2px solid #333", backgroundColor: "transparent",
    color: "#ffffff", fontSize: "17px", cursor: "pointer",
    fontWeight: "700", textAlign: "left",
    display: "flex", flexDirection: "column", gap: "6px",
  },
  testifyBtn: {
    width: "100%", padding: "22px 24px", borderRadius: "8px",
    border: "none", backgroundColor: "#c0392b",
    color: "#ffffff", fontSize: "17px", cursor: "pointer",
    fontWeight: "700", textAlign: "left",
    display: "flex", flexDirection: "column", gap: "6px",
  },
  btnTitle: { fontSize: "20px", fontWeight: "900" },
  btnSub: { fontSize: "13px", fontWeight: "400", opacity: 0.7 },
  matrix: { borderCollapse: "collapse", width: "100%", fontSize: "15px" },
  mh: {
    border: "1px solid #2a2a2a", padding: "12px 16px",
    color: "#777", textAlign: "center",
    backgroundColor: "#141414", fontWeight: "700",
  },
  mc: { border: "1px solid #2a2a2a", padding: "12px 16px", color: "#cccccc", textAlign: "center" },
  mcHL: {
    border: "2px solid #c0392b", padding: "12px 16px",
    color: "#c0392b", textAlign: "center",
    backgroundColor: "#1a0808", fontWeight: "900", fontSize: "17px",
  },
};

export default Game;