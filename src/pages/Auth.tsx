import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, ArrowRight, Utensils, Wallet, Camera, X, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightPasswordInput } from "@/components/auth/SpotlightPasswordInput";
import { GlassShardAnimation } from "@/components/auth/GlassShardAnimation";
import natureBg from "@/assets/nature-bg.jpg";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

type AuthMode = "login" | "signup";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    rememberMe: false,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      if (mode === "login") {
        loginSchema.parse({ email: formData.email, password: formData.password });
      } else {
        signupSchema.parse(formData);
        if (!avatar) {
          newErrors.avatar = "Profile photo is required";
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        if (!avatar) {
          toast.error("Profile photo is required");
          return;
        }
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          avatar,
          formData.phone || undefined
        );
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("An account with this email already exists");
          } else {
            toast.error(error.message);
          }
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <div className="flex items-center justify-center gap-2 mb-6">
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
          <p className="text-muted-foreground text-center mb-6">
            {mode === "login" 
              ? "Sign in to manage your mess finances" 
              : "Join MessWallet to track your expenses"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar upload (signup only) */}
            {mode === "signup" && (
              <div className="flex flex-col items-center gap-3 animate-fade-in-up">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/30"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1",
                        "hover:border-primary hover:bg-primary/5 transition-colors",
                        errors.avatar ? "border-destructive" : "border-white/20"
                      )}
                    >
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {errors.avatar && (
                  <p className="text-xs text-destructive">{errors.avatar}</p>
                )}
                <p className="text-xs text-muted-foreground">Profile photo is required *</p>
              </div>
            )}

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
                  className={cn("glass-input pl-12", errors.name && "border-destructive")}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Email field */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Email address"
                className={cn("glass-input pl-12", errors.email && "border-destructive")}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Phone field (signup only) */}
            {mode === "signup" && (
              <div className="relative animate-fade-in-up delay-200">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Phone number (optional)"
                  className="glass-input pl-12"
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
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
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
              disabled={isSubmitting}
              className="glass-button w-full flex items-center justify-center gap-2 
                       animate-fade-in-up delay-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center mt-6 text-muted-foreground animate-fade-in-up delay-500">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setErrors({});
                setAvatar(null);
                setAvatarPreview(null);
              }}
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
