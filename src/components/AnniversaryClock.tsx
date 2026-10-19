import { useAnniversaryTime, type AnniversaryTime } from "../utils/anniversary";

interface AnniversaryClockProps {
  timeElapsed?: AnniversaryTime;
}

export function AnniversaryClock({ timeElapsed: propTime }: AnniversaryClockProps) {
  const liveTime = useAnniversaryTime();
  const timeElapsed = propTime ?? liveTime;

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
        <span>✨ {timeElapsed.days} days of holding your hand, and forever to go ✨</span>
      </div>
    </div>
  );
}
