import { useEffect, useRef } from "react";
import { getAnniversaryDays } from "../utils/anniversary";


interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

interface LeafHeart {
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  alpha: number;
  targetAlpha: number;
  scale: number;
}

export function LoveTreeCanvas({ days: propDays }: { days?: number } = {}) {
  const days = propDays ?? getAnniversaryDays();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = Math.min(650, window.innerHeight * 0.75));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.min(650, window.innerHeight * 0.75);
    };
    window.addEventListener("resize", handleResize);

    // Heart canopy generation based on parametric heart formula:
    // x = 16 * sin^3(t)
    // y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
    const leafHearts: LeafHeart[] = [];
    const colors = [
      "#ff4d6d",
      "#ff758f",
      "#ff8fa3",
      "#ffb3c1",
      "#c9184a",
      "#ff5c8a",
      "#ff85a1",
      "#f72585",
      "#b5179e",
      "#e0aaff",
    ];

    const heartCenterX = width * 0.5;
    const heartCenterY = height * 0.38;
    const heartScale = Math.min(width, height) * 0.024;

    const totalLeaves = Math.min(800, Math.max(350, days)); // Blossoming with every day together!
    for (let i = 0; i < totalLeaves; i++) {
      // Rejection sampling inside the heart
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()); // distribute evenly inside
      const hx = 16 * Math.pow(Math.sin(t), 3) * r;
      const hy =
        -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        ) * r;

      const px = heartCenterX + hx * heartScale + (Math.random() - 0.5) * 20;
      const py = heartCenterY + hy * heartScale + (Math.random() - 0.5) * 20;

      leafHearts.push({
        x: px,
        y: py,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (Math.random() - 0.5) * 0.8,
        alpha: 0,
        targetAlpha: 0.65 + Math.random() * 0.35,
        scale: 0.1,
      });
    }

    // Falling petals
    const petals: Petal[] = [];
    const maxPetals = 45;

    function addPetal() {
      if (petals.length < maxPetals) {
        petals.push({
          x: heartCenterX + (Math.random() - 0.5) * (heartScale * 35),
          y: heartCenterY - 50 + Math.random() * 80,
          size: 6 + Math.random() * 7,
          speedX: (Math.random() - 0.5) * 1.5 - 0.5,
          speedY: 0.8 + Math.random() * 1.6,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
          opacity: 0.7 + Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    // Helper: draw heart shape
    function drawHeart(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha: number,
      angle: number
    ) {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      // top left curve
      c.bezierCurveTo(
        -size / 2,
        -size / 2,
        -size,
        topCurveHeight / 3,
        0,
        size
      );
      // top right curve
      c.bezierCurveTo(
        size,
        topCurveHeight / 3,
        size / 2,
        -size / 2,
        0,
        topCurveHeight
      );
      c.closePath();
      c.fill();
      c.restore();
    }

    // Branch drawing with blooming progress
    let bloomProgress = 0;

    function renderTree() {
      if (!ctx) return;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Trunk
      ctx.strokeStyle = "#4a2828";
      ctx.lineWidth = Math.max(12, width * 0.022);
      ctx.beginPath();
      const trunkBaseX = heartCenterX;
      const trunkBaseY = height - 20;
      const trunkForkX = heartCenterX;
      const trunkForkY = height * 0.55;

      ctx.moveTo(trunkBaseX, trunkBaseY);
      ctx.quadraticCurveTo(
        trunkBaseX - 10,
        (trunkBaseY + trunkForkY) / 2,
        trunkForkX,
        trunkForkY
      );
      ctx.stroke();

      // Main branches
      const drawBranch = (
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        cpX: number,
        cpY: number,
        width: number
      ) => {
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      };

      ctx.strokeStyle = "#5a3232";
      // Left branch
      drawBranch(
        trunkForkX,
        trunkForkY,
        heartCenterX - heartScale * 11,
        heartCenterY + 30,
        heartCenterX - heartScale * 6,
        trunkForkY - 20,
        ctx.lineWidth * 0.65
      );

      // Right branch
      drawBranch(
        trunkForkX,
        trunkForkY,
        heartCenterX + heartScale * 11,
        heartCenterY + 25,
        heartCenterX + heartScale * 6,
        trunkForkY - 15,
        ctx.lineWidth * 0.65
      );

      // Center top branch
      drawBranch(
        trunkForkX,
        trunkForkY,
        heartCenterX,
        heartCenterY - 20,
        heartCenterX + 5,
        trunkForkY - 35,
        ctx.lineWidth * 0.55
      );

      // Secondary twigs
      drawBranch(
        heartCenterX - heartScale * 6,
        trunkForkY - 20,
        heartCenterX - heartScale * 14,
        heartCenterY - 10,
        heartCenterX - heartScale * 10,
        heartCenterY + 10,
        ctx.lineWidth * 0.4
      );

      drawBranch(
        heartCenterX + heartScale * 6,
        trunkForkY - 15,
        heartCenterX + heartScale * 14,
        heartCenterY - 15,
        heartCenterX + heartScale * 10,
        heartCenterY + 5,
        ctx.lineWidth * 0.4
      );

      // Ground mound
      ctx.fillStyle = "rgba(255, 117, 143, 0.22)";
      ctx.beginPath();
      ctx.ellipse(trunkBaseX, trunkBaseY + 5, 80, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Animation Loop
    let tick = 0;
    const animate = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Bloom progress over time
      if (bloomProgress < 1) {
        bloomProgress += 0.008;
      }

      // Draw Tree trunk & branches
      renderTree();

      // Draw leaf hearts on the tree
      const currentAllowedLeaves = Math.floor(leafHearts.length * bloomProgress);
      for (let i = 0; i < currentAllowedLeaves; i++) {
        const leaf = leafHearts[i];
        if (leaf.scale < 1) {
          leaf.scale = Math.min(1, leaf.scale + 0.04);
        }
        if (leaf.alpha < leaf.targetAlpha) {
          leaf.alpha = Math.min(leaf.targetAlpha, leaf.alpha + 0.03);
        }

        // Slight breathing/shimmering motion
        const sway = Math.sin(tick * 0.03 + i) * 0.05;
        drawHeart(
          ctx,
          leaf.x,
          leaf.y,
          leaf.size * leaf.scale,
          leaf.color,
          leaf.alpha,
          leaf.angle + sway
        );
      }

      // Spawn falling petals once bloomed a bit
      if (bloomProgress > 0.4 && tick % 5 === 0) {
        addPetal();
      }

      // Update & render falling petals
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.speedX + Math.sin(tick * 0.02 + p.y * 0.01) * 0.8;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);

        // Ground accumulation or fade out
        if (p.y > height - 15) {
          p.opacity -= 0.015;
          p.speedY = 0;
          p.speedX = 0;
          if (p.opacity <= 0) {
            petals.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [days]);

  return (
    <div className="love-tree-wrapper">
      <canvas ref={canvasRef} className="love-tree-canvas" />
      <div className="love-tree-badge">
        <span className="heart-pulse">💖</span> 550+ Blossoming Hearts for Nya Nya
      </div>
    </div>
  );
}
