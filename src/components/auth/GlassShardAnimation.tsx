import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GlassShardAnimationProps {
  onComplete?: () => void;
  children: React.ReactNode;
}

export const GlassShardAnimation = ({ onComplete, children }: GlassShardAnimationProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start showing content after shards assemble
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => {
        setShowContent(true);
        onComplete?.();
      }, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const shards = [
    { x: -200, y: -150, rotate: 45, delay: 0 },
    { x: 200, y: -100, rotate: -30, delay: 100 },
    { x: -150, y: 150, rotate: 60, delay: 200 },
    { x: 180, y: 180, rotate: -45, delay: 300 },
    { x: -250, y: 50, rotate: 20, delay: 150 },
    { x: 220, y: -50, rotate: -60, delay: 250 },
    { x: 0, y: -200, rotate: 15, delay: 50 },
    { x: 0, y: 200, rotate: -15, delay: 350 },
  ];

  return (
    <div className="relative">
      {/* Glass shards */}
      {!animationComplete && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {shards.map((shard, i) => (
            <div
              key={i}
              className="glass-shard w-16 h-20"
              style={{
                left: "50%",
                top: "50%",
                "--shard-x": `${shard.x}px`,
                "--shard-y": `${shard.y}px`,
                "--shard-rotate": `${shard.rotate}deg`,
                animationDelay: `${shard.delay}ms`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div
        className={cn(
          "transition-all duration-500",
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {children}
      </div>
    </div>
  );
};
