import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTodayMealsSummary, useUpdateMeal } from "@/hooks/useMeals";
import { useAuth } from "@/contexts/AuthContext";
import { Utensils, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Meals = () => {
  const { user, isAdmin } = useAuth();
  const { data: mealsData, isLoading } = useTodayMealsSummary();
  const updateMeal = useUpdateMeal();

  const today = new Date().toISOString().split("T")[0];
  const isToday = true; // We're only showing today for now

  const handleToggleMeal = async (userId: string, mealType: "lunch" | "dinner", currentValue: boolean) => {
    // Users can only update their own meals on the same day, admins can update anyone's
    const canUpdate = userId === user?.id || isAdmin;
    if (!canUpdate) return;

    await updateMeal.mutateAsync({
      userId,
      date: today,
      [mealType]: !currentValue,
    });
  };

  return (
    <DashboardLayout title="Meals" titleBn="খাবার">
      <div className="space-y-6">
        {/* Today's summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6 text-center">
            <Utensils className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <p className="text-3xl font-bold text-secondary">{mealsData?.lunchCount || 0}</p>
            <p className="text-muted-foreground">Lunch Today</p>
            <p className="text-muted-foreground text-sm font-bengali">দুপুরের খাবার</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <Utensils className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-primary">{mealsData?.dinnerCount || 0}</p>
            <p className="text-muted-foreground">Dinner Today</p>
            <p className="text-muted-foreground text-sm font-bengali">রাতের খাবার</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {format(new Date(), "EEEE")}
            </p>
            <p className="text-3xl font-bold">
              {format(new Date(), "MMM dd")}
            </p>
            <p className="text-muted-foreground text-sm font-bengali">
              {format(new Date(), "yyyy")}
            </p>
          </GlassCard>
        </div>

        {/* Meal tracking table */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Today's Meal Status</h3>
              <p className="text-sm text-muted-foreground">
                Click to toggle your meal attendance
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : mealsData?.summary.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <span>Member</span>
                <span className="text-center">Lunch</span>
                <span className="text-center">Dinner</span>
                <span className="text-center">Total</span>
              </div>

              {/* Members */}
              {mealsData?.summary.map((member) => {
                const canEdit = member.userId === user?.id || isAdmin;
                const mealCount = (member.lunch ? 1 : 0) + (member.dinner ? 1 : 0);

                return (
                  <div
                    key={member.userId}
                    className="grid grid-cols-4 gap-4 items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.userAvatar}
                        alt={member.userName}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <span className="font-medium">{member.userName}</span>
                    </div>

                    <button
                      onClick={() => handleToggleMeal(member.userId, "lunch", member.lunch)}
                      disabled={!canEdit || updateMeal.isPending}
                      className={cn(
                        "mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        member.lunch 
                          ? "bg-success/20 text-success" 
                          : "bg-destructive/20 text-destructive",
                        canEdit && "hover:scale-110 cursor-pointer",
                        !canEdit && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {member.lunch ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleToggleMeal(member.userId, "dinner", member.dinner)}
                      disabled={!canEdit || updateMeal.isPending}
                      className={cn(
                        "mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        member.dinner 
                          ? "bg-success/20 text-success" 
                          : "bg-destructive/20 text-destructive",
                        canEdit && "hover:scale-110 cursor-pointer",
                        !canEdit && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {member.dinner ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>

                    <div className="text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold",
                        mealCount === 2 && "bg-success/20 text-success",
                        mealCount === 1 && "bg-warning/20 text-warning",
                        mealCount === 0 && "bg-muted/20 text-muted-foreground"
                      )}>
                        {mealCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default Meals;
