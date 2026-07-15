import { useState, useEffect } from "react";

function Dashboard({ onBack, api }) {
  const [activeTab, setActiveTab] = useState("prisoners_dilemma");
  const [profSessions, setProfSessions] = useState([]);
  const [profStats, setProfStats] = useState(null);
  const [hintText, setHintText] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profMessage, setProfMessage] = useState("");
  const [sessionCode, setSessionCode] = useState({ prisoners_dilemma: null, centipede: null });

  // PD settings
  const [pdRounds, setPdRounds] = useState(5);
  const [pdAgent, setPdAgent] = useState("rational");
  const [pdPayoff, setPdPayoff] = useState({
    both_silence_student: 3, both_silence_ai: 3,
    student_testify_ai_silence_student: 4, student_testify_ai_silence_ai: 1,
    student_silence_ai_testify_student: 1, student_silence_ai_testify_ai: 4,
    both_testify_student: 2, both_testify_ai: 2,
  });

  // Centipede settings
  const [centStages, setCentStages] = useState(4);
  const [centAgent, setCentAgent] = useState("rational");

  // Track if professor is editing settings
  const [pdAgentEditing, setPdAgentEditing] = useState(false);
  const [centAgentEditing, setCentAgentEditing] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`${api}/professor/stats`);
      const data = await res.json();
      setProfStats(data);
      setProfSessions([
        ...(data.prisoners_dilemma?.sessions || []),
        ...(data.centipede?.sessions || []),
      ]);

      // Only update session code from polling
      // Never overwrite agent or round settings while professor is editing
      if (data.game_settings) {
        setSessionCode({
          prisoners_dilemma: data.game_settings.prisoners_dilemma.session_code,
          centipede: data.game_settings.centipede.session_code,
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [api]);

  const showMsg = (msg) => {
    setProfMessage(msg);
    setTimeout(() => setProfMessage(""), 3000);
  };

  const sendHint = async (sessionId) => {
    if (!hintText.trim()) return;
    await fetch(`${api}/professor/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, professor_message: hintText }),
    });
    setHintText("");
    setSelectedStudent(null);
    showMsg("Hint sent successfully.");
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    await fetch(`${api}/professor/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: "all", professor_message: broadcastText }),
    });
    setBroadcastText("");
    showMsg("Broadcast sent to all students.");
  };

  const updatePDSettings = async () => {
    await fetch(`${api}/professor/settings/pd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_rounds: pdRounds, agent_type: pdAgent }),
    });
    setPdAgentEditing(false);
    showMsg("Prisoner's Dilemma settings updated.");
  };

  const updateCentSettings = async () => {
    await fetch(`${api}/professor/settings/centipede`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_stages: centStages, agent_type: centAgent }),
    });
    setCentAgentEditing(false);
    showMsg("Centipede Game settings updated.");
  };

  const updatePDPayoff = async () => {
    await fetch(`${api}/professor/payoff/pd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pdPayoff),
    });
    showMsg("Payoff matrix updated.");
  };

  const generateCode = async (gameType) => {
    const res = await fetch(`${api}/professor/session-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_type: gameType }),
    });
    const data = await res.json();
    setSessionCode((prev) => ({ ...prev, [gameType]: data.session_code }));
    showMsg(`Session code generated: ${data.session_code}`);
  };

  const clearCode = async (gameType) => {
    await fetch(`${api}/professor/clear-session-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_type: gameType }),
    });
    setSessionCode((prev) => ({ ...prev, [gameType]: null }));
    showMsg("Session code cleared.");
  };

  const pdSessions = profStats?.prisoners_dilemma?.sessions || [];
  const centSessions = profStats?.centipede?.sessions || [];
  const pdCooperate = profStats?.prisoners_dilemma?.total_cooperate || 0;
  const pdDefect = profStats?.prisoners_dilemma?.total_defect || 0;
  const pdTotal = pdCooperate + pdDefect;
  const centStop = profStats?.centipede?.total_stop || 0;
  const centContinue = profStats?.centipede?.total_continue || 0;
  const centTotal = centStop + centContinue;

  const currentSessions = activeTab === "prisoners_dilemma" ? pdSessions : centSessions;

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
          <button style={s.exitBtn} onClick={onBack}>Exit</button>
        </div>
      </div>

      {/* Game tabs */}
      <div style={s.tabBar}>
        <button
          style={{ ...s.tab, ...(activeTab === "prisoners_dilemma" ? s.tabActive : {}) }}
          onClick={() => { setActiveTab("prisoners_dilemma"); setSelectedStudent(null); }}
        >
          Prisoner's Dilemma
          <span style={s.tabCount}>{pdSessions.length}</span>
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === "centipede" ? s.tabActive : {}) }}
          onClick={() => { setActiveTab("centipede"); setSelectedStudent(null); }}
        >
          Centipede Game
          <span style={s.tabCount}>{centSessions.length}</span>
        </button>
      </div>

      <div style={s.inner}>
        {/* LEFT */}
        <div style={s.left}>
          {/* Stats */}
          <div style={s.statsRow}>
            {activeTab === "prisoners_dilemma" ? (
              <>
                <div style={s.statBox}>
                  <p style={s.statNum}>{pdSessions.length}</p>
                  <p style={s.statLabel}>Students</p>
                </div>
                <div style={s.statBox}>
                  <p style={s.statNum}>{pdTotal > 0 ? Math.round((pdCooperate / pdTotal) * 100) : 0}%</p>
                  <p style={s.statLabel}>Cooperating</p>
                </div>
                <div style={s.statBox}>
                  <p style={s.statNum}>{pdTotal > 0 ? Math.round((pdDefect / pdTotal) * 100) : 0}%</p>
                  <p style={s.statLabel}>Defecting</p>
                </div>
                <div style={s.statBox}>
                  <p style={s.statNum}>{pdTotal}</p>
                  <p style={s.statLabel}>Total Moves</p>
                </div>
              </>
            ) : (
              <>
                <div style={s.statBox}>
                  <p style={s.statNum}>{centSessions.length}</p>
                  <p style={s.statLabel}>Students</p>
                </div>
                <div style={s.statBox}>
                  <p style={s.statNum}>{centTotal > 0 ? Math.round((centStop / centTotal) * 100) : 0}%</p>
                  <p style={s.statLabel}>Stopping</p>
                </div>
                <div style={s.statBox}>
                  <p style={s.statNum}>{centTotal > 0 ? Math.round((centContinue / centTotal) * 100) : 0}%</p>
                  <p style={s.statLabel}>Continuing</p>
                </div>
                <div style={s.statBox}>
                  <p style={s.statNum}>{centTotal}</p>
                  <p style={s.statLabel}>Total Moves</p>
                </div>
              </>
            )}
          </div>

          {/* Chart */}
          <div style={s.chartBox}>
            <p style={s.sectionLabel}>
              {activeTab === "prisoners_dilemma"
                ? "Class Wide — Cooperation vs Defection"
                : "Class Wide — Stop vs Continue"}
            </p>
            <div style={s.barWrap}>
              {activeTab === "prisoners_dilemma" ? (
                <>
                  <div style={s.barRow}>
                    <span style={s.barLabel}>Silence</span>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${pdTotal > 0 ? Math.round((pdCooperate / pdTotal) * 100) : 0}%`, backgroundColor: "#27ae60" }}></div>
                    </div>
                    <span style={s.barPct}>{pdTotal > 0 ? Math.round((pdCooperate / pdTotal) * 100) : 0}%</span>
                  </div>
                  <div style={s.barRow}>
                    <span style={s.barLabel}>Testify</span>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${pdTotal > 0 ? Math.round((pdDefect / pdTotal) * 100) : 0}%`, backgroundColor: "#c0392b" }}></div>
                    </div>
                    <span style={s.barPct}>{pdTotal > 0 ? Math.round((pdDefect / pdTotal) * 100) : 0}%</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={s.barRow}>
                    <span style={s.barLabel}>Stop</span>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${centTotal > 0 ? Math.round((centStop / centTotal) * 100) : 0}%`, backgroundColor: "#c0392b" }}></div>
                    </div>
                    <span style={s.barPct}>{centTotal > 0 ? Math.round((centStop / centTotal) * 100) : 0}%</span>
                  </div>
                  <div style={s.barRow}>
                    <span style={s.barLabel}>Continue</span>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${centTotal > 0 ? Math.round((centContinue / centTotal) * 100) : 0}%`, backgroundColor: "#27ae60" }}></div>
                    </div>
                    <span style={s.barPct}>{centTotal > 0 ? Math.round((centContinue / centTotal) * 100) : 0}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Student list */}
          <div style={s.studentListBox}>
            <p style={s.sectionLabel}>Active Students</p>
            {currentSessions.length === 0 && (
              <p style={s.emptyText}>No students in this game yet.</p>
            )}
            {currentSessions.map((session) => {
              const lastMove = session.moves?.[session.moves.length - 1];
              return (
                <div key={session.session_id} style={s.studentRow}>
                  <div style={s.studentInfo}>
                    <p style={s.studentName}>{session.student_name}</p>
                    <p style={s.studentMeta}>
                      {activeTab === "prisoners_dilemma"
                        ? `Round ${Math.max((session.current_round || 1) - 1, 0)} of ${session.total_rounds}`
                        : `Stage ${session.current_stage || 1} of ${session.total_stages}`
                      } — Status: {session.game_status}
                    </p>
                    {lastMove && (
                      <p style={s.studentLastMove}>
                        Last: <strong>{lastMove.student_move || lastMove.move}</strong>
                      </p>
                    )}
                  </div>
                  <button style={s.hintBtn} onClick={() => setSelectedStudent(session)}>
                    Hint
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={s.right}>
          {profMessage && (
            <div style={s.successBox}>
              <p style={s.successText}>{profMessage}</p>
            </div>
          )}

          {/* Session code */}
          <div style={s.dashCard}>
            <p style={s.sectionLabel}>Session Code</p>
            <p style={s.broadcastDesc}>
              Generate a code so only students with the code can join this game.
            </p>
            {sessionCode[activeTab] ? (
              <div style={s.codeDisplay}>
                <span style={s.codeText}>{sessionCode[activeTab]}</span>
                <button style={s.clearCodeBtn} onClick={() => clearCode(activeTab)}>
                  Clear
                </button>
              </div>
            ) : (
              <button style={s.sendBtn} onClick={() => generateCode(activeTab)}>
                Generate Session Code
              </button>
            )}
          </div>

          {/* Game settings */}
          <div style={s.dashCard}>
            <p style={s.sectionLabel}>
              {activeTab === "prisoners_dilemma" ? "Prisoner's Dilemma Settings" : "Centipede Game Settings"}
            </p>

            {activeTab === "prisoners_dilemma" ? (
              <>
                <div style={s.settingRow}>
                  <p style={s.settingLabel}>Number of Rounds</p>
                  <div style={s.roundInputWrap}>
                    <input
                      style={s.roundInput}
                      type="number"
                      min="1"
                      max="50"
                      value={pdRounds}
                      onChange={(e) => setPdRounds(parseInt(e.target.value) || 1)}
                    />
                    <span style={s.roundInputLabel}>rounds</span>
                  </div>
                </div>
                <div style={s.settingRow}>
                  <p style={s.settingLabel}>AI Agent Type</p>
                  <div style={s.agentBtns}>
                    {[
                      { id: "rational", label: "Rational", desc: "Plays optimal game theory strategy" },
                      { id: "adaptive", label: "Adaptive", desc: "Reads and responds to student patterns" },
                      { id: "uninstructed", label: "Uninstructed", desc: "No guidance — pure AI reasoning" },
                    ].map((agent) => (
                      <button
                        key={agent.id}
                        style={{
                          ...s.agentBtn,
                          ...(pdAgent === agent.id ? s.agentBtnActive : {}),
                        }}
                        onClick={() => {
                          setPdAgent(agent.id);
                          setPdAgentEditing(true);
                        }}
                      >
                        <span style={s.agentBtnTitle}>{agent.label}</span>
                        <span style={s.agentBtnDesc}>{agent.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button style={s.sendBtn} onClick={updatePDSettings}>
                  Apply Settings
                </button>
              </>
            ) : (
              <>
                <div style={s.settingRow}>
                  <p style={s.settingLabel}>Number of Stages</p>
                  <div style={s.roundInputWrap}>
                    <input
                      style={s.roundInput}
                      type="number"
                      min="2"
                      max="20"
                      value={centStages}
                      onChange={(e) => setCentStages(parseInt(e.target.value) || 2)}
                    />
                    <span style={s.roundInputLabel}>stages</span>
                  </div>
                </div>
                <div style={s.settingRow}>
                  <p style={s.settingLabel}>AI Agent Type</p>
                  <div style={s.agentBtns}>
                    {[
                      { id: "rational", label: "Rational", desc: "Uses backward induction" },
                      { id: "adaptive", label: "Adaptive", desc: "Reads student patterns" },
                      { id: "uninstructed", label: "Uninstructed", desc: "No guidance — pure AI reasoning" },
                    ].map((agent) => (
                      <button
                        key={agent.id}
                        style={{
                          ...s.agentBtn,
                          ...(centAgent === agent.id ? s.agentBtnActive : {}),
                        }}
                        onClick={() => {
                          setCentAgent(agent.id);
                          setCentAgentEditing(true);
                        }}
                      >
                        <span style={s.agentBtnTitle}>{agent.label}</span>
                        <span style={s.agentBtnDesc}>{agent.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button style={s.sendBtn} onClick={updateCentSettings}>
                  Apply Settings
                </button>
              </>
            )}
          </div>

          {/* PD Payoff control */}
          {activeTab === "prisoners_dilemma" && (
            <div style={s.dashCard}>
              <p style={s.sectionLabel}>Payoff Matrix Control</p>
              <p style={s.broadcastDesc}>
                Changes apply from the next round in active games.
              </p>
              <div style={s.payoffGrid}>
                {[
                  { label: "Both Silent", sk: "both_silence_student", ak: "both_silence_ai" },
                  { label: "Student Testifies, AI Silent", sk: "student_testify_ai_silence_student", ak: "student_testify_ai_silence_ai" },
                  { label: "Student Silent, AI Testifies", sk: "student_silence_ai_testify_student", ak: "student_silence_ai_testify_ai" },
                  { label: "Both Testify", sk: "both_testify_student", ak: "both_testify_ai" },
                ].map((row) => (
                  <div key={row.label} style={s.payoffRow}>
                    <span style={s.payoffScenario}>{row.label}</span>
                    <div style={s.payoffInputs}>
                      <div style={s.payoffInputWrap}>
                        <label style={s.payoffInputLabel}>Student</label>
                        <input
                          style={s.payoffInput}
                          type="number"
                          value={pdPayoff[row.sk]}
                          onChange={(e) => setPdPayoff({ ...pdPayoff, [row.sk]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div style={s.payoffInputWrap}>
                        <label style={s.payoffInputLabel}>AI</label>
                        <input
                          style={s.payoffInput}
                          type="number"
                          value={pdPayoff[row.ak]}
                          onChange={(e) => setPdPayoff({ ...pdPayoff, [row.ak]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button style={s.sendBtn} onClick={updatePDPayoff}>
                Update Payoff Matrix
              </button>
            </div>
          )}

          {/* Send hint */}
          <div style={s.dashCard}>
            <p style={s.sectionLabel}>Send Hint to Student</p>
            {selectedStudent ? (
              <>
                <p style={s.selectedName}>
                  Sending to: <strong>{selectedStudent.student_name}</strong>
                </p>
                <textarea
                  style={s.textarea}
                  placeholder="Type your hint here..."
                  value={hintText}
                  onChange={(e) => setHintText(e.target.value)}
                  rows={3}
                />
                <div style={s.btnRow}>
                  <button style={s.sendBtn} onClick={() => sendHint(selectedStudent.session_id)}>
                    Send Hint
                  </button>
                  <button style={s.cancelBtn} onClick={() => setSelectedStudent(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p style={s.emptyText}>
                Click "Hint" next to a student on the left to send a private message.
              </p>
            )}
          </div>

          {/* Broadcast */}
          <div style={s.dashCard}>
            <p style={s.sectionLabel}>Broadcast to All Students</p>
            <p style={s.broadcastDesc}>
              Appears on every active student's screen immediately.
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
  topSep: { color: "#333", fontSize: "12px" },
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
  tabBar: {
    display: "flex",
    borderBottom: "1px solid #1f1f1f",
    backgroundColor: "#0a0a0a",
    padding: "0 40px",
  },
  tab: {
    padding: "14px 24px",
    border: "none",
    backgroundColor: "transparent",
    color: "#555",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "2px solid transparent",
    marginBottom: "-1px",
  },
  tabActive: {
    color: "#ffffff",
    borderBottom: "2px solid #c0392b",
  },
  tabCount: {
    fontSize: "11px",
    backgroundColor: "#1f1f1f",
    color: "#888",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "700",
  },
  inner: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
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
    fontSize: "28px",
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
    width: "64px",
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
    padding: "14px 18px",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
    gap: "12px",
  },
  studentInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  studentName: {
    fontSize: "15px",
    color: "#ffffff",
    fontWeight: "700",
    margin: 0,
  },
  studentMeta: {
    fontSize: "11px",
    color: "#555",
    margin: 0,
  },
  studentLastMove: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
  },
  hintBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #c0392b",
    backgroundColor: "transparent",
    color: "#c0392b",
    fontSize: "12px",
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
  codeDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#0f0f0f",
    borderRadius: "8px",
    border: "1px solid #333",
  },
  codeText: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#f0b429",
    letterSpacing: "4px",
    flex: 1,
    textAlign: "center",
  },
  clearCodeBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
  },
  settingRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  settingLabel: {
    fontSize: "13px",
    color: "#aaaaaa",
    margin: 0,
    fontWeight: "600",
  },
  roundInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  roundInput: {
    width: "80px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    textAlign: "center",
    outline: "none",
  },
  roundInputLabel: {
    fontSize: "14px",
    color: "#555",
  },
  agentBtns: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  agentBtn: {
    padding: "12px 16px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  agentBtnActive: {
    backgroundColor: "#1a0808",
    border: "1px solid #c0392b",
    color: "#ffffff",
  },
  agentBtnTitle: {
    fontSize: "14px",
    fontWeight: "700",
  },
  agentBtnDesc: {
    fontSize: "11px",
    opacity: 0.7,
  },
  payoffGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  payoffRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "10px 0",
    borderBottom: "1px solid #2a2a2a",
  },
  payoffScenario: {
    fontSize: "12px",
    color: "#aaaaaa",
    flex: 1,
  },
  payoffInputs: {
    display: "flex",
    gap: "12px",
  },
  payoffInputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
  },
  payoffInputLabel: {
    fontSize: "10px",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  payoffInput: {
    width: "52px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    textAlign: "center",
    outline: "none",
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
    width: "100%",
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
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
  },
  emptyText: {
    fontSize: "14px",
    color: "#444",
    margin: 0,
    lineHeight: "1.6",
  },
  broadcastDesc: {
    fontSize: "14px",
    color: "#555",
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