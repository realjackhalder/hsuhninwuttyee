import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { triggerConfetti } from "./ConfettiCanvas";
import { getAnniversaryDays } from "../utils/anniversary";

// Web Audio sound synthesizer for cute game sounds
function playSound(type: "catch" | "match" | "flip" | "win" | "miss") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "catch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "match") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.08); // C#5
      osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "flip") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "win") {
      // Arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.1);
        g.gain.setValueAtTime(0.2, now + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
        o.start(now + idx * 0.1);
        o.stop(now + idx * 0.1 + 0.26);
      });
    } else if (type === "miss") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Ignore audio failures if browser blocks autoplay
  }
}

// ─────────────────────────────────────────────────────────────
// GAME 1: Catch My Heart Game
// ─────────────────────────────────────────────────────────────
interface FallingItem {
  id: number;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  speed: number;
  icon: string;
  points: number;
  label: string;
}

const LOVE_ITEMS = [
  { icon: "💖", points: 10, label: "True Love!" },
  { icon: "🌹", points: 15, label: "Red Rose!" },
  { icon: "💍", points: 30, label: "Forever Ring!" },
  { icon: "💌", points: 20, label: "Love Letter!" },
  { icon: "🍓", points: 15, label: "Sweet Berry!" },
  { icon: "✨", points: 25, label: "Pure Magic!" },
  { icon: "🧸", points: 20, label: "Warm Cuddle!" },
];

const getRomanticCompliments = (days: number) => [
  "Nya Nya is the cutest! 💖",
  "Jack loves Nya Nya to the moon & back! 🌙",
  `${days} days and falling for you more! 🌸`,
  "My favorite smile in the whole universe! ✨",
  "You make my heart skip a beat! 💓",
  "Forever yours, Nya Nya! 💍",
];

