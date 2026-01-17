import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo.png";

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
        {/* Background glow - teal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase >= 1 ? 0.4 : 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, hsla(168, 76%, 36%, 0.25) 0%, transparent 60%)",
          }}
        />

        {/* Secondary gold glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase >= 3 ? 0.3 : 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 60% 40%, hsla(38, 92%, 50%, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
          {/* Outer teal neon ring */}
          <motion.div
            className="absolute w-full h-full rounded-full"
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={{
              opacity: animationPhase >= 1 ? 0.6 : 0,
              scale: animationPhase >= 1 ? 1 : 0.3,
              rotate: animationPhase >= 1 ? 0 : -180,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              border: "2px solid hsla(168, 76%, 50%, 0.4)",
              boxShadow: "0 0 40px hsla(168, 76%, 50%, 0.3), inset 0 0 40px hsla(168, 76%, 50%, 0.1)",
            }}
          />

          {/* Inner glow circle */}
          <motion.div
            className="absolute w-3/4 h-3/4 rounded-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: animationPhase >= 2 ? 0.4 : 0,
              scale: animationPhase >= 2 ? 1 : 0.5,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: "radial-gradient(circle, hsla(168, 76%, 50%, 0.15) 0%, transparent 70%)",
            }}
          />

          {/* Logo Image - Main element */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{
              opacity: animationPhase >= 2 ? 1 : 0,
              scale: animationPhase >= 2 ? 1 : 0.3,
              y: animationPhase >= 2 ? 0 : 50,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.img
              src={logoImage}
              alt="MessWallet Logo"
              className="w-40 h-40 md:w-52 md:h-52 object-contain"
              style={{
                filter: animationPhase >= 3 
                  ? "drop-shadow(0 0 20px hsla(168, 76%, 50%, 0.6)) drop-shadow(0 0 40px hsla(168, 76%, 50%, 0.3))"
                  : "drop-shadow(0 0 10px hsla(168, 76%, 50%, 0.3))",
              }}
              animate={{
                filter: animationPhase >= 4 
                  ? [
                      "drop-shadow(0 0 20px hsla(168, 76%, 50%, 0.6)) drop-shadow(0 0 40px hsla(168, 76%, 50%, 0.3))",
                      "drop-shadow(0 0 30px hsla(168, 76%, 50%, 0.8)) drop-shadow(0 0 60px hsla(168, 76%, 50%, 0.5))",
                      "drop-shadow(0 0 20px hsla(168, 76%, 50%, 0.6)) drop-shadow(0 0 40px hsla(168, 76%, 50%, 0.3))",
                    ]
                  : undefined,
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Energy trails - diagonal lines */}
          {animationPhase >= 1 && (
            <>
              {/* Top-left trail */}
              <motion.div
                className="absolute w-32 h-0.5"
                initial={{ opacity: 0, x: -100, y: -100, rotate: 45 }}
                animate={{ opacity: [0, 0.8, 0], x: 0, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  background: "linear-gradient(90deg, transparent, hsla(168, 76%, 50%, 0.8), transparent)",
                  top: "30%",
                  left: "10%",
                }}
              />
              {/* Bottom-right trail */}
              <motion.div
                className="absolute w-32 h-0.5"
                initial={{ opacity: 0, x: 100, y: 100, rotate: 45 }}
                animate={{ opacity: [0, 0.8, 0], x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{
                  background: "linear-gradient(90deg, transparent, hsla(38, 92%, 60%, 0.8), transparent)",
                  bottom: "30%",
                  right: "10%",
                }}
              />
              {/* Top-right golden trail */}
              <motion.div
                className="absolute w-24 h-0.5"
                initial={{ opacity: 0, x: 100, y: -100, rotate: -45 }}
                animate={{ opacity: [0, 0.8, 0], x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                style={{
                  background: "linear-gradient(90deg, transparent, hsla(38, 92%, 50%, 0.8), transparent)",
                  top: "25%",
                  right: "15%",
                }}
              />
            </>
          )}

          {/* Particle effects */}
          {animationPhase >= 2 && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  initial={{
                    x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 150,
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
                    duration: 1.2,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    background: i % 3 === 0 
                      ? "hsl(168, 76%, 50%)" 
                      : i % 3 === 1 
                        ? "hsl(38, 92%, 60%)" 
                        : "hsl(25, 95%, 53%)",
                    boxShadow: `0 0 12px ${
                      i % 3 === 0 
                        ? "hsl(168, 76%, 50%)" 
                        : i % 3 === 1 
                          ? "hsl(38, 92%, 60%)" 
                          : "hsl(25, 95%, 53%)"
                    }`,
                  }}
                />
              ))}
            </>
          )}

          {/* Floating sparkles around logo */}
          {animationPhase >= 3 && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-2 h-2"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    top: `${30 + Math.random() * 40}%`,
                    left: `${20 + i * 12}%`,
                    background: "radial-gradient(circle, hsla(38, 92%, 70%, 1) 0%, transparent 70%)",
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
              opacity: animationPhase >= 4 ? [0, 0.6, 0] : 0,
              scale: animationPhase >= 4 ? [0.8, 1.8, 2.5] : 0.5,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              background: "radial-gradient(circle, hsla(168, 76%, 50%, 0.5) 0%, hsla(38, 92%, 50%, 0.2) 40%, transparent 70%)",
            }}
          />
        </div>

        {/* App name */}
        <motion.div
          className="absolute bottom-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: animationPhase >= 4 ? 1 : 0,
            y: animationPhase >= 4 ? 0 : 30,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1
            className="text-3xl md:text-4xl font-bold tracking-wide"
            style={{
              background: "linear-gradient(135deg, hsl(168, 76%, 50%) 0%, hsl(168, 76%, 40%) 50%, hsl(38, 92%, 60%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px hsla(168, 76%, 50%, 0.6)",
            }}
          >
            MessWallet
          </h1>
          <motion.p 
            className="text-muted-foreground mt-2 text-sm tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationPhase >= 4 ? 0.7 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Smart Mess Management
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
