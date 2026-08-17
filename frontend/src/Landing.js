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
    story: `It is 1850s Istanbul. You are a merchant who has been approached by a trader from the East with a remarkable proposal. At any moment you can take your share of the deal and walk away. But if you both agree to continue negotiating, the deal grows more valuable. The catch — at every stage, the other merchant decides next. Do you trust them to keep negotiating?`,
    quote: `In laboratory experiments, subjects almost never stop immediately — even though rational game theory predicts they should. Trust, optimism, and social instinct override cold calculation.`,
    quoteSource: "McKelvey and Palfrey, Econometrica, 1992",
    concept: "Backward Induction — Subgame Perfect Nash Equilibrium",
  },
  {
    id: "travelers-dilemma",
    title: "Traveler's Dilemma",
    active: true,
    gameType: "travelers_dilemma",
    tagline: "The honest claim is never the smart claim.",
    story: `Two travelers return from the same trip and discover their identical antique vases were both damaged by the airline. The airline asks each traveler separately to write down the value — anywhere from $4 to $8. The airline pays the lower amount to both. The traveler who wrote less gets a $1 bonus. The traveler who wrote more gets a $1 penalty. What do you claim?`,
    quote: `The Traveler's Dilemma is striking because the logic that leads to the Nash equilibrium is sound, yet the prediction is wildly at odds with actual behavior in experiments.`,
    quoteSource: "Kaushik Basu, Scientific American, 2007",
    concept: "Iterated Dominance — Nash Equilibrium",
  },
  {
    id: "lemons",
    title: "Market for Lemons",
    active: true,
    gameType: "lemons",
    tagline: "When the seller knows everything and you know nothing.",
    story: `It is 1970. You are shopping for a used car in California. Some cars on the lot are peaches — reliable, worth every dollar. Others are lemons — money pits disguised as bargains. The seller knows exactly which is which. You cannot tell the difference. All you have is the price and whatever the salesman decides to tell you.`,
    quote: `The presence of people who wish to make high-quality trades is offset by the trades of low-quality items. This means the average quality decreases and the average price decreases — a true market failure.`,
    quoteSource: "George Akerlof, The Market for Lemons, 1970",
    concept: "Information Asymmetry — Adverse Selection",
  },
  {
    id: "auction",
    title: "Vickrey Auction",
    active: true,
    gameType: "auction",
    tagline: "The only auction where honesty is the dominant strategy.",
    story: `It is Sotheby's Geneva, 2019. Rare vintage watches go under the hammer one by one. Your expert has examined each piece and given you a private valuation — what the watch is truly worth to your collection. The auction runs on a second price system. The highest bidder wins but pays only the second highest bid. The question is never what you can afford. The question is what you truly believe it is worth.`,
    quote: `The Vickrey auction has the remarkable property that truthful bidding is a dominant strategy — it is optimal regardless of what others bid. This makes it the gold standard of mechanism design.`,
    quoteSource: "William Vickrey, Journal of Finance, 1961",
    concept: "Dominant Strategy — Mechanism Design",
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
  const [ticketY, setTicketY] = useState(-80);
  const [ticketRotation, setTicketRotation] = useState(-20);
  const [carX, setCarX] = useState(200);
  
  const [hammerAngle, setHammerAngle] = useState(-45);
  const [paddleY, setPaddleY] = useState(100);

  const typedTitle = useTypewriter(selectedGame?.title || "", 60, animating);

  useEffect(() => {
    if (!selectedGame) return;
    setAnimating(false);
    setShowStory(false);
    setShowMatrix(false);
    setShowButton(false);
    setTicketY(-80);
    setTicketRotation(-20);
    setCarX(200);
    setWatchRotation(0);
    setHammerAngle(-45);
    setPaddleY(100);

    setTimeout(() => setAnimating(true), 300);
    setTimeout(() => setShowStory(true), 1800);
    setTimeout(() => setShowMatrix(true), 2600);
    setTimeout(() => setShowButton(true), 3200);
  }, [selectedGame]);

  // Lamp swing
  useEffect(() => {
    if (!animating || selectedGame?.gameType !== "prisoners_dilemma") return;
    let angle = 0;
    let direction = 1;
    let speed = 0.8;
    const interval = setInterval(() => {
      angle += direction * speed;
      if (angle > 12 || angle < -12) { direction *= -1; speed *= 0.98; }
      setLampAngle(angle);
    }, 16);
    return () => clearInterval(interval);
  }, [animating, selectedGame]);

  // Ticket fall
  useEffect(() => {
    if (!animating || selectedGame?.gameType !== "travelers_dilemma") return;
    let y = -80;
    let rotation = -20;
    let velocity = 0;
    const interval = setInterval(() => {
      velocity += 1.2;
      y += velocity;
      rotation *= 0.92;
      if (y >= 10) {
        y = 10;
        velocity = -velocity * 0.25;
        if (Math.abs(velocity) < 0.8) clearInterval(interval);
      }
      setTicketY(y);
      setTicketRotation(rotation);
    }, 16);
    return () => clearInterval(interval);
  }, [animating, selectedGame]);

  // Car drive in
  useEffect(() => {
    if (!animating || selectedGame?.gameType !== "lemons") return;
    let x = 200;
    const interval = setInterval(() => {
      x -= 4;
      if (x <= 0) { x = 0; clearInterval(interval); }
      setCarX(x);
    }, 16);
    return () => clearInterval(interval);
  }, [animating, selectedGame]);

  // Watch rotation + hammer fall + paddle rise
  useEffect(() => {
    if (!animating || selectedGame?.gameType !== "auction") return;

    // Smooth watch rotation
    const watchInterval = setInterval(() => {
      setWatchRotation(prev => (prev + 0.5) % 360);
    }, 16);

    // Hammer fall animation
    let hammerAngle = -45;
    const hammerInterval = setInterval(() => {
      hammerAngle += 3;
      if (hammerAngle >= 20) {
        hammerAngle = 20;
        clearInterval(hammerInterval);
        // Bounce back
        setTimeout(() => setHammerAngle(-20), 300);
        setTimeout(() => setHammerAngle(10), 600);
        setTimeout(() => setHammerAngle(-10), 900);
        setTimeout(() => setHammerAngle(0), 1200);
      }
      setHammerAngle(hammerAngle);
    }, 16);

    // Paddle rise
    let py = 100;
    const paddleInterval = setInterval(() => {
      py -= 3;
      if (py <= 0) { py = 0; clearInterval(paddleInterval); }
      setPaddleY(py);
    }, 16);

    return () => {
      clearInterval(watchInterval);
      clearInterval(hammerInterval);
      clearInterval(paddleInterval);
    };
  }, [animating, selectedGame]);

  const coinCount = showButton ? 6 : showMatrix ? 4 : showStory ? 2 : 1;

  return (
    <div style={s.page}>
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
              onClick={() => game.active && setSelectedGame(game)}
              disabled={!game.active}
            >
              <div style={s.gameBtnLeft}>
                <span style={s.gameBtnTitle}>{game.title}</span>
                <span style={s.gameBtnConcept}>{game.concept}</span>
              </div>
              {selectedGame?.id === game.id && <span style={s.activeDot}></span>}
            </button>
          ))}
        </div>
        <div style={s.divider}></div>
        <button style={s.profBtn} onClick={onProfessor}>Professor Access</button>
      </div>

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

            {/* LAMP — Prisoner's Dilemma */}
            {selectedGame.gameType === "prisoners_dilemma" && (
              <div style={s.lampWrap}>
                <div style={{ ...s.lampPivot, transform: `rotate(${lampAngle}deg)` }}>
                  <div style={s.lampCord}></div>
                  <div style={s.lampShade}></div>
                  <div style={s.lampLight}></div>
                </div>
              </div>
            )}

            {/* COINS — Centipede */}
            {selectedGame.gameType === "centipede" && (
              <div style={s.coinWrap}>
                {[...Array(coinCount)].map((_, i) => (
                  <div key={i} style={{ ...s.coin, bottom: `${i * 18}px` }}>
                    <span style={s.coinSign}>$</span>
                  </div>
                ))}
                <div style={s.coinGlow}></div>
              </div>
            )}

            {/* TICKET — Traveler's Dilemma */}
            {selectedGame.gameType === "travelers_dilemma" && (
              <div style={s.ticketWrap}>
                <div style={{ ...s.ticket, transform: `translateY(${ticketY}px) rotate(${ticketRotation}deg)` }}>
                  <div style={s.ticketHeader}>
                    <span style={s.ticketAirline}>✈ AMERICAN AIRLINES</span>
                    <span style={s.ticketNum}>FL-1850</span>
                  </div>
                  <div style={s.ticketDash}></div>
                  <div style={s.ticketBody}>
                    <div style={s.ticketField}>
                      <span style={s.ticketFieldLabel}>CLAIM VALUE</span>
                      <span style={s.ticketFieldValue}>$4.00 — $8.00</span>
                    </div>
                    <div style={s.ticketField}>
                      <span style={s.ticketFieldLabel}>REWARD / PENALTY</span>
                      <span style={s.ticketFieldValue}>± $1.00</span>
                    </div>
                  </div>
                  <div style={s.ticketDash}></div>
                  <div style={s.ticketFooter}>
                    <span style={s.ticketFooterText}>SUBMIT YOUR CLAIM BELOW</span>
                  </div>
                </div>
              </div>
            )}

            {/* CAR — Market for Lemons */}
            {selectedGame.gameType === "lemons" && (
              <div style={s.carAnimWrap}>
                <div style={{ ...s.carAnim, transform: `translateX(${carX}px)` }}>
                  <svg width="220" height="90" viewBox="0 0 220 90">
                    <rect x="10" y="40" width="200" height="38" rx="8" fill="#1a1a1a" />
                    <path d="M 40 40 Q 52 14 82 10 L 148 10 Q 172 10 178 40 Z" fill="#111" />
                    <path d="M 54 37 Q 62 18 82 16 L 120 16 Q 132 16 135 37 Z" fill="#1e3a5f" opacity="0.8" />
                    <path d="M 138 37 Q 142 18 152 16 L 170 16 Q 176 18 177 37 Z" fill="#1e3a5f" opacity="0.8" />
                    <circle cx="50" cy="78" r="16" fill="#111" /><circle cx="50" cy="78" r="9" fill="#333" /><circle cx="50" cy="78" r="4" fill="#555" />
                    <circle cx="168" cy="78" r="16" fill="#111" /><circle cx="168" cy="78" r="9" fill="#333" /><circle cx="168" cy="78" r="4" fill="#555" />
                    <ellipse cx="204" cy="53" rx="8" ry="6" fill="#f0b429" opacity="0.8" />
                    <ellipse cx="16" cy="53" rx="6" ry="5" fill="#c0392b" opacity="0.7" />
                  </svg>
                </div>
                <div style={s.carLabel}><span style={s.carLabelText}>?</span></div>
              </div>
            )}

            {/* AUCTION — Watch + Hammer + Paddle */}
            {selectedGame.gameType === "auction" && (
              <div style={s.auctionAnimWrap}>
                {/* Hammer */}
                <div style={s.auctionHammerWrap}>
                  <div style={{
                    ...s.auctionHammer,
                    transform: `rotate(${hammerAngle}deg)`,
                    transition: "transform 0.1s ease",
                  }}>
                    <div style={s.auctionHammerHandle}></div>
                    <div style={s.auctionHammerHead}></div>
                  </div>
                  <div style={s.auctionBlock}></div>
                </div>

                {/* Watch */}
                <div style={s.auctionWatchWrap}>
                  <svg width="100" height="120" viewBox="0 0 100 120">
                    <rect x="37" y="0" width="26" height="20" rx="3" fill="#1a1a1a" />
                    <rect x="41" y="4" width="18" height="12" rx="2" fill="#111" />
                    <circle cx="50" cy="60" r="38" fill="#1a1a1a" />
                    <circle cx="50" cy="60" r="35" fill="#0a0a0a" />
                    <circle cx="50" cy="60" r="30" fill="#0f0f1a" />
                    {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
                      const angle = (i * 30 - 90) * Math.PI / 180;
                      const x1 = 50 + 24 * Math.cos(angle);
                      const y1 = 60 + 24 * Math.sin(angle);
                      const x2 = 50 + 28 * Math.cos(angle);
                      const y2 = 60 + 28 * Math.sin(angle);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0b429" strokeWidth={i % 3 === 0 ? "2" : "1"} />;
                    })}
                    <line x1="50" y1="60" x2="50" y2="42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <line x1="50" y1="60" x2="64" y2="52" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="50" y1="60" x2="42" y2="74" stroke="#c0392b" strokeWidth="1" strokeLinecap="round" />
                    <circle cx="50" cy="60" r="2.5" fill="#f0b429" />
                    <rect x="85" y="57" width="6" height="5" rx="1.5" fill="#333" />
                    <rect x="37" y="96" width="26" height="20" rx="3" fill="#1a1a1a" />
                  </svg>
                  <p style={s.auctionWatchLabel}>Sotheby's Geneva</p>
                </div>

                {/* Paddle */}
                <div style={{
                  ...s.auctionPaddleWrap,
                  transform: `translateY(${paddleY}px)`,
                  transition: "transform 0.05s linear",
                }}>
                  <svg width="44" height="90" viewBox="0 0 44 90">
                    <ellipse cx="22" cy="22" rx="20" ry="20" fill="#f0b429" />
                    <text x="22" y="28" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0f0f0f">1</text>
                    <rect x="19" y="40" width="6" height="50" rx="3" fill="#8b6914" />
                  </svg>
                </div>
              </div>
            )}

            {/* Back button */}
            <button style={s.backBtn} onClick={() => { setSelectedGame(null); setAnimating(false); }}>
              ← Back
            </button>

            {/* Title */}
            <div style={s.titleWrap}>
              <h2 style={s.gameTitle}>{typedTitle}<span style={s.cursor}>|</span></h2>
              <p style={s.gameTagline}>{selectedGame.tagline}</p>
            </div>

            {/* Story */}
            <div style={{ ...s.storyCard, opacity: showStory ? 1 : 0, transform: showStory ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
              <p style={s.storyLabel}>The Scenario</p>
              <p style={s.storyText}>{selectedGame.story}</p>
            </div>

            {/* Quote */}
            <div style={{ ...s.quoteCard, opacity: showMatrix ? 1 : 0, transform: showMatrix ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
              <p style={s.quoteLabel}>{selectedGame.quoteSource}</p>
              <p style={s.quoteText}>"{selectedGame.quote}"</p>
            </div>

            {/* Button */}
            <div style={{ ...s.btnWrap, opacity: showButton ? 1 : 0, transform: showButton ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
              <button style={s.startBtn} onClick={() => onStartGame(selectedGame)}>
                Enter as Student
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#0f0f0f", display: "flex", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  sidebar: { width: "290px", minWidth: "290px", backgroundColor: "#0a0a0a", borderRight: "1px solid #1f1f1f", display: "flex", flexDirection: "column", padding: "32px 20px" },
  sidebarTop: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "24px" },
  appTag: { fontSize: "12px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "3px", margin: 0, fontWeight: "700" },
  appName: { fontSize: "52px", color: "#ffffff", margin: 0, fontWeight: "900", letterSpacing: "-2px", lineHeight: "1" },
  appSub: { fontSize: "12px", color: "#555", margin: 0, marginTop: "6px" },
  divider: { height: "1px", backgroundColor: "#1f1f1f", margin: "20px 0" },
  gameList: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  listLabel: { fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 8px 0", fontWeight: "700" },
  gameBtn: { width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #1f1f1f", backgroundColor: "#141414", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" },
  gameBtnActive: { backgroundColor: "#1a0808", border: "1px solid #c0392b" },
  gameBtnLocked: { opacity: 0.3, cursor: "not-allowed" },
  gameBtnLeft: { display: "flex", flexDirection: "column", gap: "5px" },
  gameBtnTitle: { fontSize: "15px", color: "#ffffff", fontWeight: "700" },
  gameBtnConcept: { fontSize: "11px", color: "#555" },
  activeDot: { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#c0392b", flexShrink: 0 },
  profBtn: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#c0392b", color: "#ffffff", fontSize: "15px", cursor: "pointer", fontWeight: "700", marginTop: "8px" },
  main: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", overflowY: "auto" },
  welcomeWrap: { maxWidth: "620px", width: "100%", display: "flex", flexDirection: "column", gap: "28px" },
  welcomeTag: { fontSize: "13px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "3px", margin: 0, fontWeight: "700" },
  welcomeTitle: { fontSize: "84px", color: "#ffffff", margin: 0, fontWeight: "900", letterSpacing: "-3px", lineHeight: "1" },
  welcomeDesc: { fontSize: "19px", color: "#cccccc", lineHeight: "1.8", margin: 0 },
  welcomeHint: { display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" },
  hintArrow: { fontSize: "22px", color: "#c0392b" },
  hintText: { fontSize: "15px", color: "#555", fontStyle: "italic" },
  gamePreview: { maxWidth: "700px", width: "100%", display: "flex", flexDirection: "column", gap: "24px" },

  // LAMP
  lampWrap: { display: "flex", justifyContent: "center", height: "110px", position: "relative", marginBottom: "-10px" },
  lampPivot: { transformOrigin: "top center", display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 0 },
  lampCord: { width: "2px", height: "55px", backgroundColor: "#444" },
  lampShade: { width: "56px", height: "0", borderLeft: "28px solid transparent", borderRight: "28px solid transparent", borderTop: "36px solid #2a2a2a" },
  lampLight: { width: "80px", height: "40px", borderRadius: "0 0 40px 40px", background: "radial-gradient(ellipse at top, rgba(255,220,100,0.15) 0%, transparent 70%)", marginTop: "-4px" },

  // COINS
  coinWrap: { position: "relative", height: "140px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "-10px" },
  coin: { position: "absolute", width: "68px", height: "68px", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #f5d76e, #c9922a 60%, #8a5e0a)", border: "3px solid #f0c040", boxShadow: "0 4px 0px #7a4e0a, 0 6px 12px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" },
  coinSign: { fontSize: "24px", fontWeight: "900", color: "rgba(255,255,255,0.55)", userSelect: "none" },
  coinGlow: { position: "absolute", bottom: "-8px", width: "100px", height: "18px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(240,192,64,0.25) 0%, transparent 70%)" },

  // TICKET
  ticketWrap: { height: "160px", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", marginBottom: "-10px" },
  ticket: { position: "absolute", top: 0, width: "240px", backgroundColor: "#1a1a1a", border: "1px solid #3a3a3a", borderRadius: "10px", overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.6)" },
  ticketHeader: { backgroundColor: "#c0392b", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  ticketAirline: { fontSize: "11px", color: "#ffffff", fontWeight: "800", letterSpacing: "1px" },
  ticketNum: { fontSize: "10px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px" },
  ticketDash: { height: "1px", margin: "0 16px", backgroundImage: "repeating-linear-gradient(to right, #333 0, #333 6px, transparent 6px, transparent 12px)" },
  ticketBody: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" },
  ticketField: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  ticketFieldLabel: { fontSize: "9px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" },
  ticketFieldValue: { fontSize: "14px", color: "#f0b429", fontWeight: "900" },
  ticketFooter: { backgroundColor: "#111", padding: "8px 16px", textAlign: "center" },
  ticketFooterText: { fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "700" },

  // CAR
  carAnimWrap: { height: "120px", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", marginBottom: "-10px", overflow: "hidden" },
  carAnim: { position: "absolute", bottom: "10px" },
  carLabel: { position: "absolute", top: "10px", right: "20px", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #e74c3c" },
  carLabelText: { fontSize: "22px", fontWeight: "900", color: "#ffffff" },

  // AUCTION ANIMATION
  auctionAnimWrap: { height: "160px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", position: "relative", marginBottom: "-10px", overflow: "hidden", backgroundColor: "#0a0a0a", borderRadius: "12px", border: "1px solid #1f1f1f", padding: "12px 20px" },
  auctionHammerWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "8px" },
  auctionHammer: { transformOrigin: "top center", display: "flex", flexDirection: "column", alignItems: "center" },
  auctionHammerHandle: { width: "5px", height: "50px", backgroundColor: "#8b6914", borderRadius: "3px" },
  auctionHammerHead: { width: "28px", height: "12px", backgroundColor: "#f0b429", borderRadius: "3px", marginTop: "-3px" },
  auctionBlock: { width: "36px", height: "6px", backgroundColor: "#2a2a2a", borderRadius: "2px", marginTop: "4px" },
  auctionWatchWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  auctionWatchLabel: { fontSize: "10px", color: "#f0b429", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", margin: 0 },
  auctionPaddleWrap: { display: "flex", flexDirection: "column", alignItems: "center" },

  backBtn: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: "6px", border: "1.5px solid #2a2a2a", backgroundColor: "transparent", color: "#888", fontSize: "14px", cursor: "pointer", fontWeight: "600" },
  titleWrap: { display: "flex", flexDirection: "column", gap: "10px" },
  gameTitle: { fontSize: "56px", color: "#ffffff", margin: 0, fontWeight: "900", letterSpacing: "-1.5px", lineHeight: "1.1", minHeight: "70px" },
  gameTagline: { fontSize: "18px", color: "#888", margin: 0, fontStyle: "italic" },
  cursor: { animation: "blink 1s infinite", color: "#c0392b", fontWeight: "300" },
  storyCard: { backgroundColor: "#141414", border: "1px solid #1f1f1f", borderLeft: "4px solid #c0392b", padding: "24px 28px", borderRadius: "8px" },
  storyLabel: { fontSize: "11px", color: "#c0392b", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 14px 0", fontWeight: "700" },
  storyText: { fontSize: "17px", color: "#dddddd", lineHeight: "1.9", margin: 0 },
  quoteCard: { backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f", padding: "20px 24px", borderRadius: "8px" },
  quoteLabel: { fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 12px 0", fontWeight: "700" },
  quoteText: { fontSize: "16px", color: "#888", fontStyle: "italic", lineHeight: "1.8", margin: 0 },
  btnWrap: { display: "flex", flexDirection: "column", gap: "12px" },
  startBtn: { padding: "18px 40px", borderRadius: "8px", border: "none", backgroundColor: "#c0392b", color: "#ffffff", fontSize: "18px", cursor: "pointer", fontWeight: "800", alignSelf: "flex-start" },
};

export default Landing;