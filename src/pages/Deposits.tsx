import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useDeposits, useCreateDeposit, useDeleteDeposit, useCreateBulkDeposit } from "@/hooks/useDeposits";
import { useMembers } from "@/hooks/useMembers";
import { useAuth } from "@/contexts/AuthContext";
import { PiggyBank, Plus, Loader2, Calendar, Lock, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";

const DEPOSIT_PURPOSES = [
  { value: "food_expense", label: "Food Expense" },
  { value: "electricity_bill", label: "Electricity Bill" },
  { value: "mess_rent", label: "Mess Rent" },
  { value: "maid_salary", label: "Maid Monthly Salary" },
  { value: "wifi_bill", label: "WiFi Bill" },
  { value: "gas_bill", label: "Gas Bill" },
  { value: "water_bill", label: "Water Bill" },
  { value: "other", label: "Other (Custom)" },
];

const Deposits = () => {
  const { isAdmin } = useAuth();
  const { data: deposits, isLoading } = useDeposits();
  const { data: members } = useMembers();
  const createDeposit = useCreateDeposit();
  const createBulkDeposit = useCreateBulkDeposit();
  const deleteDeposit = useDeleteDeposit();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paidByAll, setPaidByAll] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    purpose: "",
    customPurpose: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount) {
      toast.error("Please enter an amount");
      return;
    }

    const purpose = formData.purpose === "other" ? formData.customPurpose : 
      DEPOSIT_PURPOSES.find(p => p.value === formData.purpose)?.label || formData.purpose;

    if (!purpose) {
      toast.error("Please select or enter a purpose");
      return;
    }

    const notes = `Purpose: ${purpose}${formData.notes ? ` | ${formData.notes}` : ""}`;

    if (paidByAll && members) {
      // Split amount equally among all members
      const perMemberAmount = parseFloat(formData.amount) / members.length;
      
      await createBulkDeposit.mutateAsync({
        amount: perMemberAmount,
        notes,
      });
    } else {
      if (!formData.user_id) {
        toast.error("Please select a member");
        return;
      }

      await createDeposit.mutateAsync({
        user_id: formData.user_id,
        amount: parseFloat(formData.amount),
        notes,
      });
    }

    setFormData({ user_id: "", amount: "", purpose: "", customPurpose: "", notes: "" });
    setPaidByAll(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDeposit.mutateAsync(id);
  };

  const totalDeposits = deposits?.reduce((sum, d) => sum + d.amount, 0) || 0;

  return (
    <DashboardLayout title="Deposits" titleBn="জমা">
      <div className="space-y-6">
        {/* Summary card */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-success/20">
                <PiggyBank className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground">Total Deposits</p>
                <p className="text-3xl font-bold text-success">৳{totalDeposits.toLocaleString()}</p>
              </div>
            </div>
            
            {isAdmin ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Deposit</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Paid by All Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Paid by All</p>
                          <p className="text-xs text-muted-foreground">Split equally among all members</p>
                        </div>
                      </div>
                      <Switch 
                        checked={paidByAll} 
                        onCheckedChange={setPaidByAll}
                      />
                    </div>

                    {!paidByAll && (
                      <div>
                        <Label>Member *</Label>
                        <Select 
                          value={formData.user_id} 
                          onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent>
                            {members?.map((member) => (
                              <SelectItem key={member.user_id} value={member.user_id}>
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={member.avatar_url} 
                                    alt="" 
                                    className="w-6 h-6 rounded-full"
                                  />
                                  {member.full_name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>Amount (৳) *</Label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10"
                      />
                      {paidByAll && members && formData.amount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ৳{(parseFloat(formData.amount) / members.length).toFixed(2)} per member ({members.length} members)
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Purpose *</Label>
                      <Select 
                        value={formData.purpose} 
                        onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPOSIT_PURPOSES.map((purpose) => (
                            <SelectItem key={purpose.value} value={purpose.value}>
                              {purpose.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.purpose === "other" && (
                      <div>
                        <Label>Custom Purpose *</Label>
                        <Input
                          value={formData.customPurpose}
                          onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                          placeholder="Enter purpose..."
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes..."
                        className="bg-white/5 border-white/10 resize-none"
                        rows={2}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createDeposit.isPending || createBulkDeposit.isPending}
                    >
                      {(createDeposit.isPending || createBulkDeposit.isPending) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : paidByAll ? (
                        `Add Deposit for All Members`
                      ) : (
                        "Add Deposit"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Admin only</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Deposits list */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Deposits</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : deposits?.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No deposits yet</p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground/70">Add the first deposit to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {deposits?.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={deposit.user_avatar}
                      alt={deposit.user_name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-medium">{deposit.user_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(deposit.deposit_date), "MMM dd, yyyy")}
                        <span>•</span>
                        <span className="text-xs">Added by {deposit.added_by_name}</span>
                      </div>
                      {deposit.notes && (
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                          {deposit.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-success text-lg">+৳{deposit.amount.toLocaleString()}</p>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this deposit of ৳{deposit.amount.toLocaleString()} from {deposit.user_name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(deposit.id)}
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

export default Deposits;
