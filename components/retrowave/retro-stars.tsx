"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RetroStarsProps = {
  className?: string;
  densityCount?: number; // number of stars
  movementRange?: number; // pixels of movement range
};

type Star = {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
  glowDelay: number;
  movementDelay: number;
};

export default function RetroStars({
  className = "",
  densityCount = 128,
  movementRange = 20,
}: RetroStarsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [isClient, setIsClient] = useState(false);

  const generateStars = useCallback((): Star[] => {
    const generatedStars: Star[] = [];

    for (let i = 0; i < densityCount; i++) {
      const size = Math.random() * (2 - 1) + 1; // 1-2 pixels
      const opacity = Math.random() * (0.8 - 0.2) + 0.2;

      generatedStars.push({
        id: `star-${i}`,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size,
        opacity,
        animationDelay: Math.random() * 2, // seconds
        glowDelay: Math.random() * 3, // seconds
        movementDelay: Math.random() * 4, // seconds
      });
    }

    return generatedStars;
  }, [densityCount]);

  // Only generate stars on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setStars(generateStars());
  }, [generateStars]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      ref={containerRef}
    >
      {isClient &&
        stars.map((star) => (
          <div
            className="retro-star pointer-events-none absolute"
            key={star.id}
            style={
              {
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: "white",
                opacity: star.opacity,
                animation: `
                retro-star-glow 3s ease-in-out infinite ${star.glowDelay}s,
                retro-star-move 6s ease-in-out infinite ${star.movementDelay}s
              `,
                transform: "translate(-50%, -50%)",
              } as React.CSSProperties
            }
          />
        ))}

      <style jsx>{`
        @keyframes retro-star-glow {
          0%,
          100% {
            opacity: ${0.8 * 0.3};
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes retro-star-move {
          0%,
          100% {
            transform: translate(-50%, -50%) translate(0, 0);
          }
          25% {
            transform: translate(-50%, -50%)
              translate(${movementRange * 0.5}px, -${movementRange * 0.3}px);
          }
          50% {
            transform: translate(-50%, -50%)
              translate(${movementRange}px, ${movementRange * 0.2}px);
          }
          75% {
            transform: translate(-50%, -50%)
              translate(${movementRange * 0.3}px, ${movementRange * 0.8}px);
          }
        }
      `}</style>
    </div>
  );
}
