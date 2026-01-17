import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 300);
    const timer2 = setTimeout(() => setAnimationPhase(2), 800);
    const timer3 = setTimeout(() => setAnimationPhase(3), 1400);
    const timer4 = setTimeout(() => setAnimationPhase(4), 2000);
    const timer5 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Background glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase >= 1 ? 0.3 : 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-radial from-primary/30 via-transparent to-transparent"
          style={{
            background: "radial-gradient(circle at center, hsla(168, 76%, 36%, 0.2) 0%, transparent 60%)",
          }}
        />

        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* Wallet Base - Teal with neon glow */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: animationPhase >= 1 ? 1 : 0,
              scale: animationPhase >= 1 ? 1 : 0.5,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Wallet body */}
            <motion.path
              d="M15 25 L85 25 L85 80 L15 80 Z"
              fill="none"
              stroke="hsl(168, 76%, 36%)"
              strokeWidth="3"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: animationPhase >= 1 ? 1 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            {/* Wallet flap */}
            <motion.path
              d="M15 25 L15 35 Q50 50 85 35 L85 25"
              fill="none"
              stroke="hsl(168, 76%, 36%)"
              strokeWidth="3"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: animationPhase >= 1 ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
            />
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </motion.svg>

          {/* Spoon - flies from top-left */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            initial={{ x: -150, y: -150, opacity: 0, rotate: -45 }}
            animate={{
              x: animationPhase >= 2 ? 0 : -150,
              y: animationPhase >= 2 ? 0 : -150,
              opacity: animationPhase >= 2 ? 1 : 0,
              rotate: animationPhase >= 2 ? 0 : -45,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.ellipse
              cx="35"
              cy="45"
              rx="8"
              ry="12"
              fill="none"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth="2"
              filter="url(#goldGlow)"
            />
            <motion.line
              x1="35"
              y1="57"
              x2="35"
              y2="75"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth="2"
              filter="url(#goldGlow)"
            />
          </motion.svg>

          {/* Fork - glides from bottom-right */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            initial={{ x: 150, y: 150, opacity: 0, rotate: 45 }}
            animate={{
              x: animationPhase >= 2 ? 0 : 150,
              y: animationPhase >= 2 ? 0 : 150,
              opacity: animationPhase >= 2 ? 1 : 0,
              rotate: animationPhase >= 2 ? 0 : 45,
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            {/* Fork tines */}
            <motion.line x1="55" y1="35" x2="55" y2="50" stroke="hsl(38, 92%, 50%)" strokeWidth="2" filter="url(#goldGlow)" />
            <motion.line x1="60" y1="35" x2="60" y2="50" stroke="hsl(38, 92%, 50%)" strokeWidth="2" filter="url(#goldGlow)" />
            <motion.line x1="65" y1="35" x2="65" y2="50" stroke="hsl(38, 92%, 50%)" strokeWidth="2" filter="url(#goldGlow)" />
            {/* Fork handle */}
            <motion.path
              d="M55 50 Q60 55 65 50 L60 75"
              fill="none"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth="2"
              filter="url(#goldGlow)"
            />
          </motion.svg>

          {/* Coins - cascade from top-right */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: 150 + i * 10,
                y: -100 - i * 20,
                opacity: 0,
                rotate: 360,
              }}
              animate={{
                x: animationPhase >= 3 ? 65 + i * 5 : 150 + i * 10,
                y: animationPhase >= 3 ? 10 + i * 8 : -100 - i * 20,
                opacity: animationPhase >= 3 ? 1 : 0,
                rotate: animationPhase >= 3 ? 0 : 360,
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: "easeOut",
              }}
              style={{ top: "20%", right: "20%" }}
            >
              <div
                className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2"
                style={{
                  background: "linear-gradient(135deg, hsl(38, 92%, 60%) 0%, hsl(38, 92%, 40%) 100%)",
                  borderColor: "hsl(38, 92%, 70%)",
                  boxShadow: "0 0 15px hsla(38, 92%, 50%, 0.6)",
                }}
              />
            </motion.div>
          ))}

          {/* Particle trails */}
          {animationPhase >= 2 && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full"
                  initial={{
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    background: i % 2 === 0 ? "hsl(168, 76%, 50%)" : "hsl(38, 92%, 60%)",
                    boxShadow: `0 0 10px ${i % 2 === 0 ? "hsl(168, 76%, 50%)" : "hsl(38, 92%, 60%)"}`,
                  }}
                />
              ))}
            </>
          )}

          {/* Final glow burst */}
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: animationPhase >= 4 ? [0, 0.8, 0] : 0,
              scale: animationPhase >= 4 ? [0.5, 1.5, 2] : 0.5,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: "radial-gradient(circle, hsla(168, 76%, 50%, 0.4) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* App name */}
        <motion.div
          className="absolute bottom-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: animationPhase >= 4 ? 1 : 0,
            y: animationPhase >= 4 ? 0 : 20,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              background: "linear-gradient(135deg, hsl(168, 76%, 50%) 0%, hsl(38, 92%, 60%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px hsla(168, 76%, 50%, 0.5)",
            }}
          >
            MessWallet
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Smart Mess Management</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
