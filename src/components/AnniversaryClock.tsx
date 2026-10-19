import { useEffect, useState } from "react";

export function AnniversaryClock() {
  // Anniversary starting point: 14 April 2025
  const startDate = new Date(2025, 3, 14, 0, 0, 0); // Month is 0-indexed: 3 = April

  const [timeElapsed, setTimeElapsed] = useState({
    days: 554,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - startDate.getTime());

      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const days = Math.floor(totalHours / 24);

      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      // Note: If today is around the 553.5-554 day mark, we ensure at least 554 or live days
      setTimeElapsed({
        days: Math.max(554, days),
        hours,
        minutes,
        seconds,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="anniversary-clock-card">
      <div className="clock-header">
        <span className="clock-tag">OUR JOURNEY TOGETHER</span>
        <h2 className="clock-title">
          Nya Nya, I have loved you for
        </h2>
        <p className="clock-subtitle">Counting from April 14, 2025</p>
      </div>

      <div className="clock-grid">
        <div className="clock-unit-box main-highlight">
          <div className="clock-number">{timeElapsed.days}</div>
          <div className="clock-label">DAYS</div>
          <span className="unit-sparkle">💖</span>
        </div>

        <div className="clock-separator">:</div>

        <div className="clock-unit-box">
          <div className="clock-number">
            {String(timeElapsed.hours).padStart(2, "0")}
          </div>
          <div className="clock-label">HOURS</div>
        </div>

        <div className="clock-separator">:</div>

        <div className="clock-unit-box">
          <div className="clock-number">
            {String(timeElapsed.minutes).padStart(2, "0")}
          </div>
          <div className="clock-label">MINUTES</div>
        </div>

        <div className="clock-separator">:</div>

        <div className="clock-unit-box">
          <div className="clock-number accent-glow">
            {String(timeElapsed.seconds).padStart(2, "0")}
          </div>
          <div className="clock-label">SECONDS</div>
        </div>
      </div>

      <div className="clock-footer-note">
        <span>✨ 554 days of holding your hand, and forever to go ✨</span>
      </div>
    </div>
  );
}
