import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useMembers } from "@/hooks/useMembers";
import { useBudgets, useCreateBudget, useUpdateBudget, useCurrentBudget } from "@/hooks/useBudgets";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import {
  Shield,
  Settings,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navigate } from "react-router-dom";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminPanel = () => {
  const { isAdmin, user } = useAuth();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: currentBudget } = useCurrentBudget();
  const { data: stats } = useFinanceStats();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [budgetForm, setBudgetForm] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    budget_amount: "",
    low_balance_threshold: "5000",
  });

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const admins = members?.filter(
    (m) => m.role === "founder" || m.role === "secondary_admin" || m.role === "tertiary_admin"
  );

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBudget.mutateAsync({
      month: parseInt(budgetForm.month),
      year: parseInt(budgetForm.year),
      budget_amount: parseFloat(budgetForm.budget_amount),
      low_balance_threshold: parseFloat(budgetForm.low_balance_threshold),
    });
    setIsBudgetDialogOpen(false);
    setBudgetForm({
      month: (new Date().getMonth() + 1).toString(),
      year: new Date().getFullYear().toString(),
      budget_amount: "",
      low_balance_threshold: "5000",
    });
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    await updateBudget.mutateAsync({
      id: editingBudget.id,
      budget_amount: parseFloat(editingBudget.budget_amount),
      low_balance_threshold: parseFloat(editingBudget.low_balance_threshold),
    });
    setIsEditDialogOpen(false);
    setEditingBudget(null);
  };

  const openEditDialog = (budget: any) => {
    setEditingBudget({
      ...budget,
      budget_amount: budget.budget_amount.toString(),
      low_balance_threshold: budget.low_balance_threshold.toString(),
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout title="Admin Panel" titleBn="অ্যাডমিন প্যানেল">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">৳{(stats?.balance || 0).toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Budget</p>
                <p className="text-2xl font-bold">৳{(currentBudget?.budget_amount || 0).toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Balance Alert</p>
                <p className="text-2xl font-bold">৳{(currentBudget?.low_balance_threshold || 5000).toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Admin List */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Admin Team</h3>
            </div>
          </div>

          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins?.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <img
                    src={admin.avatar_url}
                    alt={admin.full_name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{admin.full_name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                  <RoleBadge role={admin.role} size="sm" />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Budget Management */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Budget Management</h3>
            </div>

            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Create Monthly Budget</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateBudget} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Month *</Label>
                      <Select
                        value={budgetForm.month}
                        onValueChange={(v) => setBudgetForm({ ...budgetForm, month: v })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Year *</Label>
                      <Select
                        value={budgetForm.year}
                        onValueChange={(v) => setBudgetForm({ ...budgetForm, year: v })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026, 2027].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Budget Amount (৳) *</Label>
                    <Input
                      type="number"
                      value={budgetForm.budget_amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, budget_amount: e.target.value })}
                      placeholder="30000"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Low Balance Alert Threshold (৳)</Label>
                    <Input
                      type="number"
                      value={budgetForm.low_balance_threshold}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, low_balance_threshold: e.target.value })
                      }
                      placeholder="5000"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createBudget.isPending}>
                    {createBudget.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create Budget"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {budgetsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : budgets?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No budgets set yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets?.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {months[budget.month - 1]} {budget.year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alert at ৳{budget.low_balance_threshold.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg">৳{budget.budget_amount.toLocaleString()}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(budget)}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Edit Budget Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
            </DialogHeader>
            {editingBudget && (
              <form onSubmit={handleEditBudget} className="space-y-4">
                <div>
                  <Label>Month/Year</Label>
                  <p className="text-lg font-medium">
                    {months[editingBudget.month - 1]} {editingBudget.year}
                  </p>
                </div>
                <div>
                  <Label>Budget Amount (৳) *</Label>
                  <Input
                    type="number"
                    value={editingBudget.budget_amount}
                    onChange={(e) =>
                      setEditingBudget({ ...editingBudget, budget_amount: e.target.value })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label>Low Balance Alert Threshold (৳)</Label>
                  <Input
                    type="number"
                    value={editingBudget.low_balance_threshold}
                    onChange={(e) =>
                      setEditingBudget({ ...editingBudget, low_balance_threshold: e.target.value })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updateBudget.isPending}>
                  {updateBudget.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
