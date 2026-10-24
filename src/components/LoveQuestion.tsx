import { useState, useRef, useCallback, useEffect } from "react";
import { getAnniversaryDays } from "../utils/anniversary";

interface LoveQuestionProps {
  onYesCelebrate?: () => void;
  days?: number;
}

export function LoveQuestion({ onYesCelebrate, days: propDays }: LoveQuestionProps) {
  const days = propDays ?? getAnniversaryDays();
  const [noStep, setNoStep] = useState(0);
  const [noPos, setNoPos] = useState<{ top: string; left: string } | null>(null);
  const [hasSaidYes, setHasSaidYes] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  // Lovely edited texts — extra romantic for Nya Nya
  const noMessages = [
    "No 🙈",
    "Are you sure? 🥺",
    `Think of our ${days} days! 💔`,
    "My heart will cry! 😭",
    "Catch me if you can! 🏃‍♀️💨",
    "Hehe you missed! 😝",
    "Nope! Say YES! 🥰",
    "Forever YES only! 💖",
  ];

  const subTexts = [
    "My sweet Nya Nya, you are my whole world 💕",
    "Are you really sure, my love? Look into my heart 🥺",
    `Every one of our ${days} beautiful days is written in my soul ✨`,
    `Don't break this heart that beats only for you, Nya Nya 💔`,
    "Even the No button is too shy to stay! It keeps running! 🏃‍♀️💨",
    "See? Destiny itself wants you to say YES! 💘",
    "Your YES is my favorite word in the whole universe, my love 🥰",
    "I love you more than all the stars, my precious Nya Nya 🌙💖",
  ];

  const headlineTexts = [
    "Nya Nya, do you love me? 💖",
    "Eh? Think again, my love! 🥺",
    "Really? Remember our cuddles? 😣",
    "Please don't break my heart! 💔😭",
    "Hehe you can't catch NO! 😝💨",
    "Just say YES, my forever! 💘",
  ];

  const yesLabels = [
    "Yes! I love you! 💕",
    "Yes, my love! 💖",
    "YES! Forever yours! 💍💖",
    "YESSS! I love you most! 😘💘",
  ];

  const cuteGifs = [
    "https://media.tenor.com/22885016/manja.gif",
    "https://media.tenor.com/22050818/mochi.gif",
    "https://media.tenor.com/15195810/couple-forgive-me.gif",
    "https://media.tenor.com/15974530976611222074/peach-goma-phone.gif",
    "https://media.tenor.com/253027946666209433/mochi-cat.gif",
  ];

  const getYesLabel = () => {
    if (noStep === 0) return yesLabels[0];
    if (noStep === 1) return yesLabels[1];
    if (noStep === 2) return yesLabels[2];
    return yesLabels[3];
  };

  const moveNoButton = useCallback(() => {
    try { navigator.vibrate?.(12); } catch {}
    setNoStep((prev) => {
      const next = prev + 1;
      // Lovely random spot INSIDE the button row — safe for fingers on phone & iPad
      // Row is 160px tall, so % keeps it visible and tappable-area friendly
      const randomTop = Math.floor(Math.random() * 54 + 14); // 14% - 68%
      const randomLeft = Math.floor(Math.random() * 58 + 14); // 14% - 72%
      setNoPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
      return next;
    });
  }, []);

  // No button RUNS AWAY before you can click — with finger, mouse, or iPad pencil!
  const handleNoEvade = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
  }, [moveNoButton]);

  // Proximity dodge: if finger/mouse comes near the No button, it jumps!
  useEffect(() => {
    const row = rowRef.current;
    const btn = noBtnRef.current;
    if (!row || !btn || hasSaidYes) return;

    let ticking = false;
    const onPointerMove = (e: PointerEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        // If pointer is within ~110px, No runs away — impossible to catch!
        if (dist < 110) {
          const randomTop = Math.floor(Math.random() * 54 + 14);
          const randomLeft = Math.floor(Math.random() * 58 + 14);
          setNoPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
          setNoStep((s) => s + 1);
          try { navigator.vibrate?.(8); } catch {}
        }
      });
    };
    // Only activate evasion after first interaction, so initial layout is calm & lovely
    if (noStep >= 0) {
      row.addEventListener("pointermove", onPointerMove, { passive: true });
      return () => row.removeEventListener("pointermove", onPointerMove);
    }
  }, [noStep, hasSaidYes]);

  const handleYes = () => {
    try { navigator.vibrate?.([30, 20, 60]); } catch {}
    setHasSaidYes(true);
    onYesCelebrate?.();
  };

  // Yes grows more lovable each time No runs — iPad & phone safe
  const yesScale = Math.min(1.62, 1 + noStep * 0.13);

  return (
    <div
      className="love-question-card"
      ref={containerRef}
      style={{ minHeight: "520px", touchAction: "manipulation" }}
    >
      {!hasSaidYes ? (
        <div className="question-content">
          <div className="gif-sticker-box">
            <img
              src={cuteGifs[Math.min(noStep, cuteGifs.length - 1)]}
              alt="Cute love animation"
              className="love-sticker-img"
              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
            />
            <div className="fallback-emoji-sticker" aria-hidden="true">
              {noStep === 0 && "🥰"}
              {noStep === 1 && "🥺"}
              {noStep === 2 && "😣"}
              {noStep === 3 && "💔"}
              {noStep === 4 && "🏃‍♀️💨"}
              {noStep >= 5 && "😝💖"}
            </div>
          </div>

          <h2 className="question-headline">
            {headlineTexts[Math.min(noStep, headlineTexts.length - 1)]}
          </h2>

          <p className="question-subtext">
            {subTexts[Math.min(noStep, subTexts.length - 1)]}
          </p>

          {/* Lovely arena: Yes stays, No runs away with your finger! */}
          <div
            ref={rowRef}
            className="question-btn-row"
            style={{
              position: "relative",
              minHeight: "168px",
              touchAction: "none",
              isolation: "isolate",
            }}
          >
            <button
              type="button"
              className="btn-yes pulse-glow"
              onClick={handleYes}
              onTouchEnd={(e) => { e.preventDefault(); handleYes(); }}
              style={{
                transform: `scale(${yesScale})`,
                zIndex: 5,
                touchAction: "manipulation",
              }}
            >
              {getYesLabel()}
            </button>

            <button
              ref={noBtnRef}
              type="button"
              className="btn-no btn-no-runaway"
              aria-label="No button runs away"
              onClick={handleNoEvade}
              onTouchStart={handleNoEvade}
              onTouchEnd={handleNoEvade}
              onPointerDown={(e) => {
                if (e.pointerType === "touch") handleNoEvade(e);
              }}
              onPointerEnter={noStep >= 0 ? handleNoEvade : undefined}
              onMouseEnter={handleNoEvade}
              style={
                noPos
                  ? {
                      position: "absolute",
                      top: noPos.top,
                      left: noPos.left,
                      transform: "translate(-50%, -50%)",
                      transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      zIndex: 20,
                      touchAction: "none",
                    }
                  : {
                      touchAction: "none",
                      transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }
              }
            >
              {noMessages[Math.min(noStep, noMessages.length - 1)]}
            </button>
          </div>

          {noStep === 0 && (
            <p className="hint-pill hint-soft">👆 Try to tap NO — I dare you, Nya Nya! 😝</p>
          )}
          {noStep >= 1 && (
            <p className="hint-pill">
              ✨ Hehe! NO keeps running away — it knows your heart wants to say YES! Just tap YES, my love! 🥰💖 ✨
            </p>
          )}
          {noStep >= 3 && (
            <p className="hint-pill hint-love">
              💘 See? Even the button knows you love me! Your YES makes my world, Nya Nya! 💘
            </p>
          )}
        </div>
      ) : (
        <div className="celebration-content fade-in">
          <div className="gif-sticker-box celebration-gif">
            <img
              src="https://media.tenor.com/253027946666209433/mochi-cat.gif"
              alt="Happy cuddle kiss"
              className="love-sticker-img"
              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
            />
            <div className="fallback-emoji-sticker" aria-hidden="true">😘💖</div>
          </div>

          <h2 className="celebration-headline">
            YAYYY! Nya Nya loves me so much! 😘💘
          </h2>

          <p className="celebration-text">
            I knew it from the very first day, my precious Nya Nya!
            <br />
            Happy <strong>{days} Days</strong> Anniversary, my forever love!
            <br />
            You are my dream, my home, my everything.
            <br />
            I love you more than yesterday, and I’ll love you even more tomorrow. Forever yours! 🥂✨💍🌹
          </p>

          <div className="celebration-hearts-row" aria-hidden="true">
            <span>💖</span><span>✨</span><span>🌹</span><span>💍</span><span>🌹</span><span>✨</span><span>💖</span>
          </div>

          <button
            type="button"
            className="btn-replay-question"
            onClick={() => {
              setHasSaidYes(false);
              setNoStep(0);
              setNoPos(null);
            }}
          >
            Ask Me Again 💕
          </button>
        </div>
      )}
    </div>
  );
}
