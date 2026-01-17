import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useDeposits } from "@/hooks/useDeposits";
import { useExpenses } from "@/hooks/useExpenses";
import { useMealHistory } from "@/hooks/useMealHistory";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  Camera,
  Wallet,
  Receipt,
  Utensils,
  Trash2,
  Loader2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { user, profile, userRole, isFounder, signOut, refreshProfile } = useAuth();
  const { data: deposits } = useDeposits();
  const { data: expenses } = useExpenses();
  const { data: mealHistory } = useMealHistory(user?.id || "", 60);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter to only show user's data
  const userDeposits = deposits?.filter((d) => d.user_id === user?.id) || [];
  const userExpenses = expenses?.filter((e) => e.paid_by === user?.id) || [];

  const totalDeposits = userDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalExpenses = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalMeals = mealHistory?.reduce(
    (sum, m) => sum + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0),
    0
  ) || 0;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Profile photo updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || isFounder) return;

    setIsDeleting(true);
    try {
      // Delete profile first (this will cascade)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Delete user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id);

      if (roleError) throw roleError;

      // Sign out
      await signOut();
      navigate("/auth");
      toast.success("Account deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout title="Profile" titleBn="প্রোফাইল">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" titleBn="প্রোফাইল">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar with change button */}
            <div className="relative group">
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-primary/30"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Optional"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    {userRole && <RoleBadge role={userRole.role} />}
                  </div>
                  <p className="text-muted-foreground">{profile.email}</p>
                  {profile.phone && (
                    <p className="text-muted-foreground">{profile.phone}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => {
                      setEditForm({
                        full_name: profile.full_name,
                        phone: profile.phone || "",
                      });
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <Wallet className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-success">৳{totalDeposits.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/20">
                <Receipt className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">৳{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Utensils className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Meals (60 days)</p>
                <p className="text-2xl font-bold text-primary">{totalMeals}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Deposits */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-success" />
              My Deposits
            </h3>
            {userDeposits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No deposits yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userDeposits.slice(0, 10).map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="font-medium text-success">+৳{Number(deposit.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(deposit.deposit_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    {deposit.notes && (
                      <p className="text-xs text-muted-foreground">{deposit.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* My Expenses */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-destructive" />
              My Expenses
            </h3>
            {userExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userExpenses.slice(0, 10).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="font-medium">{expense.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.expense_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <p className="font-medium text-destructive">-৳{Number(expense.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Meal Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Meal History (Last 60 Days)
          </h3>
          {!mealHistory || mealHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No meal data</p>
          ) : (
            <div className="grid grid-cols-7 gap-1 max-h-64 overflow-y-auto">
              {mealHistory.slice(0, 60).map((meal) => (
                <div
                  key={meal.id}
                  className="p-2 rounded-lg text-center text-xs"
                  style={{
                    background:
                      meal.lunch && meal.dinner
                        ? "hsla(142, 76%, 36%, 0.3)"
                        : meal.lunch || meal.dinner
                        ? "hsla(38, 92%, 50%, 0.3)"
                        : "hsla(0, 0%, 50%, 0.2)",
                  }}
                >
                  <p className="font-medium">{format(new Date(meal.meal_date), "dd")}</p>
                  <p className="text-muted-foreground">{format(new Date(meal.meal_date), "MMM")}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Danger Zone */}
        {!isFounder && (
          <GlassCard className="p-6 border-destructive/30">
            <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border-destructive/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Yes, Delete My Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
