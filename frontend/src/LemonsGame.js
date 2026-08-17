import { useState, useEffect } from "react";

function LemonsGame({ studentName, sessionId, totalRounds, peachValue, lemonValue, minPrice, maxPrice, onComplete, onBack, api }) {
  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [hint, setHint] = useState(null);
  const [agentType, setAgentType] = useState("rational");
  const [sellerBounce, setSellerBounce] = useState(0);
  const [gameOverData, setGameOverData] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [currentPitch, setCurrentPitch] = useState(null);
  const [currentReveal, setCurrentReveal] = useState(null);
  const [warrantyMode, setWarrantyMode] = useState(false);
  const [warrantyCost, setWarrantyCost] = useState(200);

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
      setAgentType(data.lemons.agent_type);
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, [api]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSellerBounce(prev => prev === 0 ? -6 : 0);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    loadPitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPitch = async () => {
    setPhase("loading");
    const res = await fetch(`${api}/lemons/pitch/${sessionId}`);
    const data = await res.json();
    if (data.success) {
      setCurrentPitch({
        price: data.price,
        description: data.description,
        warrantyOffered: data.warranty_offered,
      });
      setWarrantyMode(data.warranty_mode);
      setWarrantyCost(data.warranty_cost);
      setPhase("pitch");
    }
  };

  const handleDecision = async (decision) => {
    setPhase("loading");
    const res = await fetch(`${api}/move/lemons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, student_decision: decision }),
    });
    const data = await res.json();

    const newMove = {
      round: data.round,
      carType: data.car_type,
      trueValue: data.true_value,
      askingPrice: data.asking_price,
      description: data.description,
      warrantyOffered: data.warranty_offered,
      aiReasoning: data.ai_reasoning,
      decision: decision,
      profit: data.student_profit,
    };

    const updatedMoves = [...moves, newMove];
    setCurrentReveal(newMove);
    setMoves(updatedMoves);
    setTotalProfit(data.total_student_profit);
    setPhase("reveal");

    if (data.game_over) {
      setGameOverData({
        moves: updatedMoves,
        totalProfit: data.total_student_profit,
        analysis: data.analysis,
      });
    }
  };

  const handleContinue = async () => {
    if (gameOverData) {
      onComplete(gameOverData);
      return;
    }
    setCurrentReveal(null);
    setCurrentPitch(null);
    setRound(prev => prev + 1);
    await loadPitch();
  };

  return (
    <div style={s.gamePage}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Market for Lemons</span>
          <span style={s.topSep}>|</span>
          <span style={s.agentBadge}>{agentType} agent</span>
          {warrantyMode && (
            <span style={s.warrantyModeBadge}>Warranty Signaling ON</span>
          )}
        </div>
        <div style={s.topRight}>
          <button style={s.backToMenu} onClick={onBack}>Back to Menu</button>
          <span style={s.roundBadge}>Round {round} of {totalRounds}</span>
          <span style={{
            ...s.profitBadge,
            color: totalProfit >= 0 ? "#27ae60" : "#c0392b"
          }}>
            Profit: {totalProfit >= 0 ? "+" : ""}${totalProfit}
          </span>
        </div>
      </div>

      <div style={s.gameInner}>
        {/* LEFT */}
        <div style={s.gameLeft}>
          <div style={s.scene}>
            <div style={s.sceneBackground}>
              <div style={s.groundLine}></div>
              <div style={s.skyGradient}></div>
            </div>

            {/* Seller */}
            <div style={{
              ...s.sellerWrap,
              transform: `translateY(${sellerBounce}px)`,
              transition: "transform 0.4s ease",
            }}>
              <svg width="80" height="140" viewBox="0 0 80 140">
                <circle cx="40" cy="25" r="18" fill="#c0392b" />
                <circle cx="33" cy="22" r="3" fill="#fff" />
                <circle cx="47" cy="22" r="3" fill="#fff" />
                <path d="M 33 32 Q 40 38 47 32" stroke="#fff" strokeWidth="2" fill="none" />
                <rect x="22" y="8" width="36" height="6" rx="3" fill="#8b0000" />
                <rect x="28" y="2" width="24" height="8" rx="2" fill="#8b0000" />
                <rect x="22" y="44" width="36" height="50" rx="4" fill="#8b0000" />
                <line x1="22" y1="55" x2="0" y2="75" stroke="#c0392b" strokeWidth="10" strokeLinecap="round" />
                <line x1="58" y1="55" x2="72" y2="70" stroke="#c0392b" strokeWidth="10" strokeLinecap="round" />
                <rect x="24" y="92" width="14" height="45" rx="4" fill="#5a0000" />
                <rect x="42" y="92" width="14" height="45" rx="4" fill="#5a0000" />
                <ellipse cx="31" cy="137" rx="12" ry="5" fill="#333" />
                <ellipse cx="49" cy="137" rx="12" ry="5" fill="#333" />
              </svg>
              <p style={s.characterLabel}>Seller</p>
            </div>

            {/* Car */}
            <div style={s.carWrap}>
              <svg width="200" height="100" viewBox="0 0 200 100">
                <rect x="10" y="45" width="180" height="40" rx="8" fill="#2a2a2a" />
                <path d="M 40 45 Q 50 15 80 12 L 140 12 Q 165 12 170 45 Z" fill="#1a1a1a" />
                <path d="M 52 42 Q 58 20 80 18 L 115 18 Q 125 18 128 42 Z" fill="#1e3a5f" opacity="0.8" />
                <path d="M 132 42 Q 135 20 142 18 L 162 18 Q 168 20 168 42 Z" fill="#1e3a5f" opacity="0.8" />
                <circle cx="45" cy="85" r="18" fill="#111" />
                <circle cx="45" cy="85" r="10" fill="#333" />
                <circle cx="45" cy="85" r="4" fill="#555" />
                <circle cx="155" cy="85" r="18" fill="#111" />
                <circle cx="155" cy="85" r="10" fill="#333" />
                <circle cx="155" cy="85" r="4" fill="#555" />
                <ellipse cx="185" cy="58" rx="8" ry="6" fill="#f0b429" opacity="0.7" />
                <ellipse cx="15" cy="58" rx="6" ry="5" fill="#c0392b" opacity="0.7" />
                <rect x="8" y="72" width="12" height="6" rx="2" fill="#888" />
                <rect x="180" y="72" width="12" height="6" rx="2" fill="#888" />
              </svg>

              {phase === "reveal" && currentReveal && (
                <div style={{
                  ...s.revealFlash,
                  backgroundColor: currentReveal.carType === "peach"
                    ? "rgba(39, 174, 96, 0.2)"
                    : "rgba(192, 57, 43, 0.2)",
                  border: `2px solid ${currentReveal.carType === "peach" ? "#27ae60" : "#c0392b"}`,
                }}>
                  <p style={{
                    ...s.revealFlashText,
                    color: currentReveal.carType === "peach" ? "#27ae60" : "#c0392b"
                  }}>
                    {currentReveal.carType === "peach" ? "PEACH — Good Car" : "LEMON — Bad Car"}
                  </p>
                  <p style={s.revealFlashValue}>
                    Worth ${currentReveal.trueValue.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Buyer */}
            <div style={s.buyerWrap}>
              <svg width="80" height="140" viewBox="0 0 80 140">
                <circle cx="40" cy="25" r="18" fill="#2980b9" />
                <line x1="30" y1="20" x2="38" y2="22" stroke="#fff" strokeWidth="2" />
                <line x1="42" y1="22" x2="50" y2="20" stroke="#fff" strokeWidth="2" />
                <path d="M 33 33 Q 40 30 47 33" stroke="#fff" strokeWidth="2" fill="none" />
                <rect x="22" y="44" width="36" height="50" rx="4" fill="#1a5276" />
                <line x1="22" y1="55" x2="10" y2="68" stroke="#2980b9" strokeWidth="10" strokeLinecap="round" />
                <line x1="58" y1="55" x2="70" y2="68" stroke="#2980b9" strokeWidth="10" strokeLinecap="round" />
                <line x1="10" y1="68" x2="45" y2="72" stroke="#2980b9" strokeWidth="8" strokeLinecap="round" />
                <line x1="70" y1="68" x2="35" y2="72" stroke="#2980b9" strokeWidth="8" strokeLinecap="round" />
                <rect x="24" y="92" width="14" height="45" rx="4" fill="#0e2d4a" />
                <rect x="42" y="92" width="14" height="45" rx="4" fill="#0e2d4a" />
                <ellipse cx="31" cy="137" rx="12" ry="5" fill="#333" />
                <ellipse cx="49" cy="137" rx="12" ry="5" fill="#333" />
              </svg>
              <p style={s.characterLabel}>You</p>
            </div>
          </div>

          {/* Round history */}
          {moves.length > 0 && (
            <div style={s.historySection}>
              <p style={s.sectionLabel}>Round History</p>
              {moves.map((m) => (
                <div key={m.round} style={s.historyRow}>
                  <span style={s.historyRound}>R{m.round}</span>
                  {warrantyMode && (
                    <span style={{
                      ...s.historyWarranty,
                      color: m.warrantyOffered ? "#27ae60" : "#c0392b"
                    }}>
                      {m.warrantyOffered ? "W" : "No W"}
                    </span>
                  )}
                  <span style={{
                    ...s.historyType,
                    color: m.carType === "peach" ? "#27ae60" : "#c0392b"
                  }}>
                    {m.carType}
                  </span>
                  <span style={s.historyDecision}>{m.decision}</span>
                  <span style={{
                    ...s.historyProfit,
                    color: m.profit > 0 ? "#27ae60" : m.profit < 0 ? "#c0392b" : "#888"
                  }}>
                    {m.profit > 0 ? "+" : ""}${m.profit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={s.gameRight}>
          {hint && (
            <div style={s.hintBox}>
              <p style={s.hintLabel}>Message from Professor</p>
              <p style={s.hintText}>{hint}</p>
              <button style={s.hintDismiss} onClick={() => setHint(null)}>Dismiss</button>
            </div>
          )}

          {phase === "loading" && (
            <div style={s.thinkingBox}>
              <div style={s.thinkingDot}></div>
              <p style={s.thinkingText}>Salesman is preparing his pitch...</p>
            </div>
          )}

          {/* PITCH PHASE */}
          {phase === "pitch" && currentPitch && (
            <div style={s.pitchSection}>
              <p style={s.sectionLabel}>Round {round} — The Salesman's Pitch</p>

              <div style={s.pitchCard}>
                <p style={s.pitchIntro}>The salesman walks over and says:</p>
                <p style={s.pitchDescription}>"{currentPitch.description}"</p>
                <div style={s.pitchPriceRow}>
                  <span style={s.pitchPriceLabel}>Asking Price</span>
                  <span style={s.pitchPrice}>${currentPitch.price.toLocaleString()}</span>
                </div>
              </div>

              {/* WARRANTY SIGNAL */}
              {warrantyMode && (
                <div style={{
                  ...s.warrantyBox,
                  borderColor: currentPitch.warrantyOffered ? "#27ae60" : "#c0392b",
                  backgroundColor: currentPitch.warrantyOffered ? "#0a2a0a" : "#1a0808",
                }}>
                  <div style={s.warrantyRow}>
                    <div style={s.warrantyIcon}>
                      {currentPitch.warrantyOffered ? "✓" : "✗"}
                    </div>
                    <div style={s.warrantyInfo}>
                      <p style={{
                        ...s.warrantyTitle,
                        color: currentPitch.warrantyOffered ? "#27ae60" : "#c0392b"
                      }}>
                        {currentPitch.warrantyOffered
                          ? "Seller is offering a warranty"
                          : "No warranty offered"}
                      </p>
                      <p style={s.warrantyDesc}>
                        {currentPitch.warrantyOffered
                          ? `Warranty costs seller $${warrantyCost} — think about why they are offering it`
                          : `Seller chose not to offer a warranty — think about what that signals`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div style={s.infoRowWrap}>
                <div style={s.infoItem}>
                  <p style={s.infoLabel}>Peach worth</p>
                  <p style={s.infoValueGreen}>${peachValue.toLocaleString()}</p>
                </div>
                <div style={s.infoItem}>
                  <p style={s.infoLabel}>Lemon worth</p>
                  <p style={s.infoValueRed}>${lemonValue.toLocaleString()}</p>
                </div>
                {warrantyMode && (
                  <div style={s.infoItem}>
                    <p style={s.infoLabel}>Warranty cost</p>
                    <p style={s.infoValue}>${warrantyCost}</p>
                  </div>
                )}
              </div>

              <p style={s.decisionPrompt}>
                {warrantyMode
                  ? `${studentName}, use the price and warranty signal to make your decision.`
                  : `${studentName}, do you believe him? Remember — both peach and lemon sellers have every incentive to sound convincing.`
                }
              </p>

              <div style={s.decisionBtns}>
                <button style={s.walkBtn} onClick={() => handleDecision("walk")}>
                  <span style={s.btnTitle}>Walk Away</span>
                  <span style={s.btnSub}>Too risky, earn $0</span>
                </button>
                <button style={s.buyBtn} onClick={() => handleDecision("buy")}>
                  <span style={s.btnTitle}>Buy the Car</span>
                  <span style={s.btnSub}>Trust the salesman</span>
                </button>
              </div>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === "reveal" && currentReveal && (
            <div style={s.revealSection}>
              <p style={s.sectionLabel}>Round {currentReveal.round} — The Truth</p>

              <div style={{
                ...s.revealCard,
                borderColor: currentReveal.carType === "peach" ? "#27ae60" : "#c0392b",
                backgroundColor: currentReveal.carType === "peach" ? "#0a2a0a" : "#1a0808",
              }}>
                <p style={{
                  ...s.revealCarType,
                  color: currentReveal.carType === "peach" ? "#27ae60" : "#c0392b"
                }}>
                  {currentReveal.carType === "peach" ? "It was a Peach" : "It was a Lemon"}
                </p>
                <p style={s.revealTrueValue}>
                  True value: ${currentReveal.trueValue.toLocaleString()}
                </p>
                {warrantyMode && (
                  <p style={{
                    ...s.revealWarranty,
                    color: currentReveal.warrantyOffered ? "#27ae60" : "#c0392b"
                  }}>
                    {currentReveal.warrantyOffered
                      ? "Warranty was offered — signal was honest"
                      : "No warranty was offered — signal was honest"}
                  </p>
                )}
              </div>

              <div style={s.revealProfitCard}>
                <p style={s.revealDecision}>
                  You chose to <strong>{currentReveal.decision}</strong>
                </p>
                {currentReveal.decision === "buy" && (
                  <p style={{
                    ...s.revealProfitNum,
                    color: currentReveal.profit >= 0 ? "#27ae60" : "#c0392b"
                  }}>
                    {currentReveal.profit >= 0 ? "+" : ""}${currentReveal.profit}
                  </p>
                )}
                {currentReveal.decision === "walk" && (
                  <p style={{ ...s.revealProfitNum, color: "#888" }}>$0</p>
                )}
                <p style={s.totalSoFar}>
                  Running total:{" "}
                  <span style={{ color: totalProfit >= 0 ? "#27ae60" : "#c0392b", fontWeight: "700" }}>
                    {totalProfit >= 0 ? "+" : ""}${totalProfit}
                  </span>
                </p>
              </div>

              {currentReveal.aiReasoning && (
                <div style={s.reasoningBox}>
                  <p style={s.reasoningLabel}>What the salesman was thinking</p>
                  <p style={s.reasoningText}>"{currentReveal.aiReasoning}"</p>
                </div>
              )}

              <button style={s.continueBtn} onClick={handleContinue}>
                {gameOverData ? "See Final Results →" : `Continue to Round ${round + 1} →`}
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
    minHeight: "100vh", backgroundColor: "#0f0f0f",
    display: "flex", flexDirection: "column",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 40px", borderBottom: "1px solid #1f1f1f", backgroundColor: "#0a0a0a",
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
  warrantyModeBadge: {
    fontSize: "12px", color: "#27ae60", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "1px",
    backgroundColor: "#0a2a0a", padding: "4px 10px",
    borderRadius: "4px", border: "1px solid #27ae60",
  },
  topRight: { display: "flex", alignItems: "center", gap: "16px" },
  roundBadge: { fontSize: "13px", color: "#c0392b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  profitBadge: { fontSize: "14px", fontWeight: "700" },
  backToMenu: {
    padding: "8px 16px", borderRadius: "6px", border: "1px solid #333",
    backgroundColor: "transparent", color: "#888", fontSize: "13px", cursor: "pointer",
  },
  gameInner: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
  gameLeft: {
    padding: "32px 40px", borderRight: "1px solid #1f1f1f",
    display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto",
  },
  scene: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    position: "relative", height: "200px",
    backgroundColor: "#0a0a0a", borderRadius: "12px",
    border: "1px solid #1f1f1f", padding: "0 20px", overflow: "hidden",
  },
  sceneBackground: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  skyGradient: {
    position: "absolute", top: 0, left: 0, right: 0, height: "60%",
    background: "linear-gradient(to bottom, #0a0a1a, #0f0f2a)",
  },
  groundLine: {
    position: "absolute", bottom: "40px", left: 0, right: 0,
    height: "2px", backgroundColor: "#1f1f1f",
  },
  sellerWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    position: "relative", zIndex: 1, marginBottom: "8px",
  },
  buyerWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    position: "relative", zIndex: 1, marginBottom: "8px",
  },
  characterLabel: {
    fontSize: "11px", color: "#555", textTransform: "uppercase",
    letterSpacing: "1px", margin: "4px 0 0 0", fontWeight: "700",
  },
  carWrap: { position: "relative", zIndex: 1, marginBottom: "12px" },
  revealFlash: {
    position: "absolute", top: "-10px", left: "50%",
    transform: "translateX(-50%)", borderRadius: "8px",
    padding: "8px 16px", textAlign: "center", minWidth: "160px",
  },
  revealFlashText: { fontSize: "16px", fontWeight: "900", margin: 0 },
  revealFlashValue: { fontSize: "13px", color: "#cccccc", margin: "4px 0 0 0" },
  sectionLabel: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  historySection: { display: "flex", flexDirection: "column", gap: "8px" },
  historyRow: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 14px", backgroundColor: "#1a1a1a",
    borderRadius: "6px", border: "1px solid #2a2a2a",
  },
  historyRound: { fontSize: "12px", color: "#c0392b", fontWeight: "700", width: "28px" },
  historyWarranty: { fontSize: "12px", fontWeight: "700", width: "36px", textAlign: "center" },
  historyType: { fontSize: "13px", fontWeight: "700", width: "56px", textTransform: "capitalize" },
  historyDecision: { fontSize: "13px", color: "#888", flex: 1, textTransform: "capitalize" },
  historyProfit: { fontSize: "14px", fontWeight: "700" },
  gameRight: {
    padding: "48px 40px", display: "flex",
    flexDirection: "column", gap: "24px",
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
  thinkingBox: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 20px", backgroundColor: "#1a1a1a",
    borderRadius: "8px", border: "1px solid #2a2a2a",
  },
  thinkingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c0392b" },
  thinkingText: { fontSize: "15px", color: "#888", margin: 0 },
  pitchSection: { display: "flex", flexDirection: "column", gap: "16px" },
  pitchCard: {
    backgroundColor: "#141414", border: "1px solid #2a2a2a",
    borderLeft: "4px solid #f0b429", borderRadius: "8px", padding: "24px",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  pitchIntro: { fontSize: "13px", color: "#666", margin: 0, fontStyle: "italic" },
  pitchDescription: { fontSize: "18px", color: "#ffffff", lineHeight: "1.7", margin: 0, fontStyle: "italic" },
  pitchPriceRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingTop: "16px", borderTop: "1px solid #2a2a2a",
  },
  pitchPriceLabel: { fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" },
  pitchPrice: { fontSize: "32px", color: "#f0b429", fontWeight: "900" },
  warrantyBox: {
    borderRadius: "8px", border: "2px solid",
    padding: "16px", display: "flex", flexDirection: "column", gap: "8px",
  },
  warrantyRow: { display: "flex", alignItems: "center", gap: "16px" },
  warrantyIcon: {
    fontSize: "28px", fontWeight: "900", width: "40px",
    height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.3)",
  },
  warrantyInfo: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  warrantyTitle: { fontSize: "16px", fontWeight: "700", margin: 0 },
  warrantyDesc: { fontSize: "13px", color: "#888", margin: 0, lineHeight: "1.5" },
  infoRowWrap: { display: "flex", gap: "12px" },
  infoItem: {
    flex: 1, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "12px", textAlign: "center",
  },
  infoLabel: { fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px 0" },
  infoValue: { fontSize: "14px", color: "#ffffff", fontWeight: "700", margin: 0 },
  infoValueGreen: { fontSize: "14px", color: "#27ae60", fontWeight: "700", margin: 0 },
  infoValueRed: { fontSize: "14px", color: "#c0392b", fontWeight: "700", margin: 0 },
  decisionPrompt: {
    fontSize: "14px", color: "#888", lineHeight: "1.7", margin: 0,
    padding: "12px 16px", backgroundColor: "#141414",
    borderRadius: "6px", border: "1px solid #1f1f1f", fontStyle: "italic",
  },
  decisionBtns: { display: "flex", gap: "12px" },
  walkBtn: {
    flex: 1, padding: "22px 20px", borderRadius: "8px",
    border: "2px solid #333", backgroundColor: "transparent",
    color: "#ffffff", fontSize: "16px", cursor: "pointer",
    fontWeight: "700", textAlign: "left",
    display: "flex", flexDirection: "column", gap: "6px",
  },
  buyBtn: {
    flex: 1, padding: "22px 20px", borderRadius: "8px",
    border: "none", backgroundColor: "#c0392b",
    color: "#ffffff", fontSize: "16px", cursor: "pointer",
    fontWeight: "700", textAlign: "left",
    display: "flex", flexDirection: "column", gap: "6px",
  },
  btnTitle: { fontSize: "18px", fontWeight: "900" },
  btnSub: { fontSize: "13px", fontWeight: "400", opacity: 0.7 },
  revealSection: { display: "flex", flexDirection: "column", gap: "16px" },
  revealCard: {
    borderRadius: "12px", border: "2px solid", padding: "24px",
    textAlign: "center", display: "flex", flexDirection: "column", gap: "8px",
  },
  revealCarType: { fontSize: "28px", fontWeight: "900", margin: 0 },
  revealTrueValue: { fontSize: "16px", color: "#cccccc", margin: 0 },
  revealWarranty: { fontSize: "14px", margin: 0, fontWeight: "600" },
  revealProfitCard: {
    backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "20px", textAlign: "center",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  revealDecision: { fontSize: "15px", color: "#aaaaaa", margin: 0 },
  revealProfitNum: { fontSize: "48px", fontWeight: "900", margin: 0 },
  totalSoFar: { fontSize: "14px", color: "#666", margin: 0 },
  reasoningBox: {
    backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f",
    borderLeft: "4px solid #555", borderRadius: "8px", padding: "20px",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  reasoningLabel: {
    fontSize: "11px", color: "#555", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  reasoningText: { fontSize: "15px", color: "#888", margin: 0, fontStyle: "italic", lineHeight: "1.6" },
  continueBtn: {
    width: "100%", padding: "16px", borderRadius: "8px", border: "none",
    backgroundColor: "#27ae60", color: "#ffffff", fontSize: "16px",
    cursor: "pointer", fontWeight: "700",
  },
};

export default LemonsGame;