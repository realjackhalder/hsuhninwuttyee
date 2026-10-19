import { useState } from "react";
import { LoveTreeCanvas } from "./components/LoveTreeCanvas";
import { AnniversaryClock } from "./components/AnniversaryClock";
import { TypewriterLetter } from "./components/TypewriterLetter";
import { LoveQuestion } from "./components/LoveQuestion";
import { EscapeButton } from "./components/EscapeButton";
import { RomanticGameCenter } from "./components/RomanticGame";
import { MediaGallery } from "./components/MediaGallery";
import { MusicPlayer } from "./components/MusicPlayer";
import { ConfettiCanvas, triggerConfetti } from "./components/ConfettiCanvas";
import "./App.css";

type TabKey = "tree" | "gallery" | "game" | "question" | "escape";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("tree");

  const handleCelebrate = () => {
    triggerConfetti();
  };

  return (
    <div className="anniversary-app">
      {/* Visual background sparkles and music */}
      <ConfettiCanvas />
      <MusicPlayer />

      {/* Floating background ambient rose glows */}
      <div className="bg-glow glow-top-left" aria-hidden="true" />
      <div className="bg-glow glow-bottom-right" aria-hidden="true" />

      {/* Navigation Header */}
      <header className="main-nav-bar">
        <div className="top-nav-row center-nav">
          <nav className="nav-tabs" aria-label="Anniversary Sections">
            <button
              className={`nav-tab-btn ${activeTab === "tree" ? "active" : ""}`}
              onClick={() => setActiveTab("tree")}
            >
              <span className="tab-icon">🌸</span>
              <span className="tab-text">Our Love Tree</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              <span className="tab-icon">📸</span>
              <span className="tab-text">Memories & Videos</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "game" ? "active" : ""}`}
              onClick={() => setActiveTab("game")}
            >
              <span className="tab-icon">🎮</span>
              <span className="tab-text">Play Games</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "question" ? "active" : ""}`}
              onClick={() => setActiveTab("question")}
            >
              <span className="tab-icon">💌</span>
              <span className="tab-text">Do You Love Me?</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "escape" ? "active" : ""}`}
              onClick={() => setActiveTab("escape")}
            >
              <span className="tab-icon">🏃‍♂️</span>
              <span className="tab-text">Catch Me</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="content-container">
        {/* Hero Banner */}
        <section className="hero-banner">
          <span className="hero-tag">HAPPY 554 DAYS ANNIVERSARY</span>
          <h1 className="hero-heading">
            For My Dearest <span className="gradient-name">Nya Nya</span>
          </h1>
          <p className="hero-dates">April 14, 2025 — Today & Forever</p>
        </section>

        {/* ── TAB 1: LOVE TREE & ANNIVERSARY CLOCK & LETTER ───────── */}
        {activeTab === "tree" && (
          <div className="tab-pane fade-in">
            {/* Live Anniversary Counter */}
            <AnniversaryClock />

            {/* Split layout: Canvas Love Tree & Romantic Typewriter Letter */}
            <div className="tree-and-letter-grid">
              <div className="tree-column">
                <LoveTreeCanvas />
              </div>

              <div className="letter-column">
                <div className="letter-header-badge">
                  <span>💌 A Love Letter For You</span>
                </div>
                <TypewriterLetter />
              </div>
            </div>

            {/* Milestone Timeline */}
            <section className="milestones-section">
              <h3 className="milestones-title">✨ Our Journey Milestones ✨</h3>
              <div className="milestones-grid">
                <div className="milestone-card">
                  <div className="milestone-icon">🌱</div>
                  <div className="milestone-date">April 14, 2025</div>
                  <div className="milestone-name">The First Day</div>
                  <p>The day two worlds aligned and our love story began.</p>
                </div>

                <div className="milestone-card">
                  <div className="milestone-icon">🌹</div>
                  <div className="milestone-date">Day 100</div>
                  <div className="milestone-name">Falling Deeper</div>
                  <p>Realizing that life with you is a thousand times sweeter.</p>
                </div>

                <div className="milestone-card">
                  <div className="milestone-icon">🥂</div>
                  <div className="milestone-date">Day 365</div>
                  <div className="milestone-name">One Year Together</div>
                  <p>365 days of laughter, cuddles, and endless growth.</p>
                </div>

                <div className="milestone-card highlight-card">
                  <div className="milestone-icon">💖</div>
                  <div className="milestone-date">Day 554 (Today!)</div>
                  <div className="milestone-name">554 Days Strong</div>
                  <p>More in love with you today than yesterday, and even more tomorrow.</p>
                </div>

                <div className="milestone-card">
                  <div className="milestone-icon">♾️</div>
                  <div className="milestone-date">Forever</div>
                  <div className="milestone-name">Every Tomorrow</div>
                  <p>Holding your hand through every chapter yet to come.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 2: SWEET MEMORIES & VIDEOS (from Pics/) ──────── */}
        {activeTab === "gallery" && (
          <div className="tab-pane fade-in">
            <MediaGallery />
          </div>
        )}

        {/* ── TAB 3: PLAY GAMES (Arcade & Photo Memory Match) ──── */}
        {activeTab === "game" && (
          <div className="tab-pane fade-in">
            <RomanticGameCenter onCelebrate={handleCelebrate} />
          </div>
        )}

        {/* ── TAB 4: INTERACTIVE QUESTION / PROPOSAL ───────────── */}
        {activeTab === "question" && (
          <div className="tab-pane fade-in">
            <div className="question-wrapper">
              <LoveQuestion onYesCelebrate={handleCelebrate} />
            </div>
          </div>
        )}

        {/* ── TAB 5: ESCAPE BUTTON (Bencho Component) ───────────── */}
        {activeTab === "escape" && (
          <div className="tab-pane fade-in">
            <section className="escape-game-box">
              <div className="escape-intro">
                <h2>Can You Catch My Heart? 💘</h2>
                <p>
                  A playful game for Nya Nya: try to click the runaway button!
                  <br />
                  (Don't worry, it surrenders after 4 dodges!)
                </p>
              </div>

              <div className="escape-canvas-center">
                <EscapeButton
                  label="Try To Catch Me 💨"
                  caughtLabel="You Caught My Heart, Nya Nya! 💖"
                  patience={4}
                  skittishness={65}
                  onCaught={() => {
                    triggerConfetti();
                  }}
                />
              </div>

              <p className="escape-note">
                ✨ No matter how fast it runs, my heart will always belong to Nya Nya ✨
              </p>
            </section>
          </div>
        )}
      </main>

      {/* Romantic Footer */}
      <footer className="anniversary-footer">
        <p>
          Dedicated to <strong>Nya Nya</strong> with all my love ❤️
        </p>
        <p className="footer-small">
          Celebrating 554 Days of Love 💕
        </p>
      </footer>
    </div>
  );
}
