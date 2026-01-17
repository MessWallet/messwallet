import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useExpenses, useCreateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useMembers } from "@/hooks/useMembers";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt, Plus, Search, Filter, Calendar, Loader2, AlertTriangle, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Expenses = () => {
  const { user, isAdmin } = useAuth();
  const { data: expenses, isLoading } = useExpenses();
  const { data: categories } = useCategories();
  const { data: members } = useMembers();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    item_name: "",
    amount: "",
    quantity: "",
    unit: "",
    category_id: "",
    paid_by: "",
    expense_type: "market",
    is_emergency: false,
    notes: "",
    from_all: false, // New: split among all members
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_name || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.from_all && !formData.paid_by) {
      toast.error("Please select who paid or enable 'From All'");
      return;
    }

    const totalAmount = parseFloat(formData.amount);

    if (formData.from_all && members && members.length > 0) {
      // Split expense among all members
      const perPersonAmount = Math.round((totalAmount / members.length) * 100) / 100;
      
      // Create individual expenses for each member
      const promises = members.map((member) =>
        createExpense.mutateAsync({
          item_name: `${formData.item_name} (Split)`,
          amount: perPersonAmount,
          quantity: formData.quantity ? parseFloat(formData.quantity) / members.length : undefined,
          unit: formData.unit || undefined,
          category_id: formData.category_id || undefined,
          paid_by: member.user_id,
          expense_type: formData.expense_type,
          is_emergency: formData.is_emergency,
          notes: `Split from ৳${totalAmount} among ${members.length} members. ${formData.notes || ""}`.trim(),
        })
      );

      await Promise.all(promises);
      toast.success(`Expense split among ${members.length} members (৳${perPersonAmount} each)`);
    } else {
      // Normal single expense
      await createExpense.mutateAsync({
        item_name: formData.item_name,
        amount: totalAmount,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        unit: formData.unit || undefined,
        category_id: formData.category_id || undefined,
        paid_by: formData.paid_by,
        expense_type: formData.expense_type,
        is_emergency: formData.is_emergency,
        notes: formData.notes || undefined,
      });
    }

    setFormData({
      item_name: "",
      amount: "",
      quantity: "",
      unit: "",
      category_id: "",
      paid_by: user?.id || "",
      expense_type: "market",
      is_emergency: false,
      notes: "",
      from_all: false,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteExpense.mutateAsync(id);
  };

  const filteredExpenses = expenses?.filter((expense) => {
    const matchesSearch = expense.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.paid_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const todayExpenses = expenses?.filter(e => e.expense_date === new Date().toISOString().split("T")[0])
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <DashboardLayout title="Expenses" titleBn="খরচ">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Receipt className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-destructive">৳{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Expenses</p>
                <p className="text-xl font-bold text-warning">৳{todayExpenses.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Header with actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name_bn || cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Item Name *</Label>
                    <Input
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                      placeholder="e.g., Rice (5kg)"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Amount (৳) *</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        className="bg-white/5 border-white/10"
                      />
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="kg"
                        className="bg-white/5 border-white/10 w-16"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name_bn || cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={formData.expense_type} 
                      onValueChange={(value) => setFormData({ ...formData, expense_type: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* From All Toggle */}
                  <div className="col-span-2 p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <Label className="text-base font-medium">From All Members</Label>
                          <p className="text-xs text-muted-foreground">
                            Split equally among all {members?.length || 0} members
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.from_all}
                        onCheckedChange={(checked) => setFormData({ ...formData, from_all: checked, paid_by: "" })}
                      />
                    </div>
                    {formData.from_all && formData.amount && members && members.length > 0 && (
                      <p className="mt-2 text-sm text-primary font-medium">
                        ৳{(parseFloat(formData.amount) / members.length).toFixed(2)} per person
                      </p>
                    )}
                  </div>

                  {/* Paid By - only show if not "From All" */}
                  {!formData.from_all && (
                    <div className="col-span-2">
                      <Label>Paid By *</Label>
                      <Select 
                        value={formData.paid_by} 
                        onValueChange={(value) => setFormData({ ...formData, paid_by: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members?.map((member) => (
                            <SelectItem key={member.user_id} value={member.user_id}>
                              <div className="flex items-center gap-2">
                                <img src={member.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                                {member.full_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_emergency}
                      onChange={(e) => setFormData({ ...formData, is_emergency: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <Label className="text-sm">Emergency</Label>
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes..."
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createExpense.isPending}>
                  {createExpense.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : formData.from_all ? (
                    `Split Among ${members?.length || 0} Members`
                  ) : (
                    "Add Expense"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Expenses list */}
        <GlassCard className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredExpenses?.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No expenses found</p>
              <p className="text-sm text-muted-foreground/70">Add your first expense to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses?.map((expense) => (
                <div
                  key={expense.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors",
                    expense.is_emergency && "border border-warning/30 bg-warning/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      expense.is_emergency ? "bg-warning/20" : "bg-primary/20"
                    )}>
                      {expense.is_emergency ? (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      ) : (
                        <Receipt className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{expense.item_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>by {expense.paid_by_name}</span>
                        {expense.added_by_name && expense.added_by !== expense.paid_by && (
                          <>
                            <span>•</span>
                            <span>added by {expense.added_by_name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(expense.expense_date), "MMM dd")}
                        </span>
                        {expense.category_name_bn && (
                          <>
                            <span>•</span>
                            <span>{expense.category_name_bn}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-destructive">-৳{Number(expense.amount).toLocaleString()}</p>
                      {expense.quantity && (
                        <p className="text-xs text-muted-foreground">
                          {expense.quantity} {expense.unit}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{expense.item_name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(expense.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
