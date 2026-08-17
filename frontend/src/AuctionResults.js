function AuctionResults({ studentName, moves, totalProfit, analysis, onPlayAgain, onBack }) {
  const correctBids = moves.filter(m => m.bidStrategy === "correct").length;
  const overbids = moves.filter(m => m.bidStrategy === "overbid").length;
  const underbids = moves.filter(m => m.bidStrategy === "underbid").length;
  const lotsWon = moves.filter(m => m.winner === "student").length;
  const profitableLots = moves.filter(m => m.studentProfit > 0).length;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Vickrey Auction — Results</span>
        </div>
        <button style={s.backBtn} onClick={onBack}>Back to Menu</button>
      </div>

      <div style={s.inner}>
        <div style={s.left}>
          <p style={s.eyebrow}>Auction Complete</p>
          <h2 style={s.title}>{studentName}'s Session</h2>

          <div style={s.scoreGrid}>
            <div style={s.scoreBox}>
              <p style={{ ...s.scoreNum, color: totalProfit >= 0 ? "#27ae60" : "#c0392b" }}>
                {totalProfit >= 0 ? "+" : ""}${totalProfit}
              </p>
              <p style={s.scoreLabel}>Total Profit</p>
            </div>
            <div style={s.scoreBox}>
              <p style={s.scoreNum}>{lotsWon}</p>
              <p style={s.scoreLabel}>Lots Won</p>
            </div>
            <div style={s.scoreBox}>
              <p style={{ ...s.scoreNum, color: "#27ae60" }}>{correctBids}</p>
              <p style={s.scoreLabel}>True Value Bids</p>
            </div>
            <div style={s.scoreBox}>
              <p style={{ ...s.scoreNum, color: "#c0392b" }}>{overbids + underbids}</p>
              <p style={s.scoreLabel}>Suboptimal Bids</p>
            </div>
          </div>

          <div style={s.strategyBox}>
            <p style={s.sectionLabel}>Bidding Strategy Breakdown</p>
            <div style={s.stratRow}>
              <span style={s.stratLabel}>Bid true value (optimal)</span>
              <div style={s.stratBarWrap}>
                <div style={{ ...s.stratBar, width: `${(correctBids / moves.length) * 100}%`, backgroundColor: "#27ae60" }}></div>
              </div>
              <span style={{ ...s.stratCount, color: "#27ae60" }}>{correctBids}</span>
            </div>
            <div style={s.stratRow}>
              <span style={s.stratLabel}>Overbid</span>
              <div style={s.stratBarWrap}>
                <div style={{ ...s.stratBar, width: `${(overbids / moves.length) * 100}%`, backgroundColor: "#c0392b" }}></div>
              </div>
              <span style={{ ...s.stratCount, color: "#c0392b" }}>{overbids}</span>
            </div>
            <div style={s.stratRow}>
              <span style={s.stratLabel}>Underbid</span>
              <div style={s.stratBarWrap}>
                <div style={{ ...s.stratBar, width: `${(underbids / moves.length) * 100}%`, backgroundColor: "#f0b429" }}></div>
              </div>
              <span style={{ ...s.stratCount, color: "#f0b429" }}>{underbids}</span>
            </div>
          </div>

          <div style={s.moveHistory}>
            <p style={s.sectionLabel}>Round by Round</p>
            {moves.map((m) => (
              <div key={m.round} style={s.moveRow}>
                <span style={s.moveRound}>Lot {m.round}</span>
                <div style={s.moveDetails}>
                  <span style={s.moveWatch}>{m.watchName}</span>
                  <span style={s.moveBids}>
                    Val: ${m.studentValuation} · Bid: ${m.studentBid} · 2nd: ${m.secondPrice}
                  </span>
                </div>
                <span style={{
                  ...s.moveProfit,
                  color: m.studentProfit > 0 ? "#27ae60" : m.studentProfit < 0 ? "#c0392b" : "#888"
                }}>
                  {m.studentProfit >= 0 ? "+" : ""}${m.studentProfit}
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
              Dominant Strategy — In a Vickrey auction, bidding your true valuation is always the optimal strategy regardless of what others bid. It weakly dominates every other bidding strategy.
            </p>
            <p style={s.conceptItem}>
              Why Overbidding Fails — If you overbid and win, you may pay more than the item is worth to you. The second price does not protect you if you bid above your true value and the second price exceeds it.
            </p>
            <p style={s.conceptItem}>
              Why Underbidding Fails — If you underbid and lose, you miss out on a profitable deal. You could have won and paid only the second price, which may have been below your valuation.
            </p>
            <p style={s.conceptItem}>
              Mechanism Design — The Vickrey auction solves the incentive problem elegantly. It is used by Google for ad auctions, governments for spectrum allocation, and eBay's proxy bidding system.
            </p>
          </div>

          <button style={s.playAgainBtn} onClick={onPlayAgain}>Play Again</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#0f0f0f", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid #1f1f1f", backgroundColor: "#0a0a0a" },
  topLeft: { display: "flex", alignItems: "center", gap: "12px" },
  topLabel: { fontSize: "13px", color: "#777", textTransform: "uppercase", letterSpacing: "1.5px" },
  topSep: { color: "#333", fontSize: "13px" },
  backBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #333", backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer" },
  inner: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
  left: { padding: "48px 40px", borderRight: "1px solid #1f1f1f", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" },
  right: { padding: "48px 40px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" },
  eyebrow: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "3px", margin: 0, fontWeight: "700" },
  eyebrowAccent: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "3px", margin: 0, fontWeight: "700" },
  title: { fontSize: "52px", color: "#ffffff", margin: 0, fontWeight: "900", letterSpacing: "-1px" },
  scoreGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  scoreBox: { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "20px", textAlign: "center" },
  scoreNum: { fontSize: "36px", fontWeight: "900", color: "#c0392b", margin: "0 0 4px 0" },
  scoreLabel: { fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", margin: 0 },
  strategyBox: { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" },
  sectionLabel: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: "700" },
  stratRow: { display: "flex", alignItems: "center", gap: "12px" },
  stratLabel: { fontSize: "13px", color: "#cccccc", width: "160px" },
  stratBarWrap: { flex: 1, height: "10px", backgroundColor: "#2a2a2a", borderRadius: "5px", overflow: "hidden" },
  stratBar: { height: "100%", borderRadius: "5px", transition: "width 0.5s ease" },
  stratCount: { fontSize: "14px", fontWeight: "700", width: "24px", textAlign: "right" },
  moveHistory: { display: "flex", flexDirection: "column", gap: "8px" },
  moveRow: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", backgroundColor: "#1a1a1a", borderRadius: "6px", border: "1px solid #2a2a2a" },
  moveRound: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "40px" },
  moveDetails: { display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  moveWatch: { fontSize: "13px", color: "#ffffff", fontWeight: "600" },
  moveBids: { fontSize: "11px", color: "#666" },
  moveProfit: { fontSize: "14px", fontWeight: "700" },
  backMenuBtn: { padding: "14px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "transparent", color: "#888", fontSize: "15px", cursor: "pointer" },
  analysisText: { fontSize: "18px", color: "#dddddd", lineHeight: "1.9", margin: 0 },
  conceptBox: { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  conceptLabel: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: "700" },
  conceptItem: { fontSize: "15px", color: "#cccccc", lineHeight: "1.7", margin: 0 },
  playAgainBtn: { padding: "16px", borderRadius: "8px", border: "none", backgroundColor: "#c0392b", color: "#ffffff", fontSize: "17px", cursor: "pointer", fontWeight: "700" },
};

export default AuctionResults;