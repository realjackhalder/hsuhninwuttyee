import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import type { RefObject } from "react";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const still = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Near = {
  dx: number;
  dy: number;
  distance: number;
  inside: boolean;
};

const AWAY: Near = { dx: 0, dy: 0, distance: Infinity, inside: false };

function scrollerOf(el: Element): HTMLElement | Document {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const o = getComputedStyle(n);
    if (/auto|scroll/.test(o.overflowY) || /auto|scroll/.test(o.overflowX)) return n;
  }
  return document;
}

function useProximity<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { radius }: { radius: number },
): Near {
  const [near, setNear] = useState<Near>(AWAY);
  const at = useRef<Near>(AWAY);
  const frame = useRef(0);
  const pt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const host = scrollerOf(el);

    const publish = () => {
      frame.current = 0;
      setNear(at.current);
    };
    const push = (v: Near) => {
      at.current = v;
      if (!frame.current) frame.current = requestAnimationFrame(publish);
    };

    const measure = () => {
      const p = pt.current;
      if (!p) return;
      const box = el.getBoundingClientRect();
      const k = box.width / (el.offsetWidth || box.width) || 1;
      const dx = (p.x - (box.left + box.width / 2)) / k;
      const dy = (p.y - (box.top + box.height / 2)) / k;
      const distance = Math.hypot(dx, dy);
      const inside = distance <= radius;
      if (!inside && !at.current.inside) return;
      push({ dx, dy, distance, inside });
    };

    const read = (e: Event) => {
      const p = e as PointerEvent;
      pt.current = { x: p.clientX, y: p.clientY };
      measure();
    };
    const gone = () => {
      pt.current = null;
      if (at.current.inside) push(AWAY);
    };

    host.addEventListener("pointermove", read, { passive: true });
    host.addEventListener("pointerdown", read, { passive: true });
    host.addEventListener("scroll", measure, { passive: true });
    host.addEventListener("pointerleave", gone);
    host.addEventListener("pointerup", gone);
    return () => {
      host.removeEventListener("pointermove", read);
      host.removeEventListener("pointerdown", read);
      host.removeEventListener("scroll", measure);
      host.removeEventListener("pointerleave", gone);
      host.removeEventListener("pointerup", gone);
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [ref, radius]);

  return near;
}

function useRoom(
  field: RefObject<HTMLElement | null>,
  moving: RefObject<HTMLElement | null>,
  inset = 12,
) {
  const [room, setRoom] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    const f = field.current;
    const m = moving.current;
    if (!f || !m) return;
    const read = () =>
      setRoom({
        x: Math.max(0, (f.clientWidth - m.offsetWidth) / 2 - inset),
        y: Math.max(0, (f.clientHeight - m.offsetHeight) / 2 - inset),
      });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(f);
    ro.observe(m);
    return () => ro.disconnect();
  }, [field, moving, inset]);
  return room;
}

const ESC_CORNER = 28;

export interface EscapeButtonProps {
  /** how hard it pushes away, 0..100 */
  skittishness?: number;
  /** dodges before it gives in */
  patience?: number;
  /** the detection field, px */
  radius?: number;
  /** the corner it is cut with */
  corner?: number;
  /** label shown while dodging */
  label?: string;
  /** label shown after it gives in */
  caughtLabel?: string;
  /** called when the button is finally clicked */
  onCaught?: () => void;
}