export function CatchHeartGame({ days: propDays }: { days?: number }) {
  const days = propDays ?? getAnniversaryDays();
  const compliments = useMemo(() => getRomanticCompliments(days), [days]);
  const complimentsRef = useRef(compliments);
  complimentsRef.current = compliments;

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("nya_nya_game_highscore") || "0", 10);
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [basketX, setBasketX] = useState(50); // percentage
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [floatingMessage, setFloatingMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const basketXRef = useRef(50);
  const itemsRef = useRef<FallingItem[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);

  // Synchronize basket position smoothly
  const updateBasketPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(8, Math.min(92, percent));
    basketXRef.current = clamped;
    setBasketX(clamped);
  }, []);

  const moveBasketStep = useCallback((deltaPercent: number) => {
    const nextVal = Math.max(8, Math.min(92, basketXRef.current + deltaPercent));
    basketXRef.current = nextVal;
    setBasketX(nextVal);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        moveBasketStep(-7);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        moveBasketStep(7);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, moveBasketStep]);

  // Touch / pointer drag controls (optimized for fingers on mobile)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateBasketPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying) return;
    // Only update if pointer is down/dragging or hovering with mouse
    if (e.buttons > 0 || e.pointerType === "mouse") {
      updateBasketPosition(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPlaying || e.touches.length === 0) return;
    updateBasketPosition(e.touches[0].clientX);
  };

  // Start game
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    itemsRef.current = [];
    setFallingItems([]);
    lastSpawnRef.current = 0;
    basketXRef.current = 50;
    setBasketX(50);
    setIsPlaying(true);
    setFloatingMessage("Catch as many hearts as you can, Nya Nya! 💖");
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          setGameOver(true);
          playSound("win");
          triggerConfetti();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("nya_nya_game_highscore", String(score));
    }
  }, [score, highScore]);

  // Game loop for falling items — runs smoothly on animation frames independent of basket touches
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setFallingItems([]);
      return;
    }

    const loop = (timestamp: number) => {
      // Spawn new item every ~450ms
      if (timestamp - lastSpawnRef.current > 420) {
        lastSpawnRef.current = timestamp;
        const randomItem = LOVE_ITEMS[Math.floor(Math.random() * LOVE_ITEMS.length)];
        itemsRef.current.push({
          id: nextIdRef.current++,
          x: 10 + Math.random() * 80,
          y: -5,
          speed: 0.75 + Math.random() * 0.45,
          icon: randomItem.icon,
          points: randomItem.points,
          label: randomItem.label,
        });
      }

      // Read current basket position from ref (NEVER freezes on finger moves)
      const currentBasket = basketXRef.current;
      const basketLeft = currentBasket - 12;
      const basketRight = currentBasket + 12;

      const remaining: FallingItem[] = [];

      for (const item of itemsRef.current) {
        item.y += item.speed;

        // Catch collision near basket (y between 78% and 92%)
        if (item.y >= 78 && item.y <= 92 && item.x >= basketLeft && item.x <= basketRight) {
          playSound("catch");
          setScore((s) => s + item.points);
          // Show romantic compliment randomly
          if (Math.random() > 0.45) {
            const list = complimentsRef.current;
            const compliment = list[Math.floor(Math.random() * list.length)];
            setFloatingMessage(compliment);
          }
          continue; // Item caught, remove immediately
        }

        // Only keep if still on screen (strictly cleaned up so no left-drop ghosts)
        if (item.y <= 100) {
          remaining.push(item);
        }
      }

      itemsRef.current = remaining;
      setFallingItems([...remaining]);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="game-card">
      <div className="game-header">
        <span className="game-badge">🎮 NYA NYA'S ROMANTIC ARCADE</span>
        <h2 className="game-title">Catch My Heart 💖</h2>
        <p className="game-subtitle">
          Slide the heart basket to catch all the love falling from the sky!
        </p>
      </div>

      {/* Scoreboard */}
      <div className="game-stats-bar">
        <div className="stat-pill score-pill">
          <span className="stat-label">Score</span>
          <span className="stat-val">{score}</span>
        </div>
        <div className="stat-pill time-pill">
          <span className="stat-label">Time</span>
          <span className="stat-val">{timeLeft}s</span>
        </div>
        <div className="stat-pill highscore-pill">
          <span className="stat-label">Best</span>
          <span className="stat-val">{highScore}</span>
        </div>
      </div>

      {floatingMessage && (
        <div className="floating-love-message">{floatingMessage}</div>
      )}

      {/* Game Play Area with responsive finger drag support */}
      <div
        ref={containerRef}
        className="game-canvas-area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onTouchStart={(e) => {
          if (isPlaying && e.touches.length > 0) {
            updateBasketPosition(e.touches[0].clientX);
          }
        }}
        onTouchMove={handleTouchMove}
        style={{ touchAction: "none" }}
      >
        {!isPlaying && !gameOver && (
          <div className="game-overlay start-overlay">
            <div className="overlay-heart-icon">🌸</div>
            <h3>Ready, Nya Nya?</h3>
            <p>Catch hearts, roses, rings & strawberries!</p>
            <button className="play-start-btn" onClick={startGame}>
              Start Catching Love 💕
            </button>
            <p className="tip-note">💡 On mobile, drag your finger across or use the touch buttons below!</p>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay end-overlay">
            <div className="overlay-heart-icon">🏆💖</div>
            <h3>Game Over! You're Amazing!</h3>
            <p className="final-score-text">
              Nya Nya caught <strong>{score}</strong> points of love!
            </p>
            <p className="love-reward-text">
              "You caught all my love, but the truth is — my heart was always yours, Nya Nya! ❤️"
            </p>
            <button className="play-start-btn" onClick={startGame}>
              Play Again 🔄
            </button>
          </div>
        )}

        {/* Falling items — each with guaranteed unique key so no freezing or left-drop ghosts */}
        {isPlaying &&
          fallingItems.map((item) => (
            <div
              key={item.id}
              className="falling-game-item"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              <span>{item.icon}</span>
            </div>
          ))}

        {/* Basket */}
        <div
          className="game-basket"
          style={{
            left: `${basketX}%`,
            transition: "none", // Instant response to finger
          }}
        >
          <div className="basket-glow" />
          <div className="basket-body">🧺💖</div>
          <span className="basket-tag">Nya Nya</span>
        </div>
      </div>

      {/* On-screen touch control buttons for easy mobile finger navigation */}
      {isPlaying && (
        <div className="mobile-touch-controls" aria-label="Mobile Controls">
          <button
            type="button"
            className="touch-ctrl-btn"
            onPointerDown={(e) => {
              e.preventDefault();
              moveBasketStep(-10);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              moveBasketStep(-10);
            }}
          >
            ◀ Slide Left
          </button>
          <button
            type="button"
            className="touch-ctrl-btn"
            onPointerDown={(e) => {
              e.preventDefault();
              moveBasketStep(10);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              moveBasketStep(10);
            }}
          >
            Slide Right ▶
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 2: Couple Photo Memory Match Game (With 20 Move Limit!)
// ─────────────────────────────────────────────────────────────
interface CardItem {
  id: number;
  pairId: number;
  image?: string;
  emoji?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_PHOTOS = [
  "/pics/IMG_0569.jpeg",
  "/pics/IMG_0570.jpeg",
  "/pics/IMG_0606.jpeg",
  "/pics/IMG_0618.jpeg",
  "/pics/IMG_0630.jpeg",
  "/pics/IMG_0906.jpeg",
];

const MAX_MEMORY_MOVES = 20;

export function PhotoMemoryGame({ onWin }: { onWin?: () => void }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);

  // Initialize cards
  const initGame = useCallback(() => {
    const newCards: CardItem[] = [];
    MEMORY_PHOTOS.forEach((photo, i) => {
      // Create 2 cards for each photo
      newCards.push({
        id: i * 2,
        pairId: i,
        image: photo,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: i * 2 + 1,
        pairId: i,
        image: photo,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsLocked(false);
    setHasWon(false);
    setHasLost(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    if (isLocked || hasWon || hasLost || moves >= MAX_MEMORY_MOVES) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    playSound("flip");

    const newCards = cards.map((c, i) => (i === index ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedIndices, index];

    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      setIsLocked(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        playSound("match");
        const matchedCards = newCards.map((c, i) =>
          i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);
        setFlippedIndices([]);
        setIsLocked(false);
        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);

        if (newMatched === MEMORY_PHOTOS.length) {
          setHasWon(true);
          playSound("win");
          triggerConfetti();
          onWin?.();
        } else if (nextMoves >= MAX_MEMORY_MOVES) {
          // Out of moves!
          setHasLost(true);
          playSound("miss");
        }
      } else {
        // Not matched, flip back after 850ms
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
          setIsLocked(false);
          if (nextMoves >= MAX_MEMORY_MOVES) {
            setHasLost(true);
            playSound("miss");
          }
        }, 850);
      }
    }
  };

  const movesLeft = Math.max(0, MAX_MEMORY_MOVES - moves);
  const isMoveWarning = moves >= 15;

  return (
    <div className="game-card">
      <div className="game-header">
        <span className="game-badge">🧩 SWEET MEMORY MATCH</span>
        <h2 className="game-title">Our Romantic Moments 💕</h2>
        <p className="game-subtitle">
          Find matching photo pairs of our sweetest memories! You have a limit of 20 moves.
        </p>
      </div>

      <div className="game-stats-bar">
        <div className={`stat-pill ${isMoveWarning ? "stat-warning-pill" : ""}`}>
          <span className="stat-label">Moves</span>
          <span className="stat-val">
            {moves} / {MAX_MEMORY_MOVES}
          </span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Moves Left</span>
          <span className="stat-val">{movesLeft}</span>
        </div>
        <div className="stat-pill highlight-pill">
          <span className="stat-label">Pairs Matched</span>
          <span className="stat-val">
            {matchedPairs} / {MEMORY_PHOTOS.length}
          </span>
        </div>
        <button className="reset-mini-btn" onClick={initGame} title="Restart Game">
          🔄 Restart
        </button>
      </div>

      {hasWon && (
        <div className="memory-win-banner">
          <div className="win-icon">💍💖🌸</div>
          <h3>You Completed Our Memory Puzzle, Nya Nya!</h3>
          <p>Every single photo is proof of how much I cherish you.</p>
          <button className="play-start-btn" onClick={initGame}>
            Play Again 🔄
          </button>
        </div>
      )}

      {hasLost && !hasWon && (
        <div className="memory-lose-banner">
          <div className="lose-icon">🥺💔</div>
          <h3>Out of Moves! ({MAX_MEMORY_MOVES}/{MAX_MEMORY_MOVES})</h3>
          <p>Don't be sad, my love! Every sweet moment with you is still safe in my heart. Give it another try!</p>
          <button className="play-start-btn" onClick={initGame}>
            Try Again 🔄
          </button>
        </div>
      )}

      {/* Memory Grid */}
      <div className="memory-cards-grid">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`memory-card ${card.isFlipped ? "flipped" : ""} ${
              card.isMatched ? "matched" : ""
            }`}
            onClick={() => handleCardClick(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCardClick(idx);
              }
            }}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">
                <span className="card-mystery-icon">💝</span>
                <span className="card-corner-sparkle">✨</span>
              </div>
              <div className="memory-card-back">
                {card.image && (
                  <img
                    src={card.image}
                    alt="Our Memory"
                    className="memory-card-img"
                    loading="lazy"
                  />
                )}
                {card.isMatched && <div className="matched-badge">❤️</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Combined Romantic Game Center Component
// ─────────────────────────────────────────────────────────────
export function RomanticGameCenter({ onCelebrate, days }: { onCelebrate?: () => void; days?: number }) {
  const [activeGame, setActiveGame] = useState<"catch" | "memory">("catch");

  return (
    <div className="romantic-game-center">
      {/* Game Mode Selector */}
      <div className="game-mode-nav">
        <button
          className={`game-mode-pill ${activeGame === "catch" ? "active" : ""}`}
          onClick={() => setActiveGame("catch")}
        >
          <span>🎯</span> Catch Falling Hearts
        </button>
        <button
          className={`game-mode-pill ${activeGame === "memory" ? "active" : ""}`}
          onClick={() => setActiveGame("memory")}
        >
          <span>🧩</span> Photo Memory Match (20 Moves)
        </button>
      </div>

      {activeGame === "catch" && <CatchHeartGame days={days} />}
      {activeGame === "memory" && <PhotoMemoryGame onWin={onCelebrate} />}
    </div>
  );
}
