import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { MemberCarousel } from "@/components/dashboard/MemberCarousel";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Utensils,
  Receipt,
  AlertTriangle
} from "lucide-react";

// Mock data
const mockMembers = [
  { id: "1", name: "Mahfuz Ahmed", role: "founder" as const, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mahfuz", totalDeposit: 15000, totalExpense: 8500 },
  { id: "2", name: "Rafi Islam", role: "admin" as const, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rafi", totalDeposit: 12000, totalExpense: 7200 },
  { id: "3", name: "Tanvir Hasan", role: "member" as const, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tanvir", totalDeposit: 10000, totalExpense: 6800 },
  { id: "4", name: "Sakib Ahmed", role: "member" as const, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sakib", totalDeposit: 11000, totalExpense: 7500 },
  { id: "5", name: "Nahid Rahman", role: "member" as const, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nahid", totalDeposit: 9500, totalExpense: 6200 },
];

const mockRecentExpenses = [
  { id: "1", item: "Rice (5kg)", amount: 450, paidBy: "Rafi Islam", category: "Groceries", time: "2 hours ago" },
  { id: "2", item: "Vegetables", amount: 280, paidBy: "Tanvir Hasan", category: "Groceries", time: "5 hours ago" },
  { id: "3", item: "Cooking Oil", amount: 320, paidBy: "Mahfuz Ahmed", category: "Groceries", time: "Yesterday" },
  { id: "4", item: "Electricity Bill", amount: 1500, paidBy: "Sakib Ahmed", category: "Bills", time: "2 days ago" },
];

const Dashboard = () => {
  const totalDeposit = mockMembers.reduce((acc, m) => acc + m.totalDeposit, 0);
  const totalExpense = mockMembers.reduce((acc, m) => acc + m.totalExpense, 0);
  const balance = totalDeposit - totalExpense;

  return (
    <DashboardLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
      <div className="space-y-6">
        {/* Balance and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balance Card */}
          <div className="lg:col-span-1">
            <BalanceCard 
              balance={balance}
              totalDeposit={totalDeposit}
              totalExpense={totalExpense}
            />
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Members"
              titleBn="সদস্য"
              value={mockMembers.length}
              icon={Users}
            />
            <StatCard
              title="Monthly Budget"
              titleBn="মাসিক বাজেট"
              value="৳50,000"
              icon={Calendar}
              variant="warning"
            />
            <StatCard
              title="Today's Expense"
              titleBn="আজকের খরচ"
              value="৳730"
              icon={Receipt}
              trend={{ value: 12, isPositive: false }}
              variant="danger"
            />
            <StatCard
              title="Per Head Cost"
              titleBn="মাথাপিছু খরচ"
              value="৳7,240"
              icon={TrendingUp}
              variant="success"
            />
          </div>
        </div>

        {/* Low Balance Alert */}
        {balance < 10000 && (
          <GlassCard className="p-4 border-warning/30 bg-warning/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-warning">Low Balance Alert</p>
                <p className="text-sm text-muted-foreground">
                  Current balance is below the minimum threshold. Please collect deposits.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Member Carousel */}
        <GlassCard className="py-6 overflow-hidden">
          <MemberCarousel 
            members={mockMembers}
            onMemberClick={(member) => console.log("Clicked:", member)}
          />
        </GlassCard>

        {/* Recent Activity and Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Expenses */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Expenses</h3>
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
            
            <div className="space-y-3">
              {mockRecentExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 
                           hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.item}</p>
                      <p className="text-xs text-muted-foreground">
                        by {expense.paidBy} • {expense.time}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-destructive">-৳{expense.amount}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Today's Meals */}
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
                <p className="text-2xl font-bold text-secondary">4</p>
                <p className="text-sm text-muted-foreground">Lunch</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <Utensils className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Dinner</p>
              </div>
            </div>

            <div className="space-y-2">
              {mockMembers.slice(0, 4).map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-lg"
                    />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded bg-success/20 text-success text-xs flex items-center justify-center">✓</span>
                    <span className="w-6 h-6 rounded bg-success/20 text-success text-xs flex items-center justify-center">✓</span>
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
