import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, Lock, ArrowRight, Utensils, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightPasswordInput } from "@/components/auth/SpotlightPasswordInput";
import { GlassShardAnimation } from "@/components/auth/GlassShardAnimation";
import natureBg from "@/assets/nature-bg.jpg";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    rememberMe: false,
  });
  const [usePhone, setUsePhone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to dashboard
    navigate("/dashboard");
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${natureBg})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-tropical-overlay" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Login/Signup Card */}
      <GlassShardAnimation onComplete={() => setAnimationComplete(true)}>
        <GlassCard 
          variant="strong" 
          className={cn(
            "w-full max-w-md p-8 transition-all duration-500",
            animationComplete && "animate-float"
          )}
          style={{ animationDuration: "8s" } as React.CSSProperties}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="relative">
              <Wallet className="w-10 h-10 text-primary" />
              <Utensils className="w-5 h-5 text-secondary absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold text-gradient-primary">MessWallet</h1>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {mode === "login" 
              ? "Sign in to manage your mess finances" 
              : "Join MessWallet to track your expenses"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (signup only) */}
            {mode === "signup" && (
              <div className="relative animate-fade-in-up">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Full Name"
                  className="glass-input pl-12"
                  required
                />
              </div>
            )}

            {/* Email/Phone toggle */}
            {mode === "signup" && (
              <div className="flex gap-2 animate-fade-in-up delay-100">
                <button
                  type="button"
                  onClick={() => setUsePhone(false)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    !usePhone 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setUsePhone(true)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    usePhone 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  Phone
                </button>
              </div>
            )}

            {/* Email field */}
            {(!usePhone || mode === "login") && (
              <div className="relative animate-fade-in-up delay-200">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email address"
                  className="glass-input pl-12"
                  required
                />
              </div>
            )}

            {/* Phone field (signup only) */}
            {usePhone && mode === "signup" && (
              <div className="relative animate-fade-in-up delay-200">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Phone number"
                  className="glass-input pl-12"
                  required
                />
              </div>
            )}

            {/* Password field with spotlight effect */}
            <div className="animate-fade-in-up delay-300">
              <SpotlightPasswordInput
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                placeholder="Password"
              />
            </div>

            {/* Remember me & Forgot password */}
            {mode === "login" && (
              <div className="flex items-center justify-between text-sm animate-fade-in-up delay-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 
                             checked:bg-primary checked:border-primary"
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors
                           hover:underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="glass-button w-full flex items-center justify-center gap-2 
                       animate-fade-in-up delay-500"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center mt-6 text-muted-foreground animate-fade-in-up delay-500">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:text-primary/80 transition-colors font-medium
                       hover:underline underline-offset-4"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </GlassCard>
      </GlassShardAnimation>
    </div>
  );
};

export default Auth;
