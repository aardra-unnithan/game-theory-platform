import { useState, useEffect } from "react";

function CentipedeGame({ studentName, sessionId, totalStages, onComplete, onBack, api }) {
  const [moves, setMoves] = useState([]);
  const [currentStage, setCurrentStage] = useState(1);
  const [aiThinking, setAiThinking] = useState(false);
  const [hint, setHint] = useState(null);
  const [lastAiMove, setLastAiMove] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`${api}/hint/${sessionId}`);
      const data = await res.json();
      if (data.hint) setHint(data.hint);
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId, api]);

  const handleMove = async (studentMove) => {
    setAiThinking(true);
    const res = await fetch(`${api}/move/centipede`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        student_move: studentMove,
      }),
    });
    const data = await res.json();
    setAiThinking(false);

    setMoves(data.moves);

    if (data.game_over) {
      setGameOver(true);
      onComplete({
        moves: data.moves,
        stoppedBy: data.stopped_by,
        stage: data.stage,
        studentPayoff: data.student_payoff,
        aiPayoff: data.ai_payoff,
        analysis: data.analysis,
      });
    } else {
      setCurrentStage(data.current_stage);
      if (data.ai_move) {
        setLastAiMove({
          move: data.ai_move,
          reasoning: data.ai_reasoning,
          stage: data.current_stage - 1,
        });
      }
    }
  };

  // Build payoff table
  const buildPayoffTable = () => {
    const rows = [];
    let high = 0.40;
    let low = 0.10;
    for (let stage = 1; stage <= totalStages; stage++) {
      const isStudentTurn = stage % 2 === 1;
      rows.push({
        stage,
        mover: isStudentTurn ? "You (A)" : "AI (B)",
        studentPayoff: isStudentTurn ? high.toFixed(2) : low.toFixed(2),
        aiPayoff: isStudentTurn ? low.toFixed(2) : high.toFixed(2),
        isCurrent: stage === currentStage,
      });
      high = high * 2;
      low = low * 2;
    }
    return rows;
  };

  const payoffTable = buildPayoffTable();

  return (
    <div style={s.gamePage}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Centipede Game</span>
        </div>
        <div style={s.topRight}>
          <button style={s.backToMenu} onClick={onBack}>
            Back to Menu
          </button>
          <span style={s.stageBadge}>
            Stage {currentStage} of {totalStages}
          </span>
        </div>
      </div>

      <div style={s.gameInner}>
        {/* LEFT — Payoff table and move history */}
        <div style={s.gameLeft}>
          <h2 style={s.gameTitle}>The Centipede Game</h2>
          <p style={s.gameDesc}>
            You are Player A. On your turn choose Stop or Continue.
            If you Continue, the AI decides next. Payoffs grow each
            stage but whoever Stops gets the bigger share right now.
          </p>

          {/* Payoff table */}
          <div style={s.tableSection}>
            <p style={s.sectionLabel}>Payoff Table</p>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Stage</th>
                  <th style={s.th}>Who Decides</th>
                  <th style={s.th}>Your Payoff if Stop</th>
                  <th style={s.th}>AI Payoff if Stop</th>
                </tr>
              </thead>
              <tbody>
                {payoffTable.map((row) => (
                  <tr key={row.stage}>
                    <td style={row.isCurrent ? s.tdActive : s.td}>
                      {row.stage}
                    </td>
                    <td style={row.isCurrent ? s.tdActive : s.td}>
                      {row.mover}
                    </td>
                    <td style={row.isCurrent ? s.tdActive : s.td}>
                      ${row.studentPayoff}
                    </td>
                    <td style={row.isCurrent ? s.tdActive : s.td}>
                      ${row.aiPayoff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Move history */}
          {moves.length > 0 && (
            <div style={s.historySection}>
              <p style={s.sectionLabel}>Move History</p>
              {moves.map((m, i) => (
                <div key={i} style={s.historyRow}>
                  <span style={s.historyStage}>Stage {m.stage}</span>
                  <span style={s.historyMover}>{m.mover}</span>
                  <span style={{
                    ...s.historyMove,
                    color: m.move === "stop" ? "#c0392b" : "#27ae60",
                  }}>
                    {m.move.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Decision area */}
        <div style={s.gameRight}>
          {/* Hint from professor */}
          {hint && (
            <div style={s.hintBox}>
              <p style={s.hintLabel}>Message from Professor</p>
              <p style={s.hintText}>{hint}</p>
              <button style={s.hintDismiss} onClick={() => setHint(null)}>
                Dismiss
              </button>
            </div>
          )}

          {/* Last AI move */}
          {lastAiMove && (
            <div style={s.aiMoveBox}>
              <p style={s.sectionLabel}>AI Decision — Stage {lastAiMove.stage}</p>
              <p style={s.aiMoveText}>
                AI chose <strong style={{
                  color: lastAiMove.move === "stop" ? "#c0392b" : "#27ae60"
                }}>{lastAiMove.move.toUpperCase()}</strong>
              </p>
              <p style={s.aiReasonText}>Now it is your turn.</p>
            </div>
          )}

          {/* AI thinking */}
          {aiThinking && (
            <div style={s.thinkingBox}>
              <div style={s.thinkingDot}></div>
              <p style={s.thinkingText}>AI is deliberating...</p>
            </div>
          )}

          {/* Move buttons — only show on student's turn (odd stages) */}
          {!aiThinking && !gameOver && currentStage % 2 === 1 && (
            <div style={s.moveSection}>
              <p style={s.sectionLabel}>Your Decision, {studentName}</p>
              <p style={s.currentPayoff}>
                If you Stop now — You get ${payoffTable[currentStage - 1]?.studentPayoff},
                AI gets ${payoffTable[currentStage - 1]?.aiPayoff}
              </p>
              <button
                style={s.stopBtn}
                onClick={() => handleMove("stop")}
              >
                <span style={s.btnTitle}>Stop</span>
                <span style={s.btnSub}>Take the payoff now</span>
              </button>
              <button
                style={s.continueBtn}
                onClick={() => handleMove("continue")}
              >
                <span style={s.btnTitle}>Continue</span>
                <span style={s.btnSub}>Let payoffs grow — AI decides next</span>
              </button>
            </div>
          )}

          {/* Waiting for AI */}
          {!aiThinking && !gameOver && currentStage % 2 === 0 && (
            <div style={s.waitingBox}>
              <p style={s.waitingText}>Waiting for AI to decide...</p>
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
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  stageBadge: {
    fontSize: "12px",
    color: "#c0392b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  backToMenu: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
  },
  gameInner: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0",
  },
  gameLeft: {
    padding: "48px 40px",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    overflowY: "auto",
  },
  gameTitle: {
    fontSize: "36px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-1px",
  },
  gameDesc: {
    fontSize: "15px",
    color: "#aaaaaa",
    lineHeight: "1.8",
    margin: 0,
  },
  tableSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "13px",
  },
  th: {
    border: "1px solid #2a2a2a",
    padding: "10px 12px",
    color: "#555",
    textAlign: "center",
    backgroundColor: "#111",
    fontWeight: "700",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  td: {
    border: "1px solid #1f1f1f",
    padding: "10px 12px",
    color: "#666",
    textAlign: "center",
  },
  tdActive: {
    border: "1px solid #c0392b",
    padding: "10px 12px",
    color: "#ffffff",
    textAlign: "center",
    backgroundColor: "#1a0808",
    fontWeight: "700",
  },
  historySection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  historyRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 14px",
    backgroundColor: "#1a1a1a",
    borderRadius: "6px",
    border: "1px solid #2a2a2a",
  },
  historyStage: {
    fontSize: "11px",
    color: "#c0392b",
    fontWeight: "700",
    width: "52px",
  },
  historyMover: {
    fontSize: "13px",
    color: "#666",
    flex: 1,
  },
  historyMove: {
    fontSize: "13px",
    fontWeight: "700",
  },
  gameRight: {
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    justifyContent: "center",
  },
  hintBox: {
    backgroundColor: "#1a1500",
    border: "1px solid #4a3800",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  hintLabel: {
    fontSize: "10px",
    color: "#f0b429",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  hintText: {
    fontSize: "15px",
    color: "#f0b429",
    margin: 0,
    lineHeight: "1.6",
  },
  hintDismiss: {
    alignSelf: "flex-start",
    padding: "6px 14px",
    borderRadius: "4px",
    border: "1px solid #4a3800",
    backgroundColor: "transparent",
    color: "#f0b429",
    fontSize: "12px",
    cursor: "pointer",
  },
  aiMoveBox: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  aiMoveText: {
    fontSize: "18px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "700",
  },
  aiReasonText: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  thinkingBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
  },
  thinkingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#c0392b",
  },
  thinkingText: {
    fontSize: "14px",
    color: "#888",
    margin: 0,
  },
  moveSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  currentPayoff: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    padding: "12px 16px",
    backgroundColor: "#141414",
    borderRadius: "6px",
    border: "1px solid #1f1f1f",
  },
  stopBtn: {
    width: "100%",
    padding: "20px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "700",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  continueBtn: {
    width: "100%",
    padding: "20px 24px",
    borderRadius: "8px",
    border: "2px solid #333",
    backgroundColor: "transparent",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "700",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  btnTitle: {
    fontSize: "18px",
    fontWeight: "900",
  },
  btnSub: {
    fontSize: "12px",
    fontWeight: "400",
    opacity: 0.7,
  },
  waitingBox: {
    padding: "24px",
    backgroundColor: "#141414",
    borderRadius: "8px",
    border: "1px solid #1f1f1f",
    textAlign: "center",
  },
  waitingText: {
    fontSize: "15px",
    color: "#555",
    margin: 0,
    fontStyle: "italic",
  },
};

export default CentipedeGame;