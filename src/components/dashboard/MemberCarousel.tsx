import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort to ensure founder is always first
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "founder") return -1;
    if (b.role === "founder") return 1;
    if (a.role === "admin") return -1;
    if (b.role === "admin") return 1;
    return 0;
  });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? sortedMembers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === sortedMembers.length - 1 ? 0 : prev + 1));
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);
    
    if (absDiff > 2) return { opacity: 0, scale: 0.8, x: diff * 100, zIndex: 0 };
    
    return {
      opacity: absDiff === 0 ? 1 : absDiff === 1 ? 0.7 : 0.4,
      scale: absDiff === 0 ? 1.1 : absDiff === 1 ? 0.9 : 0.75,
      x: diff * 140,
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
      <div 
        ref={containerRef}
        className="relative h-[280px] flex items-center justify-center overflow-hidden"
      >
        {sortedMembers.map((member, index) => {
          const style = getCardStyle(index);
          
          return (
            <div
              key={member.id}
              onClick={() => {
                setActiveIndex(index);
                onMemberClick?.(member);
              }}
              className={cn(
                "absolute cursor-pointer transition-all duration-500 ease-out",
                "member-card w-48",
                activeIndex === index && "active"
              )}
              style={{
                transform: `translateX(${style.x}px) scale(${style.scale})`,
                opacity: style.opacity,
                zIndex: style.zIndex,
              }}
            >
              {/* Avatar */}
              <div className="relative mx-auto w-28 h-28 mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-2xl object-cover border-2 border-white/20"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <RoleBadge role={member.role} />
                </div>
              </div>
              
              {/* Info */}
              <h4 className="font-semibold text-lg mb-1">{member.name}</h4>
              
              {activeIndex === index && (
                <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in-up">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="text-success">৳{member.totalDeposit}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Expense</span>
                    <span className="text-destructive">৳{member.totalExpense}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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
