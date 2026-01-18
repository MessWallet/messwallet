import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  user_id?: string;
  name: string;
  role: "founder" | "admin" | "member";
  avatar: string;
  totalDeposit: number;
  totalExpense: number;
}

interface MemberCarouselProps {
  members: Member[];
  onMemberClick?: (member: Member) => void;
}

export const MemberCarousel = ({ members, onMemberClick }: MemberCarouselProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Members are already sorted by serial_position from useMembers hook
  // No need to re-sort - just use them as-is
  const sortedMembers = members;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? sortedMembers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === sortedMembers.length - 1 ? 0 : prev + 1));
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  const handleCardClick = async (member: Member, index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      return;
    }

    // Trigger rotation animation
    setRotatingIndex(index);
    
    // Wait for rotation to complete, then navigate
    setTimeout(() => {
      if (member.user_id) {
        navigate(`/member/${member.user_id}`);
      }
      onMemberClick?.(member);
    }, 600);
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    
    // Handle circular wrapping
    let normalizedDiff = diff;
    if (diff > sortedMembers.length / 2) {
      normalizedDiff = diff - sortedMembers.length;
    } else if (diff < -sortedMembers.length / 2) {
      normalizedDiff = diff + sortedMembers.length;
    }
    
    const absDiff = Math.abs(normalizedDiff);
    
    if (absDiff > 2) return { opacity: 0, scale: 0.8, x: normalizedDiff * 100, zIndex: 0 };
    
    return {
      opacity: absDiff === 0 ? 1 : absDiff === 1 ? 0.7 : 0.4,
      scale: absDiff === 0 ? 1.1 : absDiff === 1 ? 0.9 : 0.75,
      x: normalizedDiff * 140,
      zIndex: 10 - absDiff,
    };
  };

  return (
    <div className="relative py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-muted-foreground/30 uppercase tracking-widest">
          Our Team
        </h3>
      </div>

      {/* Carousel container */}
      <motion.div 
        ref={containerRef}
        className="relative h-[280px] flex items-center justify-center overflow-hidden touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="popLayout">
          {sortedMembers.map((member, index) => {
            const style = getCardStyle(index);
            const isRotating = rotatingIndex === index;
            
            return (
              <motion.div
                key={member.id}
                onClick={() => handleCardClick(member, index)}
                className={cn(
                  "absolute cursor-pointer",
                  "member-card w-48",
                  activeIndex === index && "active"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: style.x,
                  scale: style.scale,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                  rotateY: isRotating ? 360 : 0,
                }}
                transition={{
                  duration: isRotating ? 0.6 : 0.5,
                  ease: isRotating ? "easeInOut" : "easeOut",
                }}
                style={{ perspective: 1000 }}
                whileHover={activeIndex === index ? { scale: 1.15 } : {}}
                whileTap={activeIndex === index ? { scale: 1.05 } : {}}
              >
                {/* Avatar */}
                <div className="relative mx-auto w-28 h-28 mb-4">
                  <motion.img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                    style={{ backfaceVisibility: "hidden" }}
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <RoleBadge role={member.role} />
                  </div>
                  
                  {/* Glow effect for active card */}
                  {activeIndex === index && (
                    <motion.div
                      className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl -z-10"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {/* Info */}
                <h4 className="font-semibold text-lg mb-1 text-center">{member.name}</h4>
                
                {activeIndex === index && (
                  <motion.div 
                    className="mt-3 pt-3 border-t border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Deposit</span>
                      <span className="text-success">৳{member.totalDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Expense</span>
                      <span className="text-destructive">৳{member.totalExpense.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Tap to view profile
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full
                 glass-card hover:bg-white/10 transition-all z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full
                 glass-card hover:bg-white/10 transition-all z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {sortedMembers.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              activeIndex === index 
                ? "w-6 bg-primary" 
                : "bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
};
