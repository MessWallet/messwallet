import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { MemberCarousel } from "@/components/dashboard/MemberCarousel";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useMembers } from "@/hooks/useMembers";
import { useExpenses, useCreateExpense } from "@/hooks/useExpenses";
import { useCreateDeposit } from "@/hooks/useDeposits";
import { useTodayMealsSummary } from "@/hooks/useMeals";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Utensils,
  Receipt,
  AlertTriangle,
  Loader2,
  Plus,
  PiggyBank
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: expenses, isLoading: expensesLoading } = useExpenses(5);
  const { data: mealsData } = useTodayMealsSummary();
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense();
  const createDeposit = useCreateDeposit();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    item_name: "",
    amount: "",
    paid_by: "",
    category_id: "",
  });

  const [depositForm, setDepositForm] = useState({
    user_id: "",
    amount: "",
    notes: "",
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.item_name || !expenseForm.amount || !expenseForm.paid_by) {
      toast.error("Please fill required fields");
      return;
    }
    await createExpense.mutateAsync({
      item_name: expenseForm.item_name,
      amount: parseFloat(expenseForm.amount),
      paid_by: expenseForm.paid_by,
      category_id: expenseForm.category_id || undefined,
    });
    setExpenseForm({ item_name: "", amount: "", paid_by: "", category_id: "" });
    setIsExpenseDialogOpen(false);
  };

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositForm.user_id || !depositForm.amount) {
      toast.error("Please fill required fields");
      return;
    }
    await createDeposit.mutateAsync({
      user_id: depositForm.user_id,
      amount: parseFloat(depositForm.amount),
      notes: depositForm.notes || undefined,
    });
    setDepositForm({ user_id: "", amount: "", notes: "" });
    setIsDepositDialogOpen(false);
  };

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
    user_id: m.user_id,
    name: m.full_name,
    role: m.role === "secondary_admin" || m.role === "tertiary_admin" ? "admin" as const : m.role as "founder" | "member",
    avatar: m.avatar_url,
    totalDeposit: m.totalDeposit,
    totalExpense: m.totalExpense,
  })) || [];

  return (
    <DashboardLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10">
              <DialogHeader>
                <DialogTitle>Quick Add Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={expenseForm.item_name}
                    onChange={(e) => setExpenseForm({ ...expenseForm, item_name: e.target.value })}
                    placeholder="e.g., Rice"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label>Amount (৳) *</Label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label>Paid By *</Label>
                  <Select 
                    value={expenseForm.paid_by} 
                    onValueChange={(v) => setExpenseForm({ ...expenseForm, paid_by: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members?.map((m) => (
                        <SelectItem key={m.user_id} value={m.user_id}>
                          <div className="flex items-center gap-2">
                            <img src={m.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                            {m.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={expenseForm.category_id} 
                    onValueChange={(v) => setExpenseForm({ ...expenseForm, category_id: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name_bn || c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createExpense.isPending}>
                  {createExpense.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {isAdmin && (
            <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-success/30 text-success hover:bg-success/10">
                  <PiggyBank className="w-4 h-4" />
                  Add Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Add Deposit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddDeposit} className="space-y-4">
                  <div>
                    <Label>Member *</Label>
                    <Select 
                      value={depositForm.user_id} 
                      onValueChange={(v) => setDepositForm({ ...depositForm, user_id: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            <div className="flex items-center gap-2">
                              <img src={m.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                              {m.full_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount (৳) *</Label>
                    <Input
                      type="number"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      placeholder="0"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={depositForm.notes}
                      onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                      placeholder="Optional"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createDeposit.isPending}>
                    {createDeposit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Deposit"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

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
