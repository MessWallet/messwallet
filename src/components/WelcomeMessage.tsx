import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeMessage = () => {
  const { profile, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkAndShowWelcome = async () => {
      if (!user || !profile) return;

      // Check if welcome has been shown by fetching fresh data
      const { data, error } = await supabase
        .from("profiles")
        .select("welcome_shown")
        .eq("user_id", user.id)
        .single();

      if (error || !data) return;

      // If welcome not shown yet, show it
      if (!data.welcome_shown) {
        setShowWelcome(true);

        // Mark as shown in database
        await supabase
          .from("profiles")
          .update({ welcome_shown: true })
          .eq("user_id", user.id);

        // Auto-hide after 4 seconds
        setTimeout(() => {
          setShowWelcome(false);
        }, 4000);
      }
    };

    checkAndShowWelcome();
  }, [user, profile]);

  const handleDismiss = () => {
    setShowWelcome(false);
  };

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleDismiss}
        >
          <motion.div
            className="text-center px-8"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Welcome text */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome to MessWallet
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Thank you for joining our mess family
            </motion.p>

            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  delay: 0.8 + i * 0.1,
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
