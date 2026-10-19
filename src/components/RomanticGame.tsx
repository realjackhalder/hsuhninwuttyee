import React, { useState, useEffect, useRef, useCallback } from "react";
import { triggerConfetti } from "./ConfettiCanvas";

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
      osc.stop(now + 0.15);
    } else if (type === "match") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.08); // C#5
      osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "flip") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "win") {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        noteOsc.connect(noteGain);
        noteGain.connect(ctx.destination);
        noteOsc.type = "sine";
        noteOsc.frequency.setValueAtTime(freq, now + i * 0.1);
        noteGain.gain.setValueAtTime(0.2, now + i * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
        noteOsc.start(now + i * 0.1);
        noteOsc.stop(now + i * 0.1 + 0.25);
      });
    }
  } catch {
    // Ignore audio context errors if browser blocks autoplay
  }
}

// ─────────────────────────────────────────────────────────────
// GAME 1: Catch Falling Hearts & Gifts (Touch & Keyboard friendly)
// ─────────────────────────────────────────────────────────────
interface FallingItem {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
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

const COMPLIMENTS = [
  "Nya Nya is the cutest! 💖",
  "Jack loves Nya Nya to the moon & back! 🌙",
  "554 days and falling for you more! 🌸",
  "My favorite smile in the whole universe! ✨",
  "You make my heart skip a beat! 💓",
  "Forever yours, Nya Nya! 💍",
];

export function CatchHeartGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("nya_nya_game_highscore") || "0", 10);
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [basketX, setBasketX] = useState(50); // percentage
  const [floatingMessage, setFloatingMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const [, setTick] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        setBasketX((prev) => Math.max(8, prev - 7));
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setBasketX((prev) => Math.min(92, prev + 7));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  // Touch / pointer drag controls (for iPhone & iPad)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(8, Math.min(92, percent)));
  };

  // Start game
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    itemsRef.current = [];
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

  // Game loop for falling items
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let nextId = 1;
    const loop = (timestamp: number) => {
      // Spawn new item every 400-600ms
      if (timestamp - lastSpawnRef.current > 450) {
        lastSpawnRef.current = timestamp;
        const randomItem = LOVE_ITEMS[Math.floor(Math.random() * LOVE_ITEMS.length)];
        itemsRef.current.push({
          id: nextId++,
          x: 10 + Math.random() * 80,
          y: -5,
          speed: 0.65 + Math.random() * 0.45,
          icon: randomItem.icon,
          points: randomItem.points,
          label: randomItem.label,
        });
      }

      // Move items down
      const remaining: FallingItem[] = [];
      const basketLeft = basketX - 12;
      const basketRight = basketX + 12;

      for (const item of itemsRef.current) {
        item.y += item.speed;

        // Catch collision near basket (y between 78 and 88%)
        if (item.y >= 78 && item.y <= 90 && item.x >= basketLeft && item.x <= basketRight) {
          playSound("catch");
          setScore((s) => s + item.points);
          // Show romantic compliment randomly
          if (Math.random() > 0.45) {
            const compliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
            setFloatingMessage(compliment);
          }
          continue; // Item caught, do not keep
        }

        if (item.y <= 100) {
          remaining.push(item);
        }
      }

      itemsRef.current = remaining;
      setTick((t) => (t + 1) % 1000);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, basketX]);

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
        <div className="stat-pill high-pill">
          <span className="stat-label">Best</span>
          <span className="stat-val">{highScore}</span>
        </div>
      </div>

      {floatingMessage && (
        <div className="floating-love-message">{floatingMessage}</div>
      )}

      {/* Game Play Area */}
      <div
        ref={containerRef}
        className="game-canvas-area"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
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
            <p className="tip-note">💡 On mobile / iPad, drag your finger across the screen!</p>
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

        {/* Falling items */}
        {isPlaying &&
          itemsRef.current.map((item) => (
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
          }}
        >
          <div className="basket-glow" />
          <div className="basket-body">🧺💖</div>
          <span className="basket-tag">Nya Nya</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 2: Couple Photo Memory Match Game (Using real pics!)
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

export function PhotoMemoryGame({ onWin }: { onWin?: () => void }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasWon, setHasWon] = useState(false);

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
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    playSound("flip");

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    const newFlipped = [...flippedIndices, index];

    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        playSound("match");
        newCards[firstIdx].isMatched = true;
        newCards[secondIdx].isMatched = true;
        setCards([...newCards]);
        setFlippedIndices([]);
        setIsLocked(false);
        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);

        if (newMatched === MEMORY_PHOTOS.length) {
          setHasWon(true);
          playSound("win");
          triggerConfetti();
          onWin?.();
        }
      } else {
        // Not matched, flip back after 900ms
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="game-card">
      <div className="game-header">
        <span className="game-badge">🧩 SWEET MEMORY MATCH</span>
        <h2 className="game-title">Our Romantic Moments 💕</h2>
        <p className="game-subtitle">
          Find matching photo pairs of our sweetest memories together!
        </p>
      </div>

      <div className="game-stats-bar">
        <div className="stat-pill">
          <span className="stat-label">Moves</span>
          <span className="stat-val">{moves}</span>
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

      {/* Memory Grid */}
      <div className="memory-cards-grid">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`memory-card ${card.isFlipped ? "flipped" : ""} ${
              card.isMatched ? "matched" : ""
            }`}
            onClick={() => handleCardClick(idx)}
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
export function RomanticGameCenter({ onCelebrate }: { onCelebrate?: () => void }) {
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
          <span>🧩</span> Photo Memory Match
        </button>
      </div>

      {activeGame === "catch" && <CatchHeartGame />}
      {activeGame === "memory" && <PhotoMemoryGame onWin={onCelebrate} />}
    </div>
  );
}
