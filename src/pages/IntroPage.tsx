import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import founderPhoto from "@/assets/founder-photo.jpg";

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
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
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

        {/* Content Sections - All visible by default */}
        <div className="px-4 pb-32 space-y-4 max-w-2xl mx-auto w-full">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">About MessWallet</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                MessWallet is a comprehensive student mess management application designed to simplify 
                the complex task of tracking shared expenses, meal schedules, and financial contributions 
                in a group living environment. Born from the real challenges faced by students, it 
                provides a transparent, fair, and efficient way to manage mess finances.
              </p>
            </GlassCard>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <PieChart className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Key Features</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    className="p-3 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color} mb-2`} />
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* About Founder Section - Always visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">About the Founder</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-4">
                  <img 
                    src={founderPhoto} 
                    alt="Mahfuz Ahmed Rony" 
                    className="w-full h-full rounded-2xl object-cover border-2 border-warning/30 shadow-lg"
                  />
                  <motion.div
                    className="absolute -inset-1 bg-warning/20 rounded-2xl blur-lg -z-10"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <h4 className="font-semibold text-lg">Mahfuz Ahmed Rony</h4>
                <p className="text-sm text-warning">Founder & Developer</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  A passionate developer who created MessWallet to solve the everyday challenges 
                  of managing shared living expenses. With a vision to make student life easier, 
                  this app was built with love and dedication to serve the mess community.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Why MessWallet Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Why MessWallet?</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
            </GlassCard>
          </motion.div>
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
