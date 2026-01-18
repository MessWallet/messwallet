import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ChatButtonProps {
  onClick: () => void;
}

export const ChatButton = ({ onClick }: ChatButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/20"
        animate={{
          boxShadow: [
            "0 0 0 0 hsl(var(--primary) / 0.4)",
            "0 0 0 8px hsl(var(--primary) / 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <MessageCircle className="w-5 h-5 text-primary relative z-10" />
    </motion.button>
  );
};
