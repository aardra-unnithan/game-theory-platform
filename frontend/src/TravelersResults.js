function TravelersResults({ studentName, moves, totalScore, analysis, onPlayAgain, onBack }) {
  const avgClaim = moves.length > 0
    ? moves.reduce((sum, m) => sum + m.studentClaim, 0) / moves.length
    : 0;

  const timesLower = moves.filter(m => m.studentClaim < m.aiClaim).length;
  const timesHigher = moves.filter(m => m.studentClaim > m.aiClaim).length;
  const timesEqual = moves.filter(m => m.studentClaim === m.aiClaim).length;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Traveler's Dilemma — Results</span>
        </div>
        <button style={s.backBtn} onClick={onBack}>Back to Menu</button>
      </div>

      <div style={s.inner}>
        <div style={s.left}>
          <p style={s.eyebrow}>Game Complete</p>
          <h2 style={s.title}>{studentName}'s Session</h2>

          <div style={s.scoreGrid}>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>${totalScore.student.toFixed(2)}</p>
              <p style={s.scoreLabel}>Your Earnings</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>${totalScore.ai.toFixed(2)}</p>
              <p style={s.scoreLabel}>AI Earnings</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>${avgClaim.toFixed(2)}</p>
              <p style={s.scoreLabel}>Avg Claim</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{timesLower}</p>
              <p style={s.scoreLabel}>Times Lower</p>
            </div>
          </div>

          <div style={s.claimStats}>
            <p style={s.sectionLabel}>Claim Comparison</p>
            <div style={s.statRow}>
              <span style={s.statLabel}>You claimed lower</span>
              <span style={s.statValue}>{timesLower} rounds</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>AI claimed lower</span>
              <span style={s.statValue}>{timesHigher} rounds</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Equal claims</span>
              <span style={s.statValue}>{timesEqual} rounds</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Nash Equilibrium prediction</span>
              <span style={s.statValueRed}>$4.00</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Your average claim</span>
              <span style={s.statValueGold}>${avgClaim.toFixed(2)}</span>
            </div>
          </div>

          <div style={s.moveHistory}>
            <p style={s.sectionLabel}>Round by Round</p>
            {moves.map((m) => (
              <div key={m.round} style={s.moveRow}>
                <span style={s.moveRound}>Round {m.round}</span>
                <span style={s.moveClaim}>You: ${m.studentClaim.toFixed(2)}</span>
                <span style={s.moveClaim}>AI: ${m.aiClaim.toFixed(2)}</span>
                <span style={{
                  ...s.moveEarned,
                  color: m.studentPayoff > m.aiPayoff ? "#27ae60"
                    : m.studentPayoff < m.aiPayoff ? "#c0392b" : "#888"
                }}>
                  +${m.studentPayoff.toFixed(2)}
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
              Iterated Dominance — There is always an incentive to undercut the other player by $0.50 to earn the reward. Following this logic all the way down leads to the Nash Equilibrium of $4.00.
            </p>
            <p style={s.conceptItem}>
              Nash Equilibrium — Both claim $4.00. Neither player can improve by changing their claim alone. Yet this is the worst collective outcome.
            </p>
            <p style={s.conceptItem}>
              Human Behavior — In laboratory experiments people consistently claim much higher than $4.00. Social reasoning, optimism, and fairness override pure strategic logic.
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
    display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto",
  },
  right: {
    padding: "48px 40px",
    display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto",
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
  scoreNum: { fontSize: "36px", fontWeight: "900", color: "#c0392b", margin: "0 0 4px 0" },
  scoreLabel: {
    fontSize: "12px", color: "#666", textTransform: "uppercase",
    letterSpacing: "1px", margin: 0,
  },
  claimStats: {
    backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "20px",
    display: "flex", flexDirection: "column", gap: "12px",
  },
  sectionLabel: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  statRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 0", borderBottom: "1px solid #2a2a2a",
  },
  statLabel: { fontSize: "14px", color: "#cccccc" },
  statValue: { fontSize: "14px", color: "#ffffff", fontWeight: "700" },
  statValueRed: { fontSize: "14px", color: "#c0392b", fontWeight: "700" },
  statValueGold: { fontSize: "14px", color: "#f0b429", fontWeight: "700" },
  moveHistory: { display: "flex", flexDirection: "column", gap: "8px" },
  moveRow: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "11px 14px", backgroundColor: "#1a1a1a",
    borderRadius: "6px", border: "1px solid #2a2a2a",
  },
  moveRound: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "64px" },
  moveClaim: { fontSize: "14px", color: "#cccccc", flex: 1 },
  moveEarned: { fontSize: "14px", fontWeight: "700" },
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

export default TravelersResults;