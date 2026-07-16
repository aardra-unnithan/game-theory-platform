function CentipedeResults({ studentName, gameData, onPlayAgain, onBack }) {
  const { moves, stoppedBy, stage, studentPayoff, aiPayoff, analysis } = gameData;

  const getStopMessage = () => {
    if (stoppedBy === "student") {
      return `You chose to Stop at Stage ${stage}. You earned $${studentPayoff}.`;
    } else if (stoppedBy === "ai") {
      return `The AI chose to Stop at Stage ${stage}. You earned $${studentPayoff}.`;
    } else {
      return `The game reached the final stage and stopped automatically. You earned $${studentPayoff}.`;
    }
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Centipede Game — Results</span>
        </div>
        <button style={s.backBtn} onClick={onBack}>Back to Menu</button>
      </div>

      <div style={s.inner}>
        <div style={s.left}>
          <p style={s.eyebrow}>Game Complete</p>
          <h2 style={s.title}>{studentName}'s Session</h2>

          <div style={s.scoreGrid}>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>${studentPayoff}</p>
              <p style={s.scoreLabel}>Your Earnings</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>${aiPayoff}</p>
              <p style={s.scoreLabel}>AI Earnings</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{stage}</p>
              <p style={s.scoreLabel}>Stage Reached</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{stoppedBy === "student" ? "You" : stoppedBy === "ai" ? "AI" : "Auto"}</p>
              <p style={s.scoreLabel}>Who Stopped</p>
            </div>
          </div>

          <div style={s.stopMsg}>
            <p style={s.stopMsgText}>{getStopMessage()}</p>
          </div>

          <div style={s.moveHistory}>
            <p style={s.sectionLabel}>Move History</p>
            {moves.map((m, i) => (
              <div key={i} style={s.moveRow}>
                <span style={s.moveStage}>Stage {m.stage}</span>
                <span style={s.moveMover}>{m.mover}</span>
                <span style={{
                  ...s.moveDecision,
                  color: m.move === "stop" ? "#c0392b" : "#27ae60",
                  fontWeight: "700",
                }}>
                  {m.move.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <button style={s.backMenuBtn} onClick={onBack}>Back to Menu</button>
        </div>

        <div style={s.right}>
          <p style={s.eyebrowAccent}>AI Analysis</p>
          <p style={s.analysisText}>{analysis}</p>

          <div style={s.conceptBox}>
            <p style={s.conceptLabel}>Key Concepts</p>
            <p style={s.conceptItem}>
              Backward Induction — The rational solution is to Stop at Stage 1. Working backwards from the final stage, each player should Stop immediately. Yet almost nobody does.
            </p>
            <p style={s.conceptItem}>
              Subgame Perfect Nash Equilibrium — The unique SPNE has the first mover stop in Stage 1. This is the prediction that lab experiments consistently contradict.
            </p>
            <p style={s.conceptItem}>
              Human vs Rational Behavior — Real players Continue far longer than theory predicts, suggesting trust, optimism, or social preferences override pure rationality.
            </p>
          </div>

          <button style={s.playAgainBtn} onClick={onPlayAgain}>Play Again</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
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
  backBtn: {
    padding: "8px 16px", borderRadius: "6px", border: "1px solid #333",
    backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer",
  },
  inner: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
  left: {
    padding: "48px 40px", borderRight: "1px solid #1f1f1f",
    display: "flex", flexDirection: "column", gap: "24px",
  },
  right: {
    padding: "48px 40px",
    display: "flex", flexDirection: "column", gap: "24px",
  },
  eyebrow: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "3px", margin: 0, fontWeight: "700",
  },
  eyebrowAccent: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "3px", margin: 0, fontWeight: "700",
  },
  title: {
    fontSize: "52px", color: "#ffffff", margin: 0,
    fontWeight: "900", letterSpacing: "-1px",
  },
  scoreGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  scoreBox: {
    backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "20px", textAlign: "center",
  },
  scoreNum: { fontSize: "40px", fontWeight: "900", color: "#c0392b", margin: "0 0 4px 0" },
  scoreLabel: {
    fontSize: "12px", color: "#666", textTransform: "uppercase",
    letterSpacing: "1px", margin: 0,
  },
  stopMsg: {
    backgroundColor: "#141414", border: "1px solid #1f1f1f",
    borderLeft: "4px solid #c0392b", padding: "18px 20px", borderRadius: "8px",
  },
  stopMsgText: { fontSize: "16px", color: "#cccccc", margin: 0, lineHeight: "1.6" },
  moveHistory: { display: "flex", flexDirection: "column", gap: "8px" },
  sectionLabel: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  moveRow: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "11px 14px", backgroundColor: "#1a1a1a",
    borderRadius: "6px", border: "1px solid #2a2a2a",
  },
  moveStage: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "60px" },
  moveMover: { fontSize: "14px", color: "#888", flex: 1 },
  moveDecision: { fontSize: "14px" },
  backMenuBtn: {
    padding: "14px", borderRadius: "8px", border: "1px solid #333",
    backgroundColor: "transparent", color: "#888", fontSize: "15px", cursor: "pointer",
  },
  analysisText: { fontSize: "18px", color: "#dddddd", lineHeight: "1.9", margin: 0 },
  conceptBox: {
    backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "24px",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  conceptLabel: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  conceptItem: { fontSize: "15px", color: "#cccccc", lineHeight: "1.7", margin: 0 },
  playAgainBtn: {
    padding: "16px", borderRadius: "8px", border: "none",
    backgroundColor: "#c0392b", color: "#ffffff",
    fontSize: "17px", cursor: "pointer", fontWeight: "700",
  },
};

export default CentipedeResults;