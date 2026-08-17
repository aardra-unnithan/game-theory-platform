import { useState, useEffect } from "react";

function AuctionGame({ studentName, sessionId, totalRounds, minValue, maxValue, onComplete, onBack, api }) {
  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [hint, setHint] = useState(null);
  const [agentType, setAgentType] = useState("rational");
  const [phase, setPhase] = useState("bidding");
  const [currentResult, setCurrentResult] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [studentBid, setStudentBid] = useState(0);
  const [studentValuation, setStudentValuation] = useState(0);
  const [currentWatch, setCurrentWatch] = useState(null);
  const [hammerAngle, setHammerAngle] = useState(0);
  const [hammerFalling, setHammerFalling] = useState(false);

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
      setAgentType(data.auction.agent_type);
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, [api]);

  // Generate valuation for each round
  useEffect(() => {
    const val = Math.round(minValue + Math.random() * (maxValue - minValue));
    setStudentValuation(val);
    setStudentBid(val);

    const watches = [
      { name: "1963 Rolex Daytona", desc: "Reference 6241. One of the earliest Daytona models with exotic dial." },
      { name: "Patek Philippe Grand Complication", desc: "Reference 5207P in platinum. Perpetual calendar and minute repeater." },
      { name: "Audemars Piguet Royal Oak", desc: "Reference 15202ST. The original 1972 Jumbo design by Gerald Genta." },
      { name: "A. Lange and Söhne Datograph", desc: "Reference 403.035 in platinum. Considered the finest German watch ever made." },
      { name: "Vacheron Constantin Historiques", desc: "Reference 82035 in rose gold. Part of the original 1955 American collection." },
    ];
    setCurrentWatch(watches[(round - 1) % watches.length]);
  }, [round]);

  // Hammer swing animation
  useEffect(() => {
    if (!hammerFalling) return;
    let angle = -60;
    const interval = setInterval(() => {
      angle += 8;
      setHammerAngle(angle);
      if (angle >= 20) {
        clearInterval(interval);
        setHammerFalling(false);
        setHammerAngle(0);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [hammerFalling]);

  const handleBid = async () => {
    setAiThinking(true);
    setPhase("waiting");
    const res = await fetch(`${api}/move/auction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        student_bid: studentBid,
      }),
    });
    const data = await res.json();
    setAiThinking(false);
    setHammerFalling(true);

    const newMove = {
      round: data.round,
      watchName: data.watch_name,
      studentValuation: data.student_valuation,
      studentBid: data.student_bid,
      aiBid: data.ai_bid,
      aiReasoning: data.ai_reasoning,
      winner: data.winner,
      secondPrice: data.second_price,
      studentProfit: data.student_profit,
      optimalBid: data.optimal_bid,
      bidStrategy: data.bid_strategy,
    };

    const updatedMoves = [...moves, newMove];
    setCurrentResult(newMove);
    setMoves(updatedMoves);
    setTotalProfit(data.total_profit);
    setPhase("reveal");

    if (data.game_over) {
      setGameOverData({
        moves: updatedMoves,
        totalProfit: data.total_profit,
        analysis: data.analysis,
      });
    }
  };

  const handleContinue = () => {
    if (gameOverData) {
      onComplete(gameOverData);
      return;
    }
    setCurrentResult(null);
    setPhase("bidding");
    setRound(prev => prev + 1);
  };

  const getBidStrategyColor = (strategy) => {
    if (strategy === "correct") return "#27ae60";
    if (strategy === "overbid") return "#c0392b";
    return "#f0b429";
  };

  const getBidStrategyLabel = (strategy) => {
    if (strategy === "correct") return "Bid true value ✓";
    if (strategy === "overbid") return "Overbid";
    return "Underbid";
  };

  return (
    <div style={s.gamePage}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Vickrey Auction — Sotheby's Geneva</span>
          <span style={s.topSep}>|</span>
          <span style={s.agentBadge}>{agentType} agent</span>
        </div>
        <div style={s.topRight}>
          <button style={s.backToMenu} onClick={onBack}>Back to Menu</button>
          <span style={s.roundBadge}>Lot {round} of {totalRounds}</span>
          <span style={{
            ...s.profitBadge,
            color: totalProfit >= 0 ? "#27ae60" : "#c0392b"
          }}>
            Profit: {totalProfit >= 0 ? "+" : ""}${totalProfit}
          </span>
        </div>
      </div>

      <div style={s.gameInner}>
        {/* LEFT — Watch display and history */}
        <div style={s.gameLeft}>

          {/* Auction scene */}
          <div style={s.auctionScene}>
            {/* Auctioneer's hammer */}
            <div style={s.hammerWrap}>
              <div style={{
                ...s.hammer,
                transform: `rotate(${hammerAngle}deg)`,
                transition: hammerFalling ? "none" : "transform 0.3s ease",
              }}>
                <div style={s.hammerHandle}></div>
                <div style={s.hammerHead}></div>
              </div>
              <div style={s.hammerBlock}></div>
            </div>

            {/* Watch display */}
            <div style={s.watchDisplay}>
              <svg width="120" height="140" viewBox="0 0 120 140">
                {/* Strap top */}
                <rect x="45" y="0" width="30" height="25" rx="4" fill="#1a1a1a" />
                <rect x="50" y="5" width="20" height="15" rx="2" fill="#111" />
                {/* Watch case */}
                <circle cx="60" cy="70" r="45" fill="#1a1a1a" />
                <circle cx="60" cy="70" r="42" fill="#0a0a0a" />
                <circle cx="60" cy="70" r="38" fill="#111" />
                {/* Watch face */}
                <circle cx="60" cy="70" r="34" fill="#0f0f1a" />
                {/* Hour markers */}
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
                  const angle = (i * 30 - 90) * Math.PI / 180;
                  const x1 = 60 + 28 * Math.cos(angle);
                  const y1 = 70 + 28 * Math.sin(angle);
                  const x2 = 60 + 32 * Math.cos(angle);
                  const y2 = 70 + 32 * Math.sin(angle);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0b429" strokeWidth={i % 3 === 0 ? "2.5" : "1"} />;
                })}
                {/* Hour hand */}
                <line x1="60" y1="70" x2="60" y2="48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                {/* Minute hand */}
                <line x1="60" y1="70" x2="78" y2="56" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                {/* Second hand */}
                <line x1="60" y1="70" x2="50" y2="90" stroke="#c0392b" strokeWidth="1" strokeLinecap="round" />
                {/* Center dot */}
                <circle cx="60" cy="70" r="3" fill="#f0b429" />
                {/* Crown */}
                <rect x="100" y="67" width="8" height="6" rx="2" fill="#333" />
                {/* Strap bottom */}
                <rect x="45" y="115" width="30" height="25" rx="4" fill="#1a1a1a" />
                <rect x="50" y="120" width="20" height="15" rx="2" fill="#111" />
                {/* Buckle */}
                <rect x="52" y="130" width="16" height="6" rx="1" fill="#333" />
              </svg>

              {currentWatch && (
                <div style={s.watchInfo}>
                  <p style={s.watchName}>{currentWatch.name}</p>
                  <p style={s.watchDesc}>{currentWatch.desc}</p>
                </div>
              )}
            </div>

            {/* Paddle animation */}
            <div style={s.paddleWrap}>
              <svg width="50" height="100" viewBox="0 0 50 100">
                <ellipse cx="25" cy="25" rx="22" ry="22" fill="#f0b429" />
                <text x="25" y="31" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0f0f0f">
                  {round}
                </text>
                <rect x="22" y="44" width="6" height="56" rx="3" fill="#8b6914" />
              </svg>
            </div>
          </div>

          {/* Round history */}
          {moves.length > 0 && (
            <div style={s.historySection}>
              <p style={s.sectionLabel}>Bidding History</p>
              {moves.map((m) => (
                <div key={m.round} style={s.historyRow}>
                  <span style={s.historyRound}>Lot {m.round}</span>
                  <span style={s.historyWatch}>{m.watchName.split(" ").slice(0, 2).join(" ")}</span>
                  <span style={{
                    ...s.historyStrategy,
                    color: getBidStrategyColor(m.bidStrategy)
                  }}>
                    {getBidStrategyLabel(m.bidStrategy)}
                  </span>
                  <span style={{
                    ...s.historyProfit,
                    color: m.studentProfit > 0 ? "#27ae60" : m.studentProfit < 0 ? "#c0392b" : "#888"
                  }}>
                    {m.studentProfit > 0 ? "+" : ""}${m.studentProfit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Bidding interface */}
        <div style={s.gameRight}>
          {hint && (
            <div style={s.hintBox}>
              <p style={s.hintLabel}>Message from Professor</p>
              <p style={s.hintText}>{hint}</p>
              <button style={s.hintDismiss} onClick={() => setHint(null)}>Dismiss</button>
            </div>
          )}

          {aiThinking && (
            <div style={s.thinkingBox}>
              <div style={s.thinkingDot}></div>
              <p style={s.thinkingText}>Other bidders are submitting their sealed bids...</p>
            </div>
          )}

          {/* BIDDING PHASE */}
          {phase === "bidding" && !aiThinking && (
            <div style={s.biddingSection}>
              <p style={s.sectionLabel}>Lot {round} — Sealed Bid Submission</p>

              <div style={s.valuationCard}>
                <p style={s.valuationLabel}>Your Expert's Private Valuation</p>
                <p style={s.valuationAmount}>${studentValuation}</p>
                <p style={s.valuationNote}>
                  Your research team has examined this piece and determined it is worth exactly
                  ${studentValuation} to your collection. Other bidders have their own private valuations.
                </p>
              </div>

              <div style={s.ruleCard}>
                <p style={s.sectionLabel}>Vickrey Auction Rules</p>
                <div style={s.ruleRow}>
                  <span style={s.ruleNum}>1</span>
                  <span style={s.ruleText}>Highest sealed bid wins the lot</span>
                </div>
                <div style={s.ruleRow}>
                  <span style={s.ruleNum}>2</span>
                  <span style={s.ruleText}>Winner pays only the SECOND highest bid</span>
                </div>
                <div style={s.ruleRow}>
                  <span style={s.ruleNum}>3</span>
                  <span style={s.ruleText}>Your profit = your valuation minus the price you pay</span>
                </div>
              </div>

              <div style={s.bidSection}>
                <p style={s.bidLabel}>Your Sealed Bid, {studentName}</p>
                <div style={s.bidDisplay}>
                  <p style={s.bidAmount}>${studentBid}</p>
                  <p style={s.bidNote}>Your submission</p>
                </div>

                <input
                  style={s.slider}
                  type="range"
                  min={Math.max(0, minValue - 50)}
                  max={maxValue + 50}
                  step={1}
                  value={studentBid}
                  onChange={(e) => setStudentBid(parseInt(e.target.value))}
                />

                <div style={s.sliderLabels}>
                  <span style={s.sliderLabel}>${Math.max(0, minValue - 50)}</span>
                  <span style={{
                    ...s.sliderLabel,
                    color: studentBid === studentValuation ? "#27ae60" : "#555"
                  }}>
                    True value: ${studentValuation}
                  </span>
                  <span style={s.sliderLabel}>${maxValue + 50}</span>
                </div>

                <div style={s.quickBidRow}>
                  <button
                    style={{ ...s.quickBidBtn, ...(studentBid === studentValuation ? s.quickBidBtnActive : {}) }}
                    onClick={() => setStudentBid(studentValuation)}
                  >
                    Bid True Value (${studentValuation})
                  </button>
                  <button
                    style={s.quickBidBtn}
                    onClick={() => setStudentBid(Math.max(0, studentValuation - 20))}
                  >
                    Bid Below (${Math.max(0, studentValuation - 20)})
                  </button>
                  <button
                    style={s.quickBidBtn}
                    onClick={() => setStudentBid(studentValuation + 20)}
                  >
                    Bid Above (${studentValuation + 20})
                  </button>
                </div>
              </div>

              <button style={s.submitBtn} onClick={handleBid}>
                Submit Sealed Bid of ${studentBid}
              </button>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === "reveal" && currentResult && (
            <div style={s.revealSection}>
              <p style={s.sectionLabel}>Lot {currentResult.round} — Hammer Falls</p>

              <div style={{
                ...s.winnerCard,
                borderColor: currentResult.winner === "student" ? "#27ae60" : "#c0392b",
                backgroundColor: currentResult.winner === "student" ? "#0a2a0a" : "#1a0808",
              }}>
                <p style={{
                  ...s.winnerText,
                  color: currentResult.winner === "student" ? "#27ae60" : "#c0392b"
                }}>
                  {currentResult.winner === "student" ? "SOLD — You won this lot!" : "PASSED — Another bidder won"}
                </p>
                <div style={s.winnerDetails}>
                  <div style={s.winnerDetailItem}>
                    <p style={s.winnerDetailLabel}>Your bid</p>
                    <p style={s.winnerDetailValue}>${currentResult.studentBid}</p>
                  </div>
                  <div style={s.winnerDetailItem}>
                    <p style={s.winnerDetailLabel}>Competitor's bid</p>
                    <p style={s.winnerDetailValue}>${currentResult.aiBid}</p>
                  </div>
                  <div style={s.winnerDetailItem}>
                    <p style={s.winnerDetailLabel}>Price paid</p>
                    <p style={s.winnerDetailValue}>${currentResult.secondPrice}</p>
                  </div>
                </div>
              </div>

              <div style={s.valuationReveal}>
                <p style={s.sectionLabel}>Valuation Analysis</p>
                <div style={s.valuationRevealRow}>
                  <div style={s.valuationRevealItem}>
                    <p style={s.valuationRevealLabel}>Your valuation</p>
                    <p style={s.valuationRevealValue}>${currentResult.studentValuation}</p>
                  </div>
                  <div style={s.valuationRevealItem}>
                    <p style={s.valuationRevealLabel}>Your bid</p>
                    <p style={s.valuationRevealValue}>${currentResult.studentBid}</p>
                  </div>
                  <div style={s.valuationRevealItem}>
                    <p style={s.valuationRevealLabel}>Optimal bid</p>
                    <p style={{ ...s.valuationRevealValue, color: "#27ae60" }}>${currentResult.optimalBid}</p>
                  </div>
                </div>
                <div style={{
                  ...s.strategyBadge,
                  backgroundColor: getBidStrategyColor(currentResult.bidStrategy) + "22",
                  border: `1px solid ${getBidStrategyColor(currentResult.bidStrategy)}`,
                }}>
                  <p style={{ ...s.strategyText, color: getBidStrategyColor(currentResult.bidStrategy) }}>
                    {currentResult.bidStrategy === "correct" && "You bid your true value — this is the dominant strategy in Vickrey auctions"}
                    {currentResult.bidStrategy === "overbid" && `You overbid by $${currentResult.studentBid - currentResult.optimalBid} — in Vickrey auctions overbidding never helps and risks overpaying`}
                    {currentResult.bidStrategy === "underbid" && `You underbid by $${currentResult.optimalBid - currentResult.studentBid} — in Vickrey auctions underbidding risks losing profitable deals`}
                  </p>
                </div>
              </div>

              <div style={s.profitReveal}>
                <p style={s.revealDecision}>
                  {currentResult.winner === "student"
                    ? `You won and paid $${currentResult.secondPrice} (second price)`
                    : "You did not win this lot"
                  }
                </p>
                <p style={{
                  ...s.revealProfitNum,
                  color: currentResult.studentProfit > 0 ? "#27ae60"
                    : currentResult.studentProfit < 0 ? "#c0392b" : "#888"
                }}>
                  {currentResult.studentProfit >= 0 ? "+" : ""}${currentResult.studentProfit}
                </p>
                <p style={s.totalSoFar}>
                  Running total:{" "}
                  <span style={{ color: totalProfit >= 0 ? "#27ae60" : "#c0392b", fontWeight: "700" }}>
                    {totalProfit >= 0 ? "+" : ""}${totalProfit}
                  </span>
                </p>
              </div>

              <button style={s.continueBtn} onClick={handleContinue}>
                {gameOverData ? "See Final Results →" : `Next Lot — Round ${round + 1} →`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  gamePage: { minHeight: "100vh", backgroundColor: "#0f0f0f", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid #1f1f1f", backgroundColor: "#0a0a0a" },
  topLeft: { display: "flex", alignItems: "center", gap: "12px" },
  topLabel: { fontSize: "13px", color: "#777", textTransform: "uppercase", letterSpacing: "1.5px" },
  topSep: { color: "#333", fontSize: "13px" },
  agentBadge: { fontSize: "12px", color: "#f0b429", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", backgroundColor: "#1a1500", padding: "4px 10px", borderRadius: "4px", border: "1px solid #4a3800" },
  topRight: { display: "flex", alignItems: "center", gap: "16px" },
  roundBadge: { fontSize: "13px", color: "#c0392b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  profitBadge: { fontSize: "14px", fontWeight: "700" },
  backToMenu: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #333", backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer" },
  gameInner: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
  gameLeft: { padding: "32px 40px", borderRight: "1px solid #1f1f1f", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" },
  auctionScene: { display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "200px", backgroundColor: "#0a0a0a", borderRadius: "12px", border: "1px solid #1f1f1f", padding: "16px", position: "relative", overflow: "hidden" },
  hammerWrap: { display: "flex", flexDirection: "column", alignItems: "center", position: "relative" },
  hammer: { transformOrigin: "top center", display: "flex", flexDirection: "column", alignItems: "center" },
  hammerHandle: { width: "6px", height: "60px", backgroundColor: "#8b6914", borderRadius: "3px" },
  hammerHead: { width: "30px", height: "14px", backgroundColor: "#f0b429", borderRadius: "4px", marginTop: "-4px" },
  hammerBlock: { width: "40px", height: "8px", backgroundColor: "#2a2a2a", borderRadius: "2px", marginTop: "4px" },
  watchDisplay: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  watchInfo: { textAlign: "center", maxWidth: "140px" },
  watchName: { fontSize: "11px", color: "#f0b429", fontWeight: "700", margin: 0, textAlign: "center" },
  watchDesc: { fontSize: "10px", color: "#555", margin: "4px 0 0 0", lineHeight: "1.4", textAlign: "center" },
  paddleWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  sectionLabel: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: "700" },
  historySection: { display: "flex", flexDirection: "column", gap: "8px" },
  historyRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", backgroundColor: "#1a1a1a", borderRadius: "6px", border: "1px solid #2a2a2a" },
  historyRound: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "36px" },
  historyWatch: { fontSize: "12px", color: "#888", flex: 1 },
  historyStrategy: { fontSize: "12px", fontWeight: "700", width: "100px" },
  historyProfit: { fontSize: "14px", fontWeight: "700" },
  gameRight: { padding: "48px 40px", display: "flex", flexDirection: "column", gap: "24px" },
  hintBox: { backgroundColor: "#1a1500", border: "1px solid #4a3800", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" },
  hintLabel: { fontSize: "11px", color: "#f0b429", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: "700" },
  hintText: { fontSize: "16px", color: "#f0b429", margin: 0, lineHeight: "1.6" },
  hintDismiss: { alignSelf: "flex-start", padding: "6px 14px", borderRadius: "4px", border: "1px solid #4a3800", backgroundColor: "transparent", color: "#f0b429", fontSize: "13px", cursor: "pointer" },
  thinkingBox: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #2a2a2a" },
  thinkingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c0392b" },
  thinkingText: { fontSize: "15px", color: "#888", margin: 0 },
  biddingSection: { display: "flex", flexDirection: "column", gap: "20px" },
  valuationCard: { backgroundColor: "#1a1500", border: "1px solid #4a3800", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" },
  valuationLabel: { fontSize: "11px", color: "#f0b429", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: "700" },
  valuationAmount: { fontSize: "48px", color: "#f0b429", fontWeight: "900", margin: 0, letterSpacing: "-1px" },
  valuationNote: { fontSize: "13px", color: "#888", margin: 0, lineHeight: "1.6" },
  ruleCard: { backgroundColor: "#141414", border: "1px solid #1f1f1f", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" },
  ruleRow: { display: "flex", alignItems: "center", gap: "12px" },
  ruleNum: { width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#c0392b", color: "#ffffff", fontSize: "12px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ruleText: { fontSize: "14px", color: "#cccccc" },
  bidSection: { display: "flex", flexDirection: "column", gap: "12px" },
  bidLabel: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: "700" },
  bidDisplay: { textAlign: "center", padding: "20px", backgroundColor: "#141414", borderRadius: "8px", border: "1px solid #1f1f1f" },
  bidAmount: { fontSize: "48px", fontWeight: "900", color: "#ffffff", margin: 0, letterSpacing: "-1px" },
  bidNote: { fontSize: "12px", color: "#555", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" },
  slider: { width: "100%", accentColor: "#c0392b", cursor: "pointer", height: "6px" },
  sliderLabels: { display: "flex", justifyContent: "space-between", marginTop: "-8px" },
  sliderLabel: { fontSize: "11px", color: "#555" },
  quickBidRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  quickBidBtn: { flex: 1, padding: "10px 8px", borderRadius: "6px", border: "1px solid #2a2a2a", backgroundColor: "#141414", color: "#888", fontSize: "12px", cursor: "pointer", fontWeight: "600", textAlign: "center" },
  quickBidBtnActive: { backgroundColor: "#0a2a0a", border: "1px solid #27ae60", color: "#27ae60" },
  submitBtn: { width: "100%", padding: "18px", borderRadius: "8px", border: "none", backgroundColor: "#c0392b", color: "#ffffff", fontSize: "17px", cursor: "pointer", fontWeight: "700" },
  revealSection: { display: "flex", flexDirection: "column", gap: "16px" },
  winnerCard: { borderRadius: "12px", border: "2px solid", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" },
  winnerText: { fontSize: "22px", fontWeight: "900", margin: 0 },
  winnerDetails: { display: "flex", gap: "12px" },
  winnerDetailItem: { flex: 1, textAlign: "center" },
  winnerDetailLabel: { fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px 0" },
  winnerDetailValue: { fontSize: "20px", color: "#ffffff", fontWeight: "700", margin: 0 },
  valuationReveal: { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" },
  valuationRevealRow: { display: "flex", gap: "12px" },
  valuationRevealItem: { flex: 1, textAlign: "center" },
  valuationRevealLabel: { fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px 0" },
  valuationRevealValue: { fontSize: "20px", color: "#ffffff", fontWeight: "700", margin: 0 },
  strategyBadge: { borderRadius: "8px", padding: "14px 16px" },
  strategyText: { fontSize: "14px", margin: 0, lineHeight: "1.6", fontWeight: "600" },
  profitReveal: { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" },
  revealDecision: { fontSize: "15px", color: "#aaaaaa", margin: 0 },
  revealProfitNum: { fontSize: "48px", fontWeight: "900", margin: 0 },
  totalSoFar: { fontSize: "14px", color: "#666", margin: 0 },
  continueBtn: { width: "100%", padding: "16px", borderRadius: "8px", border: "none", backgroundColor: "#27ae60", color: "#ffffff", fontSize: "16px", cursor: "pointer", fontWeight: "700" },
};

export default AuctionGame;