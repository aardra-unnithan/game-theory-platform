function Results({ studentName, moves, totalScore, analysis, onPlayAgain, onBack }) {
  const cooperations = moves.filter((m) => m.studentMove === "silence").length;
  const defections = moves.filter((m) => m.studentMove === "testify").length;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Results</span>
        </div>
        <button style={s.backBtn} onClick={onBack}>
          Back to Menu
        </button>
      </div>

      <div style={s.inner}>
        <div style={s.left}>
          <p style={s.eyebrow}>Game Complete</p>
          <h2 style={s.title}>{studentName}'s Session</h2>

          <div style={s.scoreGrid}>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{totalScore.student}</p>
              <p style={s.scoreLabel}>Your Score</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{totalScore.ai}</p>
              <p style={s.scoreLabel}>AI Score</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{cooperations}</p>
              <p style={s.scoreLabel}>Times Silent</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{defections}</p>
              <p style={s.scoreLabel}>Times Testified</p>
            </div>
          </div>

          <div style={s.roundSummary}>
            <p style={s.sectionLabel}>Round by Round</p>
            {moves.map((m) => (
              <div key={m.round} style={s.summaryRow}>
                <span style={s.summaryRound}>Round {m.round}</span>
                <span style={s.summaryMove}>You: {m.studentMove}</span>
                <span style={s.summaryMove}>AI: {m.aiMove}</span>
                <span style={s.summaryPts}>+{m.studentPayoff}</span>
              </div>
            ))}
          </div>

          <button style={s.backMenuBtn} onClick={onBack}>
            Back to Menu
          </button>
        </div>

        <div style={s.right}>
          <p style={s.eyebrowAccent}>AI Analysis</p>
          <p style={s.analysisText}>{analysis}</p>

          <div style={s.conceptBox}>
            <p style={s.conceptLabel}>Key Concepts — Chapter 4</p>
            <p style={s.conceptItem}>
              Dominant Strategy — Testify yields a higher payoff regardless
              of what the other player does.
            </p>
            <p style={s.conceptItem}>
              Nash Equilibrium — Both testify. Neither player can improve
              their outcome by changing strategy alone.
            </p>
            <p style={s.conceptItem}>
              The Dilemma — Individual rationality leads to collective
              irrationality. Both silence gives 3 each, but neither has
              incentive to choose it alone.
            </p>
          </div>

          <button style={s.playAgainBtn} onClick={onPlayAgain}>
            Play Again
          </button>
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
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  topLabel: {
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
  },
  topSep: {
    color: "#333",
    fontSize: "12px",
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
  },
  inner: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0",
    padding: "0",
  },
  left: {
    padding: "48px 40px",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  right: {
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  eyebrow: {
    fontSize: "11px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "3px",
    margin: 0,
    fontWeight: "700",
  },
  eyebrowAccent: {
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
    letterSpacing: "-1px",
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  scoreBox: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
  },
  scoreNum: {
    fontSize: "40px",
    fontWeight: "900",
    color: "#c0392b",
    margin: "0 0 4px 0",
  },
  scoreLabel: {
    fontSize: "11px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  roundSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 14px",
    backgroundColor: "#1a1a1a",
    borderRadius: "6px",
    border: "1px solid #2a2a2a",
  },
  summaryRound: {
    fontSize: "11px",
    color: "#c0392b",
    fontWeight: "700",
    width: "56px",
  },
  summaryMove: {
    fontSize: "13px",
    color: "#aaaaaa",
    flex: 1,
  },
  summaryPts: {
    fontSize: "13px",
    color: "#ffffff",
    fontWeight: "700",
  },
  backMenuBtn: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
  },
  analysisText: {
    fontSize: "18px",
    color: "#cccccc",
    lineHeight: "1.9",
    margin: 0,
  },
  conceptBox: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  conceptLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  conceptItem: {
    fontSize: "14px",
    color: "#aaaaaa",
    lineHeight: "1.7",
    margin: 0,
  },
  playAgainBtn: {
    padding: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default Results;