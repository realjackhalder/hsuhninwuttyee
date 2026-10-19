import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  shape: "circle" | "heart" | "star";
  rotation: number;
  vr: number;
}

export function triggerConfetti() {
  const event = new CustomEvent("trigger-love-confetti");
  window.dispatchEvent(event);
}

export function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const colors = [
      "#ff0a54",
      "#ff477e",
      "#ff7096",
      "#ff85a1",
      "#fbb1bd",
      "#ffd166",
      "#06d6a0",
      "#118ab2",
      "#7209b7",
      "#f72585",
    ];

    const spawnBurst = (originX: number, originY: number, count = 80) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 10;
        particles.push({
          x: originX,
          y: originY,
          size: 6 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          alpha: 1,
          decay: 0.008 + Math.random() * 0.012,
          shape: Math.random() > 0.4 ? "heart" : Math.random() > 0.5 ? "circle" : "star",
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    const handleTrigger = () => {
      // Multiple bursts across screen
      spawnBurst(width * 0.3, height * 0.4, 70);
      spawnBurst(width * 0.7, height * 0.4, 70);
      spawnBurst(width * 0.5, height * 0.3, 100);
      setTimeout(() => spawnBurst(width * 0.4, height * 0.5, 60), 300);
      setTimeout(() => spawnBurst(width * 0.6, height * 0.5, 60), 500);
    };

    window.addEventListener("trigger-love-confetti", handleTrigger);

    function drawHeart(c: CanvasRenderingContext2D, size: number) {
      c.beginPath();
      c.moveTo(0, size * 0.3);
      c.bezierCurveTo(-size / 2, -size / 2, -size, size * 0.3, 0, size);
      c.bezierCurveTo(size, size * 0.3, size / 2, -size / 2, 0, size * 0.3);
      c.fill();
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.vr;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "heart") {
          drawHeart(ctx, p.size);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("trigger-love-confetti", handleTrigger);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" />;
}