export function EscapeButton({
  skittishness = 55,
  patience = 4,
  radius = 120,
  corner = ESC_CORNER,
  label = "Try To Catch Me 💨",
  caughtLabel = "You Caught My Heart, Nya Nya! 💖",
  onCaught,
}: EscapeButtonProps) {
  const field = useRef<HTMLDivElement | null>(null);
  const btn = useRef<HTMLButtonElement | null>(null);

  const near = useProximity(field, { radius });
  const room = useRoom(field, btn);
  const reduced = still();

  const [dodges, setDodges] = useState(0);
  const [gave, setGave] = useState(false);
  const [manualDir, setManualDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const off = useRef(0);
  const armed = useRef(true);

  const caught = dodges >= patience;

  useEffect(() => () => window.clearTimeout(off.current), []);

  // Proximity dodge counting
  useEffect(() => {
    if (caught) return;
    if (near.distance < radius * 0.55) {
      if (armed.current) {
        armed.current = false;
        setDodges((d) => d + 1);
      }
    } else if (near.distance > radius) {
      armed.current = true;
    }
  }, [near.distance, radius, caught]);

  // Safe direction computation (without mutating refs during render)
  useEffect(() => {
    if (near.distance > 6 && near.distance < Infinity) {
      setManualDir({ x: -near.dx / near.distance, y: -near.dy / near.distance });
    }
  }, [near.distance, near.dx, near.dy]);

  const flee = caught || !near.inside || reduced ? 0 : (1 - near.distance / radius) ** 2;
  const reach = 14 + (skittishness / 100) * 106;

  // When dodging via direct tap on touchscreens, ensure displacement is visible
  const baseOffset = !caught && dodges > 0 && !near.inside ? 0.75 : 1;
  const ox = clamp(manualDir.x * (flee > 0 ? flee : baseOffset * (dodges > 0 && !caught ? 0.7 : 0)) * reach, -room.x, room.x);
  const oy = clamp(manualDir.y * (flee > 0 ? flee : baseOffset * (dodges > 0 && !caught ? 0.7 : 0)) * reach, -room.y, room.y);

  // Victory celebration when caught
  const take = useCallback(() => {
    try { navigator.vibrate?.([40, 30, 80]); } catch {}
    setGave(true);
    onCaught?.();
    window.clearTimeout(off.current);
    off.current = window.setTimeout(() => {
      setGave(false);
      setDodges(0);
      armed.current = true;
    }, 1500);
  }, [onCaught]);

  // Finger tap handling — lovely haptic, works perfectly with hand on phone & iPad
  const handleButtonInteraction = (e: React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (!caught) {
      e.preventDefault();
      e.stopPropagation();
      try { navigator.vibrate?.(18); } catch {}
      setDodges((d) => Math.min(patience, d + 1));
      // Pick a lovely evasion angle
      const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75, Math.PI * 0.0, Math.PI];
      const angle = angles[Math.floor(Math.random() * angles.length)] + (Math.random() - 0.5) * 0.4;
      setManualDir({ x: Math.cos(angle), y: Math.sin(angle) });
      return;
    }

    take();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div
        className="ply ply-field esc"
        ref={field}
        data-flat={reduced || undefined}
        style={{
          "--esc-r": `${clamp(corner, 0, ESC_CORNER)}px`,
          touchAction: "none",
        } as React.CSSProperties}
      >
        <button
          ref={btn}
          type="button"
          className="esc-btn"
          data-caught={caught || gave}
          data-done={gave}
          data-fled={near.inside && !caught}
          style={{
            transform: `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`,
            touchAction: "manipulation",
          }}
          onClick={handleButtonInteraction}
          onTouchEnd={(e) => {
            // Lovely finger handling — evades on touch, celebrates when caught
            handleButtonInteraction(e);
          }}
          onTouchStart={(e) => {
            if (!caught) e.preventDefault();
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "touch" && !caught) {
              handleButtonInteraction(e);
            }
          }}
        >
          {caught || gave ? caughtLabel : label}
        </button>
      </div>

      <div className="escape-status-badge" style={{ touchAction: "manipulation" }}>
        {!caught ? (
          <span>💨 Dodges: {dodges} / {patience} — Tap with your finger to catch my heart! 💘</span>
        ) : (
          <span style={{ color: "var(--accent)", fontWeight: "bold" }}>
            💖 You caught me! Tap once more to celebrate! 🎉💋
          </span>
        )}
      </div>
    </div>
  );
}
