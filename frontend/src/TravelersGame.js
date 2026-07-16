import { useState, useEffect } from "react";

function TravelersGame({ studentName, sessionId, totalRounds, minClaim, maxClaim, increment, penaltyReward, onComplete, onBack, api }) {
  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [totalScore, setTotalScore] = useState({ student: 0, ai: 0 });
  const [aiThinking, setAiThinking] = useState(false);
  const [hint, setHint] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(maxClaim);
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
      setAgentType(data.travelers_dilemma.agent_type);
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, [api]);

  const validClaims = [];
  let c = minClaim;
  while (c <= maxClaim + 0.001) {
    validClaims.push(Math.round(c * 100) / 100);
    c += increment;
  }

  const handleMove = async () => {
    setAiThinking(true);
    const res = await fetch(`${api}/move/travelers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, student_claim: selectedClaim }),
    });
    const data = await res.json();
    setAiThinking(false);

    const newMove = {
      round: data.round,
      studentClaim: selectedClaim,
      aiClaim: data.ai_claim,
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

  const getResultMessage = (result) => {
    if (result.studentClaim === result.aiClaim) {
      return `Both claimed $${result.studentClaim.toFixed(2)} — equal claims, no penalty or reward`;
    } else if (result.studentClaim < result.aiClaim) {
      return `You claimed lower — you earn $${result.studentClaim.toFixed(2)} + $${penaltyReward} reward`;
    } else {
      return `AI claimed lower — you earn $${result.aiClaim.toFixed(2)} - $${penaltyReward} penalty`;
    }
  };

  return (
    <div style={s.gamePage}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Traveler's Dilemma</span>
          <span style={s.topSep}>|</span>
          <span style={s.agentBadge}>{agentType} agent</span>
        </div>
        <div style={s.topRight}>
          <button style={s.backToMenu} onClick={onBack}>Back to Menu</button>
          <span style={s.roundBadge}>Round {round} of {totalRounds}</span>
          <span style={s.scoreBadge}>
            You: ${totalScore.student.toFixed(2)} | AI: ${totalScore.ai.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={s.gameInner}>
        <div style={s.gameLeft}>
          <h2 style={s.gameTitle}>The Claim Office</h2>
          <p style={s.gameDesc}>
            You and the AI are filing your luggage claims simultaneously.
            Neither can see the other's claim until both are submitted.
            The airline pays the lower claim to both — but rewards the
            lower claimer and penalizes the higher one.
          </p>

          <div style={s.rulesBox}>
            <p style={s.sectionLabel}>How Payoffs Work</p>
            <div style={s.ruleRow}>
              <span style={s.ruleIcon}>＝</span>
              <span style={s.ruleText}>Equal claims — both earn that exact amount</span>
            </div>
            <div style={s.ruleRow}>
              <span style={s.ruleIconGreen}>↓</span>
              <span style={s.ruleText}>Lower claimer earns their claim + ${penaltyReward} reward</span>
            </div>
            <div style={s.ruleRow}>
              <span style={s.ruleIconRed}>↑</span>
              <span style={s.ruleText}>Higher claimer earns lower claim - ${penaltyReward} penalty</span>
            </div>
          </div>

          {moves.length > 0 && (
            <div style={s.historySection}>
              <p style={s.sectionLabel}>Round History</p>
              {moves.map((m) => (
                <div key={m.round} style={s.historyRow}>
                  <span style={s.historyRound}>R{m.round}</span>
                  <span style={s.historyMove}>You: <strong>${m.studentClaim.toFixed(2)}</strong></span>
                  <span style={s.historyMove}>AI: <strong>${m.aiClaim.toFixed(2)}</strong></span>
                  <span style={s.historyScore}>+${m.studentPayoff.toFixed(2)}</span>
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
                  <p style={s.resultLabel}>Your Claim</p>
                  <p style={s.resultValue}>${currentResult.studentClaim.toFixed(2)}</p>
                </div>
                <div style={s.resultItem}>
                  <p style={s.resultLabel}>AI Claim</p>
                  <p style={s.resultValue}>${currentResult.aiClaim.toFixed(2)}</p>
                </div>
                <div style={s.resultItem}>
                  <p style={s.resultLabel}>You Earned</p>
                  <p style={s.resultValue}>${currentResult.studentPayoff.toFixed(2)}</p>
                </div>
              </div>
              <p style={s.resultMsg}>{getResultMessage(currentResult)}</p>
            </div>
          )}

          {aiThinking && (
            <div style={s.thinkingBox}>
              <div style={s.thinkingDot}></div>
              <p style={s.thinkingText}>AI is filing its claim...</p>
            </div>
          )}

          {!aiThinking && (
            <div style={s.moveSection}>
              <p style={s.sectionLabel}>Your Claim, {studentName}</p>
              <p style={s.claimDesc}>
                Choose your luggage claim. Valid range: ${minClaim.toFixed(2)} to ${maxClaim.toFixed(2)}
              </p>

              <div style={s.claimDisplay}>
                <p style={s.claimAmount}>${selectedClaim.toFixed(2)}</p>
                <p style={s.claimLabel}>Your claim</p>
              </div>

              <input
                style={s.slider}
                type="range"
                min={0}
                max={validClaims.length - 1}
                step={1}
                value={validClaims.indexOf(selectedClaim) === -1 ? validClaims.length - 1 : validClaims.indexOf(selectedClaim)}
                onChange={(e) => setSelectedClaim(validClaims[parseInt(e.target.value)])}
              />

              <div style={s.sliderLabels}>
                <span style={s.sliderLabel}>${minClaim.toFixed(2)}</span>
                <span style={s.sliderLabel}>${((minClaim + maxClaim) / 2).toFixed(2)}</span>
                <span style={s.sliderLabel}>${maxClaim.toFixed(2)}</span>
              </div>

              <div style={s.quickSelect}>
                <p style={s.quickLabel}>Quick select:</p>
                <div style={s.quickBtns}>
                  {validClaims.filter((_, i) => i % 2 === 0).map((claim) => (
                    <button
                      key={claim}
                      style={{
                        ...s.quickBtn,
                        ...(selectedClaim === claim ? s.quickBtnActive : {}),
                      }}
                      onClick={() => setSelectedClaim(claim)}
                    >
                      ${claim.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              <button style={s.submitBtn} onClick={handleMove}>
                Submit Claim of ${selectedClaim.toFixed(2)}
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
    display: "flex", flexDirection: "column", gap: "28px", overflowY: "auto",
  },
  gameTitle: { fontSize: "40px", color: "#ffffff", margin: 0, fontWeight: "900", letterSpacing: "-1px" },
  gameDesc: { fontSize: "17px", color: "#cccccc", lineHeight: "1.8", margin: 0 },
  rulesBox: {
    backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "20px",
    display: "flex", flexDirection: "column", gap: "14px",
  },
  sectionLabel: {
    fontSize: "12px", color: "#c0392b", textTransform: "uppercase",
    letterSpacing: "2px", margin: 0, fontWeight: "700",
  },
  ruleRow: { display: "flex", alignItems: "center", gap: "14px" },
  ruleIcon: { fontSize: "18px", color: "#888", width: "22px", textAlign: "center" },
  ruleIconGreen: { fontSize: "18px", color: "#27ae60", width: "22px", textAlign: "center", fontWeight: "900" },
  ruleIconRed: { fontSize: "18px", color: "#c0392b", width: "22px", textAlign: "center", fontWeight: "900" },
  ruleText: { fontSize: "15px", color: "#cccccc" },
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
    display: "flex", flexDirection: "column", gap: "12px",
  },
  resultRow: { display: "flex", gap: "16px" },
  resultItem: { flex: 1, textAlign: "center" },
  resultLabel: {
    fontSize: "12px", color: "#666", textTransform: "uppercase",
    letterSpacing: "1px", margin: "0 0 4px 0",
  },
  resultValue: { fontSize: "22px", color: "#ffffff", fontWeight: "700", margin: 0 },
  resultMsg: { fontSize: "14px", color: "#888", margin: 0, textAlign: "center", fontStyle: "italic" },
  thinkingBox: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 20px", backgroundColor: "#1a1a1a",
    borderRadius: "8px", border: "1px solid #2a2a2a",
  },
  thinkingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c0392b" },
  thinkingText: { fontSize: "15px", color: "#888", margin: 0 },
  moveSection: { display: "flex", flexDirection: "column", gap: "16px" },
  claimDesc: { fontSize: "14px", color: "#777", margin: 0 },
  claimDisplay: {
    textAlign: "center", padding: "28px",
    backgroundColor: "#141414", borderRadius: "8px", border: "1px solid #1f1f1f",
  },
  claimAmount: { fontSize: "56px", fontWeight: "900", color: "#f0b429", margin: 0, letterSpacing: "-2px" },
  claimLabel: { fontSize: "12px", color: "#555", margin: "6px 0 0 0", textTransform: "uppercase", letterSpacing: "1px" },
  slider: { width: "100%", accentColor: "#c0392b", cursor: "pointer", height: "6px" },
  sliderLabels: { display: "flex", justifyContent: "space-between", marginTop: "-8px" },
  sliderLabel: { fontSize: "12px", color: "#555" },
  quickSelect: { display: "flex", flexDirection: "column", gap: "8px" },
  quickLabel: { fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", margin: 0 },
  quickBtns: { display: "flex", gap: "8px", flexWrap: "wrap" },
  quickBtn: {
    padding: "9px 14px", borderRadius: "6px", border: "1px solid #2a2a2a",
    backgroundColor: "#141414", color: "#888", fontSize: "14px", cursor: "pointer", fontWeight: "600",
  },
  quickBtnActive: {
    backgroundColor: "#1a0808", border: "1px solid #c0392b", color: "#ffffff",
  },
  submitBtn: {
    width: "100%", padding: "20px", borderRadius: "8px", border: "none",
    backgroundColor: "#c0392b", color: "#ffffff", fontSize: "17px",
    cursor: "pointer", fontWeight: "700",
  },
};

export default TravelersGame;