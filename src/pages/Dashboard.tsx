import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { MemberCarousel } from "@/components/dashboard/MemberCarousel";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useMembers } from "@/hooks/useMembers";
import { useExpenses } from "@/hooks/useExpenses";
import { useTodayMealsSummary } from "@/hooks/useMeals";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Utensils,
  Receipt,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: expenses, isLoading: expensesLoading } = useExpenses(5);
  const { data: mealsData } = useTodayMealsSummary();

  const isLoading = statsLoading || membersLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const carouselMembers = members?.map(m => ({
    id: m.id,
    name: m.full_name,
    role: m.role === "secondary_admin" || m.role === "tertiary_admin" ? "admin" as const : m.role as "founder" | "member",
    avatar: m.avatar_url,
    totalDeposit: m.totalDeposit,
    totalExpense: m.totalExpense,
  })) || [];

  return (
    <DashboardLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
      <div className="space-y-6">
        {/* Balance and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BalanceCard 
              balance={stats?.balance || 0}
              totalDeposit={stats?.totalDeposit || 0}
              totalExpense={stats?.totalExpense || 0}
            />
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Members" titleBn="সদস্য" value={stats?.memberCount || 0} icon={Users} />
            <StatCard title="Monthly Budget" titleBn="মাসিক বাজেট" value={`৳${(stats?.monthlyBudget || 0).toLocaleString()}`} icon={Calendar} variant="warning" />
            <StatCard title="Today's Expense" titleBn="আজকের খরচ" value={`৳${(stats?.todayExpense || 0).toLocaleString()}`} icon={Receipt} variant="danger" />
            <StatCard title="Per Head Cost" titleBn="মাথাপিছু খরচ" value={`৳${(stats?.perHeadCost || 0).toLocaleString()}`} icon={TrendingUp} variant="success" />
          </div>
        </div>

        {/* Low Balance Alert */}
        {stats && stats.balance < stats.lowBalanceThreshold && (
          <GlassCard className="p-4 border-warning/30 bg-warning/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-warning">Low Balance Alert</p>
                <p className="text-sm text-muted-foreground">
                  Current balance is below ৳{stats.lowBalanceThreshold.toLocaleString()}. Please collect deposits.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Member Carousel */}
        {carouselMembers.length > 0 && (
          <GlassCard className="py-6 overflow-hidden">
            <MemberCarousel members={carouselMembers} />
          </GlassCard>
        )}

        {/* Recent Activity and Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Expenses</h3>
            </div>
            
            {expensesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : expenses?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses yet</p>
            ) : (
              <div className="space-y-3">
                {expenses?.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          by {expense.paid_by_name} • {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-destructive">-৳{expense.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Today's Meals</h3>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-BD', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <Utensils className="w-6 h-6 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold text-secondary">{mealsData?.lunchCount || 0}</p>
                <p className="text-sm text-muted-foreground">Lunch</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <Utensils className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{mealsData?.dinnerCount || 0}</p>
                <p className="text-sm text-muted-foreground">Dinner</p>
              </div>
            </div>

            <div className="space-y-2">
              {mealsData?.summary.slice(0, 4).map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <img src={member.userAvatar} alt={member.userName} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-sm">{member.userName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`w-6 h-6 rounded text-xs flex items-center justify-center ${member.lunch ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {member.lunch ? '✓' : '✗'}
                    </span>
                    <span className={`w-6 h-6 rounded text-xs flex items-center justify-center ${member.dinner ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {member.dinner ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
