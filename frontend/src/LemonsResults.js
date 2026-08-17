function LemonsResults({ studentName, moves, totalProfit, analysis, onPlayAgain, onBack }) {
  const peachesBought = moves.filter(m => m.carType === "peach" && m.decision === "buy").length;
  const lemonsBought = moves.filter(m => m.carType === "lemon" && m.decision === "buy").length;
  const timesWalked = moves.filter(m => m.decision === "walk").length;
  const totalBought = peachesBought + lemonsBought;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Market for Lemons — Results</span>
        </div>
        <button style={s.backBtn} onClick={onBack}>Back to Menu</button>
      </div>

      <div style={s.inner}>
        <div style={s.left}>
          <p style={s.eyebrow}>Game Complete</p>
          <h2 style={s.title}>{studentName}'s Session</h2>

          <div style={s.scoreGrid}>
            <div style={s.scoreBox}>
              <p style={{
                ...s.scoreNum,
                color: totalProfit >= 0 ? "#27ae60" : "#c0392b"
              }}>
                {totalProfit >= 0 ? "+" : ""}${totalProfit}
              </p>
              <p style={s.scoreLabel}>Total Profit</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{totalBought}</p>
              <p style={s.scoreLabel}>Cars Bought</p>
            </div>
            <div style={s.scoreBox}>
              <p style={{ ...s.scoreNum, color: "#27ae60" }}>{peachesBought}</p>
              <p style={s.scoreLabel}>Peaches</p>
            </div>
            <div style={s.scoreBox}>
              <p style={{ ...s.scoreNum, color: "#c0392b" }}>{lemonsBought}</p>
              <p style={s.scoreLabel}>Lemons</p>
            </div>
          </div>

          <div style={s.statsBox}>
            <p style={s.sectionLabel}>Decision Summary</p>
            <div style={s.statRow}>
              <span style={s.statLabel}>Total cars offered</span>
              <span style={s.statValue}>{moves.length}</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Cars you bought</span>
              <span style={s.statValue}>{totalBought}</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Times you walked away</span>
              <span style={s.statValue}>{timesWalked}</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Peaches identified correctly</span>
              <span style={{ ...s.statValue, color: "#27ae60" }}>{peachesBought}</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Lemons you fell for</span>
              <span style={{ ...s.statValue, color: "#c0392b" }}>{lemonsBought}</span>
            </div>
          </div>

          <div style={s.moveHistory}>
            <p style={s.sectionLabel}>Round by Round</p>
            {moves.map((m) => (
              <div key={m.round} style={s.moveRow}>
                <span style={s.moveRound}>Round {m.round}</span>
                <span style={{
                  ...s.moveType,
                  color: m.carType === "peach" ? "#27ae60" : "#c0392b"
                }}>
                  {m.carType}
                </span>
                <span style={s.moveDecision}>{m.decision}</span>
                <span style={{
                  ...s.moveProfit,
                  color: m.profit >= 0 ? "#27ae60" : "#c0392b"
                }}>
                  {m.profit >= 0 ? "+" : ""}${m.profit}
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
              Information Asymmetry — The seller knows the quality of the car. You do not. This unequal distribution of information is the core of Akerlof's 1970 Nobel Prize winning insight.
            </p>
            <p style={s.conceptItem}>
              Adverse Selection — When buyers cannot distinguish good from bad cars, they offer a price reflecting average quality. Good car sellers find this price too low and leave the market. Only lemon sellers remain. The market fills with bad quality.
            </p>
            <p style={s.conceptItem}>
              Market Failure — The inability to verify quality causes the market to collapse entirely. This is why institutions like warranties, inspections, and reputation systems exist — they solve the information problem Akerlof identified.
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
  scoreNum: { fontSize: "40px", fontWeight: "900", color: "#c0392b", margin: "0 0 4px 0" },
  scoreLabel: {
    fontSize: "12px", color: "#666", textTransform: "uppercase",
    letterSpacing: "1px", margin: 0,
  },
  statsBox: {
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
    padding: "8px 0", borderBottom: "1px solid #2a2a2a",
  },
  statLabel: { fontSize: "14px", color: "#cccccc" },
  statValue: { fontSize: "14px", color: "#ffffff", fontWeight: "700" },
  moveHistory: { display: "flex", flexDirection: "column", gap: "8px" },
  moveRow: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "11px 14px", backgroundColor: "#1a1a1a",
    borderRadius: "6px", border: "1px solid #2a2a2a",
  },
  moveRound: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "64px" },
  moveType: { fontSize: "13px", fontWeight: "700", width: "60px", textTransform: "capitalize" },
  moveDecision: { fontSize: "13px", color: "#888", flex: 1, textTransform: "capitalize" },
  moveProfit: { fontSize: "14px", fontWeight: "700" },
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

export default LemonsResults;