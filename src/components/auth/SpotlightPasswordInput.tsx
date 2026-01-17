import { useState, useRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotlightPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SpotlightPasswordInput = ({
  value,
  onChange,
  placeholder = "Enter your password",
  className,
}: SpotlightPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTogglePassword = () => {
    setShowSpotlight(true);
    setShowPassword(!showPassword);
    
    // Reset spotlight after animation
    setTimeout(() => {
      setShowSpotlight(false);
    }, 800);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Lock className="w-5 h-5" />
      </div>
      
      <input
        ref={inputRef}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input pl-12 pr-12"
      />
      
      <button
        type="button"
        onClick={handleTogglePassword}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground 
                   hover:text-foreground transition-colors z-10"
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
      
      {/* Spotlight beam effect */}
      <div
        className={cn(
          "spotlight-beam",
          showSpotlight && "active"
        )}
        style={{
          right: "28px",
          top: "50%",
          transform: "translateY(-50%) rotate(-15deg)",
        }}
      />
    </div>
  );
};
