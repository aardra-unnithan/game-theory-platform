import { useState, useEffect } from "react";

const GAMES = [
  {
    id: "prisoners-dilemma",
    title: "Prisoner's Dilemma",
    active: true,
    gameType: "prisoners_dilemma",
    tagline: "Two rational minds. One impossible choice.",
    story: `It is 1950. You and your accomplice have been arrested and placed in separate rooms. You cannot communicate. The detective offers you both the same deal — betray your partner or stay silent. What do you do?`,
    quote: `During the time of Stalin, an orchestra conductor was arrested by the KGB for reading a musical score on a train. The next day, the interrogator walks in and says: You might as well confess — we've caught your accomplice Tchaikovsky, and he's already talking.`,
    quoteSource: "Harrington, Games, Strategies, and Decision Making",
    concept: "Dominant Strategy — Nash Equilibrium",
  },
  {
    id: "centipede",
    title: "Centipede Game",
    active: true,
    gameType: "centipede",
    tagline: "The longer you wait, the more there is to gain — or lose.",
    story: `It is 1850s Istanbul. You are a merchant who has been approached by a trader from the East with a remarkable proposal. At any moment you can take your share of the deal and walk away. But if you both agree to continue negotiating, the deal grows more valuable. The catch — at every stage, the other merchant decides next. Do you trust them to keep negotiating? Or do you take your share now before they walk away with the bigger cut?`,
    quote: `In laboratory experiments, subjects almost never stop immediately — even though rational game theory predicts they should. Trust, optimism, and social instinct override cold calculation.`,
    quoteSource: "McKelvey and Palfrey, Econometrica, 1992",
    concept: "Backward Induction — Subgame Perfect Nash Equilibrium",
  },
];

