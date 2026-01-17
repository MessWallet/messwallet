import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useDeposits, useCreateDeposit } from "@/hooks/useDeposits";
import { useMembers } from "@/hooks/useMembers";
import { useAuth } from "@/contexts/AuthContext";
import { PiggyBank, Plus, Loader2, Calendar, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

const Deposits = () => {
  const { isAdmin } = useAuth();
  const { data: deposits, isLoading } = useDeposits();
  const { data: members } = useMembers();
  const createDeposit = useCreateDeposit();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createDeposit.mutateAsync({
      user_id: formData.user_id,
      amount: parseFloat(formData.amount),
      notes: formData.notes || undefined,
    });

    setFormData({ user_id: "", amount: "", notes: "" });
    setIsDialogOpen(false);
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
                <DialogContent className="glass-card border-white/10">
                  <DialogHeader>
                    <DialogTitle>Add New Deposit</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label>Notes</Label>
                      <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes..."
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createDeposit.isPending}>
                      {createDeposit.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                        {deposit.notes && (
                          <>
                            <span>•</span>
                            <span>{deposit.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-success text-lg">+৳{deposit.amount.toLocaleString()}</p>
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
