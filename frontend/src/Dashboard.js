import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

function Dashboard({ onBack }) {
  const [profSessions, setProfSessions] = useState([]);
  const [profStats, setProfStats] = useState(null);
  const [hintText, setHintText] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profMessage, setProfMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`${API}/professor/stats`);
      const data = await res.json();
      setProfStats(data);
      setProfSessions(data.sessions);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendHint = async (sessionId) => {
    if (!hintText.trim()) return;
    await fetch(`${API}/professor/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        professor_message: hintText,
      }),
    });
    setHintText("");
    setSelectedStudent(null);
    setProfMessage("Hint sent successfully.");
    setTimeout(() => setProfMessage(""), 3000);
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    await fetch(`${API}/professor/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: "all",
        professor_message: broadcastText,
      }),
    });
    setBroadcastText("");
    setProfMessage("Broadcast sent to all students.");
    setTimeout(() => setProfMessage(""), 3000);
  };

  const totalCooperate = profStats?.total_cooperate || 0;
  const totalDefect = profStats?.total_defect || 0;
  const totalMoves = totalCooperate + totalDefect;
  const cooperatePercent = totalMoves > 0
    ? Math.round((totalCooperate / totalMoves) * 100)
    : 0;
  const defectPercent = totalMoves > 0
    ? Math.round((totalDefect / totalMoves) * 100)
    : 0;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.topLabel}>GameTheory Lab</span>
          <span style={s.topSep}>|</span>
          <span style={s.topLabel}>Professor Dashboard</span>
        </div>
        <div style={s.topRight}>
          <span style={s.liveDot}></span>
          <span style={s.liveText}>Live</span>
          <button style={s.exitBtn} onClick={onBack}>
            Exit Dashboard
          </button>
        </div>
      </div>

      <div style={s.inner}>
        {/* LEFT COLUMN */}
        <div style={s.left}>

          {/* Stats */}
          <div style={s.statsRow}>
            <div style={s.statBox}>
              <p style={s.statNum}>{profStats?.total_students || 0}</p>
              <p style={s.statLabel}>Students Active</p>
            </div>
            <div style={s.statBox}>
              <p style={s.statNum}>{cooperatePercent}%</p>
              <p style={s.statLabel}>Cooperating</p>
            </div>
            <div style={s.statBox}>
              <p style={s.statNum}>{defectPercent}%</p>
              <p style={s.statLabel}>Defecting</p>
            </div>
            <div style={s.statBox}>
              <p style={s.statNum}>{totalMoves}</p>
              <p style={s.statLabel}>Total Moves</p>
            </div>
          </div>

          {/* Bar chart */}
          <div style={s.chartBox}>
            <p style={s.sectionLabel}>
              Class Wide — Cooperation vs Defection
            </p>
            <div style={s.barWrap}>
              <div style={s.barRow}>
                <span style={s.barLabel}>Silence</span>
                <div style={s.barTrack}>
                  <div
                    style={{
                      ...s.barFill,
                      width: `${cooperatePercent}%`,
                      backgroundColor: "#27ae60",
                    }}
                  ></div>
                </div>
                <span style={s.barPct}>{cooperatePercent}%</span>
              </div>
              <div style={s.barRow}>
                <span style={s.barLabel}>Testify</span>
                <div style={s.barTrack}>
                  <div
                    style={{
                      ...s.barFill,
                      width: `${defectPercent}%`,
                      backgroundColor: "#c0392b",
                    }}
                  ></div>
                </div>
                <span style={s.barPct}>{defectPercent}%</span>
              </div>
            </div>
          </div>

          {/* Student list */}
          <div style={s.studentListBox}>
            <p style={s.sectionLabel}>Active Students</p>
            {profSessions.length === 0 && (
              <p style={s.emptyText}>
                No students have joined yet. Updates every 3 seconds.
              </p>
            )}
            {profSessions.map((session) => {
              const lastMove = session.moves[session.moves.length - 1];
              return (
                <div key={session.session_id} style={s.studentRow}>
                  <div style={s.studentInfo}>
                    <p style={s.studentName}>{session.student_name}</p>
                    <p style={s.studentMeta}>
                      Round {Math.max(session.current_round - 1, 0)} of 5 —
                      Score: {session.total_student_score} pts —
                      Status: {session.game_status}
                    </p>
                    {lastMove && (
                      <p style={s.studentLastMove}>
                        Last move:{" "}
                        <strong>{lastMove.student_move}</strong> vs AI:{" "}
                        <strong>{lastMove.ai_move}</strong>
                      </p>
                    )}
                  </div>
                  <button
                    style={s.hintBtn}
                    onClick={() => setSelectedStudent(session)}
                  >
                    Send Hint
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={s.right}>
          {profMessage && (
            <div style={s.successBox}>
              <p style={s.successText}>{profMessage}</p>
            </div>
          )}

          {/* Send hint to student */}
          <div style={s.dashCard}>
            <p style={s.sectionLabel}>Send Hint to Student</p>
            {selectedStudent ? (
              <>
                <p style={s.selectedName}>
                  Sending to:{" "}
                  <strong>{selectedStudent.student_name}</strong>
                </p>
                <textarea
                  style={s.textarea}
                  placeholder="Type your hint here..."
                  value={hintText}
                  onChange={(e) => setHintText(e.target.value)}
                  rows={4}
                />
                <div style={s.btnRow}>
                  <button
                    style={s.sendBtn}
                    onClick={() => sendHint(selectedStudent.session_id)}
                  >
                    Send Hint
                  </button>
                  <button
                    style={s.cancelBtn}
                    onClick={() => setSelectedStudent(null)}
                  >
                    Cancel
                  </button>
                </div>

                {/* Show that student's moves */}
                {selectedStudent.moves.length > 0 && (
                  <div style={s.studentMoves}>
                    <p style={s.sectionLabel}>
                      {selectedStudent.student_name}'s Moves
                    </p>
                    {selectedStudent.moves.map((m) => (
                      <div key={m.round} style={s.summaryRow}>
                        <span style={s.summaryRound}>Round {m.round}</span>
                        <span style={s.summaryMove}>
                          Student: {m.student_move}
                        </span>
                        <span style={s.summaryMove}>AI: {m.ai_move}</span>
                        <span style={s.summaryPts}>+{m.student_payoff}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p style={s.emptyText}>
                Click "Send Hint" next to a student on the left to send
                them a private message.
              </p>
            )}
          </div>

          {/* Broadcast */}
          <div style={s.dashCard}>
            <p style={s.sectionLabel}>Broadcast to All Students</p>
            <p style={s.broadcastDesc}>
              This message will appear on every active student's screen
              immediately.
            </p>
            <textarea
              style={s.textarea}
              placeholder="Type your broadcast message..."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              rows={3}
            />
            <button style={s.sendBtn} onClick={sendBroadcast}>
              Broadcast to All
            </button>
          </div>
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
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#27ae60",
    display: "inline-block",
  },
  liveText: {
    fontSize: "12px",
    color: "#27ae60",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  exitBtn: {
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
    gridTemplateColumns: "1.4fr 1fr",
    gap: "0",
  },
  left: {
    padding: "40px",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    overflowY: "auto",
  },
  right: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflowY: "auto",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  statBox: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
  },
  statNum: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#c0392b",
    margin: "0 0 4px 0",
  },
  statLabel: {
    fontSize: "10px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  chartBox: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  barWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  barLabel: {
    fontSize: "12px",
    color: "#aaaaaa",
    width: "60px",
  },
  barTrack: {
    flex: 1,
    height: "12px",
    backgroundColor: "#2a2a2a",
    borderRadius: "6px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.5s ease",
  },
  barPct: {
    fontSize: "12px",
    color: "#ffffff",
    fontWeight: "700",
    width: "40px",
    textAlign: "right",
  },
  studentListBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  studentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
    gap: "16px",
  },
  studentInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  studentName: {
    fontSize: "16px",
    color: "#ffffff",
    fontWeight: "700",
    margin: 0,
  },
  studentMeta: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
  },
  studentLastMove: {
    fontSize: "13px",
    color: "#aaaaaa",
    margin: 0,
  },
  hintBtn: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1px solid #c0392b",
    backgroundColor: "transparent",
    color: "#c0392b",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  dashCard: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  selectedName: {
    fontSize: "14px",
    color: "#aaaaaa",
    margin: 0,
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    outline: "none",
    resize: "vertical",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
  },
  sendBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
  },
  studentMoves: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 14px",
    backgroundColor: "#0f0f0f",
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
  emptyText: {
    fontSize: "14px",
    color: "#555",
    margin: 0,
    lineHeight: "1.6",
  },
  broadcastDesc: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
    lineHeight: "1.6",
  },
  successBox: {
    backgroundColor: "#0d2818",
    border: "1px solid #27ae60",
    borderRadius: "8px",
    padding: "14px 20px",
  },
  successText: {
    fontSize: "14px",
    color: "#27ae60",
    margin: 0,
    fontWeight: "600",
  },
};

export default Dashboard;