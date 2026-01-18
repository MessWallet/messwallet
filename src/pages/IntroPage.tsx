import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Utensils, 
  Shield, 
  Users, 
  PieChart, 
  Bell,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import natureBg from "@/assets/nature-bg.jpg";
import logo from "@/assets/logo.png";

const features = [
  {
    icon: Wallet,
    title: "Smart Finance Tracking",
    description: "Track all deposits, expenses, and balances in real-time with automated calculations.",
    color: "text-primary"
  },
  {
    icon: Utensils,
    title: "Meal Management",
    description: "Mark daily meals, view history, and calculate per-head costs effortlessly.",
    color: "text-secondary"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multiple members with role-based access - Founder, Admins, and Members.",
    color: "text-success"
  },
  {
    icon: PieChart,
    title: "Budget Control",
    description: "Set monthly budgets, low balance alerts, and financial reports.",
    color: "text-warning"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security and real-time backups.",
    color: "text-destructive"
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Get notified about deposits, expenses, and important updates instantly.",
    color: "text-primary"
  }
];

const IntroPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>("about");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${natureBg})` }}
      />
      <div className="fixed inset-0 bg-tropical-overlay" />
      
      {/* Animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div 
            className="mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, delay: 0.2 }}
          >
            <div className="relative">
              <img src={logo} alt="MessWallet" className="w-24 h-24 object-contain" />
              <motion.div
                className="absolute -inset-4 bg-primary/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gradient-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            MessWallet
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-md mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            The ultimate student mess management system for hassle-free meal tracking and shared finances.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="mt-8"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-muted-foreground" />
          </motion.div>
        </motion.div>

        {/* Content Sections */}
        <div className="px-4 pb-32 space-y-4 max-w-2xl mx-auto w-full">
          {/* About Section */}
          <GlassCard 
            className="p-4 cursor-pointer transition-all hover:bg-white/10"
            onClick={() => toggleSection("about")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">About MessWallet</h3>
              </div>
              <motion.div
                animate={{ rotate: activeSection === "about" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {activeSection === "about" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                    MessWallet is a comprehensive student mess management application designed to simplify 
                    the complex task of tracking shared expenses, meal schedules, and financial contributions 
                    in a group living environment. Born from the real challenges faced by students, it 
                    provides a transparent, fair, and efficient way to manage mess finances.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Features Section */}
          <GlassCard 
            className="p-4 cursor-pointer transition-all hover:bg-white/10"
            onClick={() => toggleSection("features")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PieChart className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Key Features</h3>
              </div>
              <motion.div
                animate={{ rotate: activeSection === "features" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {activeSection === "features" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <motion.div 
                        key={feature.title}
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <feature.icon className={`w-5 h-5 ${feature.color} mb-2`} />
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* About Founder Section */}
          <GlassCard 
            className="p-4 cursor-pointer transition-all hover:bg-white/10"
            onClick={() => toggleSection("founder")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">About the Founder</h3>
              </div>
              <motion.div
                animate={{ rotate: activeSection === "founder" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {activeSection === "founder" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-3 border-2 border-white/20">
                      <span className="text-3xl font-bold text-gradient-primary">M</span>
                    </div>
                    <h4 className="font-semibold text-lg">Mahfuz Ahmed Rony</h4>
                    <p className="text-sm text-primary">Founder & Developer</p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      A passionate developer who created MessWallet to solve the everyday challenges 
                      of managing shared living expenses. With a vision to make student life easier, 
                      this app was built with love and dedication to serve the mess community.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Why MessWallet Section */}
          <GlassCard 
            className="p-4 cursor-pointer transition-all hover:bg-white/10"
            onClick={() => toggleSection("why")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Why MessWallet?</h3>
              </div>
              <motion.div
                animate={{ rotate: activeSection === "why" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {activeSection === "why" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>No more confusion about who paid what and when</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Automatic per-head cost calculation based on meal attendance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Real-time balance updates and low balance alerts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Complete transparency with detailed expense history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Role-based permissions for secure management</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Fixed Bottom Buttons */}
        <motion.div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <div className="max-w-md mx-auto flex gap-3">
            <Button 
              onClick={() => navigate("/auth?mode=signup")}
              className="flex-1 gap-2 h-12 text-base"
            >
              Register
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => navigate("/auth?mode=login")}
              variant="outline"
              className="flex-1 gap-2 h-12 text-base border-white/20 hover:bg-white/10"
            >
              Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroPage;
