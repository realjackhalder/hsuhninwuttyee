import { useEffect, useState, useMemo } from "react";
import { getAnniversaryDays } from "../utils/anniversary";

interface TypewriterLetterProps {
  days?: number;
}

export function TypewriterLetter({ days: propDays }: TypewriterLetterProps) {
  const days = propDays ?? getAnniversaryDays();

  const loveLetterLines = useMemo(
    () => [
      "Dear Nya Nya,",
      "",
      "I still remember the day everything changed: April 14, 2025.",
      "That was the day you walked into my world and made it bloom.",
      "",
      `${days} days have passed since then,`,
      "and not a single second goes by where I take you for granted.",
      "",
      "I love the sound of your laugh.",
      "I love the way your eyes light up when you smile.",
      "I love how safe and complete you make me feel.",
      "",
      "No matter where life takes us,",
      "my heart will always find its home in yours.",
      "",
      "Happy Anniversary, my beautiful Nya Nya.",
      "I love you today, tomorrow, and for all of our days.",
      "",
      "— Yours always and forever ❤️",
    ],
    [days]
  );

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= loveLetterLines.length) {
      setIsFinished(true);
      return;
    }

    const currentFullLine = loveLetterLines[currentLineIndex] ?? "";

    // If it's an empty paragraph line, push it immediately and advance
    if (currentFullLine.length === 0) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = "";
          return next;
        });
        setCurrentLineIndex((idx) => idx + 1);
        setCurrentCharIndex(0);
      }, 150);
      return () => clearTimeout(timeout);
    }

    if (currentCharIndex < currentFullLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = currentFullLine.slice(0, currentCharIndex + 1);
          return next;
        });
        setCurrentCharIndex((c) => c + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      // Line is fully typed, pause before next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex((idx) => idx + 1);
        setCurrentCharIndex(0);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, loveLetterLines]);

  const restartTyping = () => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsFinished(false);
  };

  return (
    <div className="typewriter-container">
      <div className="typewriter-paper">
        <div className="paper-pin">🌹</div>
        <div className="paper-content">
          {displayedLines.map((rawLine, idx) => {
            const line = rawLine ?? "";
            const isSalutation = line.startsWith("Dear");
            const isSignature = line.startsWith("—");

            return (
              <p
                key={idx}
                className={`letter-line ${isSalutation ? "letter-salutation" : ""} ${
                  isSignature ? "letter-signature" : ""
                }`}
              >
                {line || "\u00A0"}
                {idx === currentLineIndex && !isFinished && (
                  <span className="typewriter-cursor">|</span>
                )}
              </p>
            );
          })}
          {displayedLines.length === 0 && (
            <p className="letter-line letter-salutation">
              <span className="typewriter-cursor">|</span>
            </p>
          )}
        </div>

        {isFinished && (
          <div className="letter-footer-action">
            <button className="btn-replay" onClick={restartTyping} title="Replay love letter animation">
              <span className="btn-replay-icon">💌</span>
              <span className="btn-replay-text">Replay Love Letter</span>
              <span className="btn-replay-sparkle">✨</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
