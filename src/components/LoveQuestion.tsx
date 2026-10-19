import { useState, useRef } from "react";
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

  // Cute English dialogues inspired by Code with Patel & adapted for Nya Nya
  const noMessages = [
    "No",
    "Please think again! 🥺",
    "Are you really sure, Nya Nya? 😣",
    `Think about our ${days} days together! 💔`,
    "Don't break my heart! 😭",
    "You can't catch me anyway! 🏃‍♀️💨",
    "Just click YES already! 🥰",
  ];

  const subTexts = [
    "You mean the whole world to me 💕",
    "Don't be in such a rush to say no... 🥺",
    "Think about all the sweet memories we shared! ✨",
    `${days} days of love cannot end like this! 😭`,
    "I'm going to cry a river if you keep saying no! 🌊",
    "See? Even the button knows you belong with me! 💘",
  ];

  const cuteGifs = [
    // Cute Tenor sticker URLs of Peach & Goma / Mochi Cats
    "https://media.tenor.com/22885016/manja.gif", // cute begging
    "https://media.tenor.com/22050818/mochi.gif", // thinking / pleading
    "https://media.tenor.com/15195810/couple-forgive-me.gif", // crying / begging
    "https://media.tenor.com/15974530976611222074/peach-goma-phone.gif", // funny annoyed / running
    "https://media.tenor.com/253027946666209433/mochi-cat.gif", // Happy hug kiss
  ];

  const handleNoInteraction = () => {
    const nextStep = noStep + 1;
    setNoStep(nextStep);

    // From step 3 onwards, jump randomly like Code with Patel's move-random!
    if (nextStep >= 3) {
      const randomTop = Math.floor(Math.random() * 70 + 15);
      const randomLeft = Math.floor(Math.random() * 70 + 15);
      setNoPos({
        top: `${randomTop}%`,
        left: `${randomLeft}%`,
      });
    }
  };

  const handleYes = () => {
    setHasSaidYes(true);
    if (onYesCelebrate) {
      onYesCelebrate();
    }
  };

  // The Yes button grows bigger each time No is touched!
  const yesScale = Math.min(2.2, 1 + noStep * 0.2);

  return (
    <div className="love-question-card" ref={containerRef}>
      {!hasSaidYes ? (
        <div className="question-content">
          <div className="gif-sticker-box">
            <img
              src={cuteGifs[Math.min(noStep, cuteGifs.length - 2)]}
              alt="Cute love animation"
              className="love-sticker-img"
              onError={(e) => {
                // Fallback to high quality romantic emoji if gif takes time to load
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="fallback-emoji-sticker" aria-hidden="true">
              {noStep === 0 && "🥰"}
              {noStep === 1 && "🥺"}
              {noStep === 2 && "😣"}
              {noStep === 3 && "💔"}
              {noStep >= 4 && "🏃‍♀️💨"}
            </div>
          </div>

          <h2 className="question-headline">
            {noStep === 0
              ? "Nya Nya, do you love me? 💖"
              : noStep === 1
              ? "Please think again! 🥺"
              : noStep === 2
              ? "One more time, please! 😣"
              : "Baby please say yes! 😭"}
          </h2>

          <p className="question-subtext">
            {subTexts[Math.min(noStep, subTexts.length - 1)]}
          </p>

          <div className="question-btn-row">
            <button
              className="btn-yes pulse-glow"
              onClick={handleYes}
              style={{
                transform: `scale(${yesScale})`,
                zIndex: 20,
              }}
            >
              {noStep === 0 ? "Yes! 💕" : "Yes, of course! 💖"}
            </button>

            <button
              className="btn-no"
              onClick={handleNoInteraction}
              onMouseEnter={noStep >= 2 ? handleNoInteraction : undefined}
              style={
                noPos
                  ? {
                      position: "absolute",
                      top: noPos.top,
                      left: noPos.left,
                      transition: "all 0.2s cubic-bezier(0.2, 1, 0.3, 1)",
                      zIndex: 10,
                    }
                  : undefined
              }
            >
              {noMessages[Math.min(noStep, noMessages.length - 1)]}
            </button>
          </div>

          {noStep >= 2 && (
            <p className="hint-pill">
              💡 Hint: The "Yes" button is waiting for you! ✨
            </p>
          )}
        </div>
      ) : (
        <div className="celebration-content">
          <div className="celebration-badge">💍 FOREVER & ALWAYS 💍</div>
          <div className="gif-sticker-box">
            <img
              src={cuteGifs[4]} // Peach & Goma happy kiss
              alt="Mochi love kiss"
              className="love-sticker-img"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="fallback-emoji-sticker" aria-hidden="true">
              😘💖
            </div>
          </div>

          <h2 className="celebration-headline">
            I knew it! You love me a lot! 😘💘
          </h2>

          <p className="celebration-text">
            Happy {days} Days Anniversary, <strong>Nya Nya</strong>!
            <br />
            You are my one and only, today and forever. 🥂✨
          </p>

          <div className="celebration-hearts-row" aria-hidden="true">
            <span>💖</span>
            <span>✨</span>
            <span>🌹</span>
            <span>💍</span>
            <span>🌹</span>
            <span>✨</span>
            <span>💖</span>
          </div>

          <button
            className="btn-replay-question"
            onClick={() => {
              setHasSaidYes(false);
              setNoStep(0);
              setNoPos(null);
            }}
          >
            Play Again 💕
          </button>
        </div>
      )}
    </div>
  );
}
