import { useState, useEffect } from "react";

const TOPICS = [
  {
    id: "ch4",
    chapter: "Chapter 4",
    title: "Dominant Strategy & Nash Equilibrium",
    games: [
      {
        id: "prisoners-dilemma",
        title: "The Prisoner's Dilemma",
        active: true,
      },
    ],
  },
  {
    id: "ch9",
    chapter: "Chapter 9",
    title: "Sequential Games & Backward Induction",
    games: [
      {
        id: "british-intelligence",
        title: "British Intelligence Game",
        active: false,
      },
    ],
  },
  {
    id: "ch13",
    chapter: "Chapter 13",
    title: "Repeated Games",
    games: [
      {
        id: "trench-warfare",
        title: "Trench Warfare",
        active: false,
      },
    ],
  },
];

// Typewriter hook
function useTypewriter(text, speed = 50, start = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start) return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, start]);
  return displayed;
}

function Landing({ onStartGame, onProfessor }) {
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [lampAngle, setLampAngle] = useState(0);

  const typedTitle = useTypewriter(
    "The Prisoner's Dilemma",
    60,
    animating
  );

  // Trigger animations in sequence when game is selected
  useEffect(() => {
    if (!selectedGame) return;
    setAnimating(false);
    setShowQuote(false);
    setShowMatrix(false);
    setShowButton(false);

    setTimeout(() => setAnimating(true), 300);
    setTimeout(() => setShowQuote(true), 1800);
    setTimeout(() => setShowMatrix(true), 2600);
    setTimeout(() => setShowButton(true), 3200);
  }, [selectedGame]);

  // Lamp swing animation
  useEffect(() => {
    if (!animating) return;
    let angle = 0;
    let direction = 1;
    let speed = 0.8;
    const interval = setInterval(() => {
      angle += direction * speed;
      if (angle > 12 || angle < -12) {
        direction *= -1;
        speed *= 0.98;
      }
      setLampAngle(angle);
    }, 16);
    return () => clearInterval(interval);
  }, [animating]);

  const handleChapterClick = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    setSelectedGame(null);
    setAnimating(false);
  };

  const handleGameClick = (game) => {
    if (!game.active) return;
    setSelectedGame(game);
  };

  return (
    <div style={s.page}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <p style={s.appTag}>Game Theory</p>
          <h1 style={s.appName}>Lab</h1>
          <p style={s.appSub}>Interactive Learning Platform</p>
        </div>

        <div style={s.divider}></div>

        <div style={s.topicList}>
          {TOPICS.map((topic) => (
            <div key={topic.id}>
              {/* Chapter header — clickable accordion */}
              <button
                style={s.chapterBtn}
                onClick={() => handleChapterClick(topic.id)}
              >
                <div style={s.chapterBtnLeft}>
                  <p style={s.chapterLabel}>{topic.chapter}</p>
                  <p style={s.chapterTitle}>{topic.title}</p>
                </div>
                <span style={{
                  ...s.chapterArrow,
                  transform: expandedChapter === topic.id
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                }}>
                  ›
                </span>
              </button>

              {/* Games under this chapter */}
              {expandedChapter === topic.id && (
                <div style={s.gamesWrap}>
                  {topic.games.map((game) => (
                    <button
                      key={game.id}
                      style={{
                        ...s.gameBtn,
                        ...(game.active ? {} : s.gameBtnLocked),
                        ...(selectedGame?.id === game.id
                          ? s.gameBtnActive
                          : {}),
                      }}
                      onClick={() => handleGameClick(game)}
                      disabled={!game.active}
                    >
                      <span>{game.title}</span>
                      {!game.active && (
                        <span style={s.comingSoon}>Soon</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={s.divider}></div>

        <button style={s.profBtn} onClick={onProfessor}>
          Professor Access
        </button>
      </div>

      {/* MAIN AREA */}
      <div style={s.main}>
        {!selectedGame ? (
          // WELCOME STATE
          <div style={s.welcomeWrap}>
            <p style={s.welcomeTag}>Welcome to</p>
            <h2 style={s.welcomeTitle}>GameTheory Lab</h2>
            <p style={s.welcomeDesc}>
              An AI-powered platform for learning game theory through
              interactive play. Select a chapter from the sidebar to begin.
            </p>
            <div style={s.welcomeHint}>
              <span style={s.hintArrow}>←</span>
              <span style={s.hintText}>
                Select a chapter to explore games
              </span>
            </div>
          </div>
        ) : (
          // GAME PREVIEW WITH ANIMATIONS
          <div style={s.gamePreview}>

            {/* Interrogation lamp SVG animation */}
            <div style={s.lampWrap}>
              <div style={{
                ...s.lampPivot,
                transform: `rotate(${lampAngle}deg)`,
              }}>
                <div style={s.lampCord}></div>
                <div style={s.lampShade}></div>
                <div style={s.lampLight}></div>
              </div>
            </div>

            {/* Back button */}
            <button
              style={s.backBtn}
              onClick={() => {
                setSelectedGame(null);
                setAnimating(false);
              }}
            >
              ← Back to Home
            </button>

            {/* Typewriter title */}
            <div style={s.titleWrap}>
              <p style={s.eyebrow}>
                Chapter 4 — Dominant Strategy & Nash Equilibrium
              </p>
              <h2 style={s.gameTitle}>
                {typedTitle}
                <span style={s.cursor}>|</span>
              </h2>
            </div>

            {/* Quote fades in */}
            <div style={{
              ...s.quoteCard,
              opacity: showQuote ? 1 : 0,
              transform: showQuote ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s ease",
            }}>
              <p style={s.quoteLabel}>From Harrington, Chapter 4</p>
              <p style={s.quoteText}>
                "During the time of Stalin, an orchestra conductor was
                arrested by the KGB for reading a musical score on a train.
                The next day, the interrogator walks in and says: 'You might
                as well confess — we've caught your accomplice Tchaikovsky,
                and he's already talking.'"
              </p>
            </div>

            {/* Matrix slides up */}
            <div style={{
              ...s.matrixWrap,
              opacity: showMatrix ? 1 : 0,
              transform: showMatrix ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s ease",
            }}>
              <p style={s.quoteLabel}>
                The Payoff Matrix — Harrington Chapter 4
              </p>
              <table style={s.matrix}>
                <thead>
                  <tr>
                    <th style={s.mh}></th>
                    <th style={s.mh}>AI: Silence</th>
                    <th style={s.mh}>AI: Testify</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={s.mc}>You: Silence</td>
                    <td style={s.mcHL}>3, 3</td>
                    <td style={s.mc}>1, 4</td>
                  </tr>
                  <tr>
                    <td style={s.mc}>You: Testify</td>
                    <td style={s.mc}>4, 1</td>
                    <td style={s.mc}>2, 2</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Enter button pulses in */}
            <div style={{
              ...s.btnWrap,
              opacity: showButton ? 1 : 0,
              transform: showButton ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s ease",
            }}>
              <div style={s.gameInfoRow}>
                <div style={s.infoBox}>
                  <p style={s.infoNum}>5</p>
                  <p style={s.infoLabel}>Rounds</p>
                </div>
                <div style={s.infoBox}>
                  <p style={s.infoNum}>AI</p>
                  <p style={s.infoLabel}>Opponent</p>
                </div>
                <div style={s.infoBox}>
                  <p style={s.infoNum}>Ch.4</p>
                  <p style={s.infoLabel}>Harrington</p>
                </div>
              </div>
              <button
                style={{
                  ...s.startBtn,
                  animation: showButton
                    ? "pulse 2s infinite"
                    : "none",
                }}
                onClick={onStartGame}
              >
                Enter as Student
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.4); }
          70% { box-shadow: 0 0 0 12px rgba(192, 57, 43, 0); }
          100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    display: "flex",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  // SIDEBAR
  sidebar: {
    width: "300px",
    minWidth: "300px",
    backgroundColor: "#0a0a0a",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    padding: "36px 24px",
  },
  sidebarTop: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "24px",
  },
  appTag: {
    fontSize: "11px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "3px",
    margin: 0,
    fontWeight: "700",
  },
  appName: {
    fontSize: "48px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-2px",
    lineHeight: "1",
  },
  appSub: {
    fontSize: "11px",
    color: "#444",
    margin: 0,
    marginTop: "6px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#1f1f1f",
    margin: "20px 0",
  },
  topicList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },

  // CHAPTER ACCORDION BUTTON
  chapterBtn: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    textAlign: "left",
  },
  chapterBtnLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  chapterLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  chapterTitle: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
    lineHeight: "1.3",
  },
  chapterArrow: {
    fontSize: "20px",
    color: "#444",
    transition: "transform 0.2s ease",
    lineHeight: "1",
  },

  // GAMES UNDER CHAPTER
  gamesWrap: {
    paddingLeft: "16px",
    paddingBottom: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  gameBtn: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "6px",
    border: "1px solid #2a2a2a",
    backgroundColor: "#141414",
    color: "#cccccc",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gameBtnLocked: {
    color: "#333",
    cursor: "not-allowed",
    backgroundColor: "#0d0d0d",
    border: "1px solid #1a1a1a",
  },
  gameBtnActive: {
    backgroundColor: "#1a0808",
    border: "1px solid #c0392b",
    color: "#ffffff",
  },
  comingSoon: {
    fontSize: "9px",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: "1px",
    backgroundColor: "#1a1a1a",
    padding: "2px 6px",
    borderRadius: "4px",
  },

  // PROFESSOR BUTTON
  profBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px",
  },

  // MAIN AREA
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    overflowY: "auto",
    position: "relative",
  },

  // WELCOME STATE
  welcomeWrap: {
    maxWidth: "600px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  welcomeTag: {
    fontSize: "12px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "3px",
    margin: 0,
    fontWeight: "700",
  },
  welcomeTitle: {
    fontSize: "80px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-3px",
    lineHeight: "1",
  },
  welcomeDesc: {
    fontSize: "18px",
    color: "#555",
    lineHeight: "1.8",
    margin: 0,
    maxWidth: "480px",
  },
  welcomeHint: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
  },
  hintArrow: {
    fontSize: "20px",
    color: "#c0392b",
    animation: "pulse 2s infinite",
  },
  hintText: {
    fontSize: "14px",
    color: "#444",
    fontStyle: "italic",
  },

  // GAME PREVIEW
  gamePreview: {
    maxWidth: "720px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    position: "relative",
  },

  // LAMP ANIMATION
  lampWrap: {
    display: "flex",
    justifyContent: "center",
    height: "120px",
    position: "relative",
    marginBottom: "-20px",
  },
  lampPivot: {
    transformOrigin: "top center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    top: 0,
  },
  lampCord: {
    width: "2px",
    height: "60px",
    backgroundColor: "#444",
  },
  lampShade: {
    width: "60px",
    height: "0",
    borderLeft: "30px solid transparent",
    borderRight: "30px solid transparent",
    borderTop: "40px solid #2a2a2a",
  },
  lampLight: {
    width: "80px",
    height: "40px",
    borderRadius: "0 0 40px 40px",
    background: "radial-gradient(ellipse at top, rgba(255,220,100,0.15) 0%, transparent 70%)",
    marginTop: "-4px",
  },

  // BACK BUTTON
  backBtn: {
    alignSelf: "flex-start",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1.5px solid #333",
    backgroundColor: "transparent",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
  },

  // ANIMATED CONTENT
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  eyebrow: {
    fontSize: "11px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: 0,
    fontWeight: "700",
  },
  gameTitle: {
    fontSize: "56px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-1.5px",
    lineHeight: "1.1",
    minHeight: "70px",
  },
  cursor: {
    animation: "blink 1s infinite",
    color: "#c0392b",
    fontWeight: "300",
  },
  quoteCard: {
    backgroundColor: "#141414",
    border: "1px solid #1f1f1f",
    borderLeft: "4px solid #c0392b",
    padding: "24px 28px",
    borderRadius: "8px",
  },
  quoteLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 12px 0",
    fontWeight: "700",
  },
  quoteText: {
    fontSize: "15px",
    color: "#aaaaaa",
    fontStyle: "italic",
    lineHeight: "1.9",
    margin: 0,
  },
  matrixWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  matrix: {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "14px",
  },
  mh: {
    border: "1px solid #2a2a2a",
    padding: "12px 16px",
    color: "#555",
    textAlign: "center",
    backgroundColor: "#111",
    fontWeight: "700",
  },
  mc: {
    border: "1px solid #2a2a2a",
    padding: "12px 16px",
    color: "#aaaaaa",
    textAlign: "center",
  },
  mcHL: {
    border: "2px solid #c0392b",
    padding: "12px 16px",
    color: "#c0392b",
    textAlign: "center",
    backgroundColor: "#1a0808",
    fontWeight: "900",
    fontSize: "17px",
  },
  btnWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  gameInfoRow: {
    display: "flex",
    gap: "12px",
  },
  infoBox: {
    backgroundColor: "#141414",
    border: "1px solid #1f1f1f",
    borderRadius: "8px",
    padding: "16px 24px",
    textAlign: "center",
  },
  infoNum: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#c0392b",
    margin: "0 0 4px 0",
  },
  infoLabel: {
    fontSize: "11px",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  startBtn: {
    padding: "18px 40px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "#ffffff",
    fontSize: "17px",
    cursor: "pointer",
    fontWeight: "800",
    alignSelf: "flex-start",
  },
};

export default Landing;