function useTypewriter(text, speed = 60, start = false) {
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
  const [selectedGame, setSelectedGame] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [lampAngle, setLampAngle] = useState(0);

  const typedTitle = useTypewriter(
    selectedGame?.title || "",
    60,
    animating
  );

  useEffect(() => {
    if (!selectedGame) return;
    setAnimating(false);
    setShowStory(false);
    setShowMatrix(false);
    setShowButton(false);

    setTimeout(() => setAnimating(true), 300);
    setTimeout(() => setShowStory(true), 1800);
    setTimeout(() => setShowMatrix(true), 2600);
    setTimeout(() => setShowButton(true), 3200);
  }, [selectedGame]);

  useEffect(() => {
    if (!animating || selectedGame?.gameType !== "prisoners_dilemma") return;
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
  }, [animating, selectedGame]);

  const handleGameClick = (game) => {
    if (!game.active) return;
    setSelectedGame(game);
  };

  const coinCount = showButton ? 6 : showMatrix ? 4 : showStory ? 2 : 1;

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

        <div style={s.gameList}>
          <p style={s.listLabel}>Games</p>
          {GAMES.map((game) => (
            <button
              key={game.id}
              style={{
                ...s.gameBtn,
                ...(selectedGame?.id === game.id ? s.gameBtnActive : {}),
                ...(!game.active ? s.gameBtnLocked : {}),
              }}
              onClick={() => handleGameClick(game)}
              disabled={!game.active}
            >
              <div style={s.gameBtnLeft}>
                <span style={s.gameBtnTitle}>{game.title}</span>
                <span style={s.gameBtnConcept}>{game.concept}</span>
              </div>
              {selectedGame?.id === game.id && (
                <span style={s.activeDot}></span>
              )}
            </button>
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
          <div style={s.welcomeWrap}>
            <p style={s.welcomeTag}>Welcome to</p>
            <h2 style={s.welcomeTitle}>GameTheory Lab</h2>
            <p style={s.welcomeDesc}>
              An AI-powered platform for learning game theory through
              interactive play. Select a game from the sidebar to begin.
            </p>
            <div style={s.welcomeHint}>
              <span style={s.hintArrow}>←</span>
              <span style={s.hintText}>Select a game to explore</span>
            </div>
          </div>
        ) : (
          <div style={s.gamePreview}>

            {/* Animation */}
            {selectedGame.gameType === "prisoners_dilemma" ? (
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
            ) : (
              <div style={s.coinWrap}>
                {[...Array(coinCount)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...s.coin,
                      bottom: `${i * 18}px`,
                      opacity: 1,
                    }}
                  >
                    <span style={s.coinSign}>$</span>
                  </div>
                ))}
                <div style={s.coinGlow}></div>
              </div>
            )}

            {/* Back button */}
            <button
              style={s.backBtn}
              onClick={() => {
                setSelectedGame(null);
                setAnimating(false);
              }}
            >
              ← Back
            </button>

            {/* Typewriter title */}
            <div style={s.titleWrap}>
              <h2 style={s.gameTitle}>
                {typedTitle}
                <span style={s.cursor}>|</span>
              </h2>
              <p style={s.gameTagline}>{selectedGame.tagline}</p>
            </div>

            {/* Story fades in */}
            <div style={{
              ...s.storyCard,
              opacity: showStory ? 1 : 0,
              transform: showStory ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s ease",
            }}>
              <p style={s.storyLabel}>The Scenario</p>
              <p style={s.storyText}>{selectedGame.story}</p>
            </div>

            {/* Quote slides up */}
            <div style={{
              ...s.quoteCard,
              opacity: showMatrix ? 1 : 0,
              transform: showMatrix ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s ease",
            }}>
              <p style={s.quoteLabel}>{selectedGame.quoteSource}</p>
              <p style={s.quoteText}>"{selectedGame.quote}"</p>
            </div>

            {/* Button pulses in */}
            <div style={{
              ...s.btnWrap,
              opacity: showButton ? 1 : 0,
              transform: showButton ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s ease",
            }}>
              <button
                style={s.startBtn}
                onClick={() => onStartGame(selectedGame)}
              >
                Enter as Student
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
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
  sidebar: {
    width: "280px",
    minWidth: "280px",
    backgroundColor: "#0a0a0a",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    padding: "32px 20px",
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
  gameList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  listLabel: {
    fontSize: "10px",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  gameBtn: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #1f1f1f",
    backgroundColor: "#141414",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  gameBtnActive: {
    backgroundColor: "#1a0808",
    border: "1px solid #c0392b",
  },
  gameBtnLocked: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
  gameBtnLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  gameBtnTitle: {
    fontSize: "14px",
    color: "#ffffff",
    fontWeight: "700",
  },
  gameBtnConcept: {
    fontSize: "11px",
    color: "#555",
  },
  activeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#c0392b",
    flexShrink: 0,
  },
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
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    overflowY: "auto",
  },
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
  },
  welcomeHint: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "8px",
  },
  hintArrow: {
    fontSize: "20px",
    color: "#c0392b",
  },
  hintText: {
    fontSize: "14px",
    color: "#333",
    fontStyle: "italic",
  },
  gamePreview: {
    maxWidth: "680px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  lampWrap: {
    display: "flex",
    justifyContent: "center",
    height: "100px",
    position: "relative",
    marginBottom: "-10px",
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
    height: "50px",
    backgroundColor: "#333",
  },
  lampShade: {
    width: "50px",
    height: "0",
    borderLeft: "25px solid transparent",
    borderRight: "25px solid transparent",
    borderTop: "32px solid #2a2a2a",
  },
  lampLight: {
    width: "70px",
    height: "35px",
    borderRadius: "0 0 35px 35px",
    background: "radial-gradient(ellipse at top, rgba(255,220,100,0.12) 0%, transparent 70%)",
    marginTop: "-4px",
  },
  coinWrap: {
    position: "relative",
    height: "140px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: "-10px",
  },
  coin: {
    position: "absolute",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, #f5d76e, #c9922a 60%, #8a5e0a)",
    border: "3px solid #f0c040",
    boxShadow: "0 4px 0px #7a4e0a, 0 6px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
    transition: "all 0.4s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  coinSign: {
    fontSize: "22px",
    fontWeight: "900",
    color: "rgba(255,255,255,0.55)",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
    userSelect: "none",
    lineHeight: "1",
  },
  coinGlow: {
    position: "absolute",
    bottom: "-8px",
    width: "90px",
    height: "16px",
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(240,192,64,0.25) 0%, transparent 70%)",
  },
  backBtn: {
    alignSelf: "flex-start",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1.5px solid #2a2a2a",
    backgroundColor: "transparent",
    color: "#666",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
  },
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  gameTitle: {
    fontSize: "52px",
    color: "#ffffff",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-1.5px",
    lineHeight: "1.1",
    minHeight: "65px",
  },
  gameTagline: {
    fontSize: "16px",
    color: "#555",
    margin: 0,
    fontStyle: "italic",
  },
  cursor: {
    animation: "blink 1s infinite",
    color: "#c0392b",
    fontWeight: "300",
  },
  storyCard: {
    backgroundColor: "#141414",
    border: "1px solid #1f1f1f",
    borderLeft: "4px solid #c0392b",
    padding: "24px 28px",
    borderRadius: "8px",
  },
  storyLabel: {
    fontSize: "10px",
    color: "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 12px 0",
    fontWeight: "700",
  },
  storyText: {
    fontSize: "15px",
    color: "#aaaaaa",
    lineHeight: "1.9",
    margin: 0,
  },
  quoteCard: {
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "20px 24px",
    borderRadius: "8px",
  },
  quoteLabel: {
    fontSize: "10px",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 10px 0",
    fontWeight: "700",
  },
  quoteText: {
    fontSize: "14px",
    color: "#555",
    fontStyle: "italic",
    lineHeight: "1.8",
    margin: 0,
  },
  btnWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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