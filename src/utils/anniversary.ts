import { useState, useEffect } from "react";

// Anniversary starting date: April 14, 2025
export const ANNIVERSARY_START_DATE = new Date(2025, 3, 14, 0, 0, 0); // Month is 0-indexed: 3 = April

/**
 * Calculates current day number of the relationship.
 * Day 1: April 14, 2025
 * Day 554: October 19, 2026
 * Day 555: October 20, 2026 (Today)
 * Day 556: October 21, 2026 (Tomorrow)
 *
 * Automatically increments every day at midnight!
 */
export function getAnniversaryDays(now = new Date()): number {
  const startMidnight = new Date(
    ANNIVERSARY_START_DATE.getFullYear(),
    ANNIVERSARY_START_DATE.getMonth(),
    ANNIVERSARY_START_DATE.getDate()
  );
  const currentMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const diffTime = currentMidnight.getTime() - startMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export interface AnniversaryTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculates live time elapsed:
 * - days: current day number (Day 1 on Apr 14, 2025; Day 555 on Oct 20, 2026, counting on every day)
 * - hours, minutes, seconds: current time elapsed today since midnight
 */
export function getAnniversaryTime(now = new Date()): AnniversaryTime {
  return {
    days: getAnniversaryDays(now),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
}

/**
 * React hook that returns live anniversary time updated every second.
 */
export function useAnniversaryTime(): AnniversaryTime {
  const [time, setTime] = useState<AnniversaryTime>(() => getAnniversaryTime());

  useEffect(() => {
    const update = () => setTime(getAnniversaryTime());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}
