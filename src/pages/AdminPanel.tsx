import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useMembers } from "@/hooks/useMembers";
import { useBudgets, useCreateBudget, useUpdateBudget, useCurrentBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useUpdateUserRole, useClearAllData } from "@/hooks/useRoles";
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
  Trash2,
  UserCog,
  Crown,
  AlertCircle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

type AppRole = "founder" | "secondary_admin" | "tertiary_admin" | "member";

const AdminPanel = () => {
  const { isAdmin, isFounder, user } = useAuth();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: currentBudget } = useCurrentBudget();
  const { data: stats } = useFinanceStats();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const updateUserRole = useUpdateUserRole();
  const clearAllData = useClearAllData();

  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("member");
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

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget.mutateAsync(id);
  };

  const openEditDialog = (budget: any) => {
    setEditingBudget({
      ...budget,
      budget_amount: budget.budget_amount.toString(),
      low_balance_threshold: budget.low_balance_threshold.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openRoleDialog = (member: any) => {
    setEditingMember(member);
    setSelectedRole(member.role);
    setIsRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;
    await updateUserRole.mutateAsync({
      userId: editingMember.user_id,
      role: selectedRole,
    });
    setIsRoleDialogOpen(false);
    setEditingMember(null);
  };

  const handleClearAllData = async () => {
    await clearAllData.mutateAsync();
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

        {/* Founder Only: Clear All Data */}
        {isFounder && (
          <GlassCard className="p-6 border-destructive/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/20">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear all app data (expenses, deposits, meals, budgets). Users will remain.
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-destructive/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">⚠️ Clear All Application Data</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This will permanently delete:</p>
                      <ul className="list-disc list-inside text-sm">
                        <li>All expenses</li>
                        <li>All deposits</li>
                        <li>All meal records</li>
                        <li>All budgets</li>
                        <li>All shared bills</li>
                        <li>All notifications</li>
                        <li>All audit logs</li>
                      </ul>
                      <p className="font-medium text-destructive">Users and profiles will be preserved.</p>
                      <p className="font-bold">This action cannot be undone!</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={clearAllData.isPending}
                    >
                      {clearAllData.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Yes, Clear Everything"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </GlassCard>
        )}

        {/* Role Management (Founder Only) */}
        {isFounder && (
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCog className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Role Management</h3>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Founder Only</span>
            </div>

            {membersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.full_name}</span>
                          {member.role === "founder" && (
                            <Crown className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RoleBadge role={member.role} size="sm" />
                      {member.role !== "founder" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(member)}
                          className="gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Change Role
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the budget for {months[budget.month - 1]} {budget.year}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

        {/* Role Update Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <img
                    src={editingMember.avatar_url}
                    alt={editingMember.full_name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-medium">{editingMember.full_name}</p>
                    <p className="text-sm text-muted-foreground">{editingMember.email}</p>
                  </div>
                </div>
                <div>
                  <Label>Select Role</Label>
                  <Select value={selectedRole} onValueChange={(v: AppRole) => setSelectedRole(v)}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="tertiary_admin">Tertiary Admin</SelectItem>
                      <SelectItem value="secondary_admin">Secondary Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedRole === "secondary_admin" && "Full admin access with all permissions"}
                    {selectedRole === "tertiary_admin" && "Limited admin access with basic permissions"}
                    {selectedRole === "member" && "Regular member - can only add expenses and meals"}
                  </p>
                </div>
                <Button
                  onClick={handleUpdateRole}
                  className="w-full"
                  disabled={updateUserRole.isPending}
                >
                  {updateUserRole.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update Role"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
