import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Wallet, 
  Receipt, 
  Utensils,
  Calendar,
  TrendingUp,
  Loader2,
  X
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useMembers } from "@/hooks/useMembers";
import { useDeposits } from "@/hooks/useDeposits";
import { useExpenses } from "@/hooks/useExpenses";
import { useMealHistory } from "@/hooks/useMealHistory";
import { format, subDays, eachDayOfInterval } from "date-fns";
import natureBg from "@/assets/nature-bg.jpg";

const MemberProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExiting, setIsExiting] = useState(false);
  
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: allDeposits, isLoading: depositsLoading } = useDeposits();
  const { data: allExpenses, isLoading: expensesLoading } = useExpenses();
  const { data: mealHistory } = useMealHistory(userId || "", 60);

  const member = members?.find(m => m.user_id === userId);
  
  // Filter deposits and expenses for this member
  const memberDeposits = allDeposits?.filter(d => d.user_id === userId) || [];
  const memberExpenses = allExpenses?.filter(e => e.paid_by === userId) || [];

  // Calculate meal grid data
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 59),
    end: today
  });

  const getMealStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const meal = mealHistory?.find(m => m.meal_date === dateStr);
    if (!meal) return { lunch: false, dinner: false };
    return { lunch: meal.lunch || false, dinner: meal.dinner || false };
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/dashboard", { state: { fromMemberProfile: true } });
    }, 600);
  };

  const isLoading = membersLoading || depositsLoading || expensesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Member not found</p>
          <button onClick={() => navigate("/dashboard")} className="text-primary hover:underline">
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen relative"
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: isExiting ? -90 : 0, opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ perspective: 1000 }}
        onClick={handleBack}
      >
        {/* Background */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${natureBg})` }}
        />
        <div className="fixed inset-0 bg-tropical-overlay" />

        {/* Content */}
        <div 
          className="relative z-10 min-h-screen p-4 pb-24"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back Button */}
          <motion.button
            onClick={handleBack}
            className="absolute top-4 right-4 p-3 rounded-full glass-card hover:bg-white/20 transition-colors z-20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Profile Header */}
          <motion.div 
            className="text-center mb-6 pt-8"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative inline-block mb-4">
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <RoleBadge role={member.role} />
              </div>
            </div>
            <h1 className="text-2xl font-bold mt-2">{member.full_name}</h1>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            {member.phone && (
              <p className="text-sm text-muted-foreground">{member.phone}</p>
            )}
          </motion.div>

          {/* Financial Summary */}
          <motion.div 
            className="grid grid-cols-3 gap-3 mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-4 text-center">
              <Wallet className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-lg font-bold text-success">৳{member.totalDeposit.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Deposits</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Receipt className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-lg font-bold text-destructive">৳{member.totalExpense.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-lg font-bold text-primary">
                ৳{(member.totalDeposit - member.totalExpense).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Balance</p>
            </GlassCard>
          </motion.div>

          {/* Deposit History */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-success" />
                <h2 className="font-semibold">Deposit History</h2>
                <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full ml-auto">
                  {memberDeposits.length} entries
                </span>
              </div>
              
              {memberDeposits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No deposits yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {memberDeposits.slice(0, 10).map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-sm font-medium text-success">+৳{Number(deposit.amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(deposit.deposit_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {deposit.notes && (
                        <p className="text-xs text-muted-foreground max-w-[120px] truncate">{deposit.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Expense History */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-5 h-5 text-destructive" />
                <h2 className="font-semibold">Expense History</h2>
                <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full ml-auto">
                  {memberExpenses.length} entries
                </span>
              </div>
              
              {memberExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses paid by this member</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {memberExpenses.slice(0, 10).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-sm font-medium">{expense.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(expense.expense_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-destructive">-৳{Number(expense.amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Meal History Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-5 h-5 text-secondary" />
                <h2 className="font-semibold">Meal History (60 Days)</h2>
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full ml-auto">
                  {member.mealCount} meals
                </span>
              </div>
              
              <div className="grid grid-cols-10 gap-1">
                {days.map((day, index) => {
                  const status = getMealStatus(day);
                  const hasAnyMeal = status.lunch || status.dinner;
                  const hasBothMeals = status.lunch && status.dinner;
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-sm flex items-center justify-center text-[8px] ${
                        hasBothMeals
                          ? "bg-success/60"
                          : hasAnyMeal
                          ? "bg-warning/60"
                          : "bg-white/10"
                      }`}
                      title={`${format(day, "MMM dd")} - L: ${status.lunch ? "✓" : "✗"} D: ${status.dinner ? "✓" : "✗"}`}
                    >
                      {format(day, "d")}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-success/60" />
                  <span>Both</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-warning/60" />
                  <span>One</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-white/10" />
                  <span>None</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Tap anywhere hint */}
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Tap anywhere to return
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MemberProfile;
