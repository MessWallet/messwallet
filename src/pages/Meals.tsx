import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTodayMealsSummary, useUpdateMeal, useMeals, useDeleteMeal } from "@/hooks/useMeals";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useMembers } from "@/hooks/useMembers";
import { useAuth } from "@/contexts/AuthContext";
import { Utensils, Check, X, Loader2, Trash2, ChevronLeft, Calendar, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Meals = () => {
  const { user, isAdmin } = useAuth();
  const { data: mealsData, isLoading } = useTodayMealsSummary();
  const { data: members } = useMembers();
  const today = new Date().toISOString().split("T")[0];
  const { data: todayMeals } = useMeals(today);
  const updateMeal = useUpdateMeal();
  const deleteMeal = useDeleteMeal();

  const [selectedMember, setSelectedMember] = useState<{
    userId: string;
    userName: string;
    userAvatar: string;
  } | null>(null);

  const { data: mealHistory, isLoading: historyLoading } = useMealHistory(
    selectedMember?.userId || "",
    isAdmin ? 365 : 60
  );

  const handleToggleMeal = async (userId: string, mealType: "lunch" | "dinner", currentValue: boolean) => {
    const canUpdate = userId === user?.id || isAdmin;
    if (!canUpdate) return;

    await updateMeal.mutateAsync({
      userId,
      date: today,
      [mealType]: !currentValue,
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    await deleteMeal.mutateAsync(mealId);
  };

  const handleEditHistoryMeal = async (userId: string, date: string, lunch: boolean, dinner: boolean) => {
    await updateMeal.mutateAsync({
      userId,
      date,
      lunch,
      dinner,
    });
  };

  const getMealId = (userId: string): string | null => {
    const meal = todayMeals?.find(m => m.user_id === userId);
    return meal?.id || null;
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

        {/* Meal tracking - Clickable profiles */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Today's Meal Status</h3>
              <p className="text-sm text-muted-foreground">
                Click profile to view meal history • Toggle to update
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
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <span>Member</span>
                <span className="text-center">Lunch</span>
                <span className="text-center">Dinner</span>
                <span className="text-center">Total</span>
                {isAdmin && <span className="text-center">Actions</span>}
              </div>

              {/* Members */}
              {mealsData?.summary.map((member) => {
                const canEdit = member.userId === user?.id || isAdmin;
                const mealCount = (member.lunch ? 1 : 0) + (member.dinner ? 1 : 0);
                const mealId = getMealId(member.userId);

                return (
                  <div
                    key={member.userId}
                    className={cn(
                      "grid gap-4 items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors",
                      isAdmin ? "grid-cols-5" : "grid-cols-4"
                    )}
                  >
                    {/* Clickable Profile */}
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={member.userAvatar}
                        alt={member.userName}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                      />
                      <span className="font-medium">{member.userName}</span>
                    </button>

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

                    {isAdmin && (
                      <div className="flex justify-center">
                        {mealId ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Meal Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {member.userName}'s meal record for today?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMeal(mealId)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-muted-foreground">No record</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Meal History Dialog */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="glass-card border-white/10 max-w-lg max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedMember && (
                  <>
                    <img
                      src={selectedMember.userAvatar}
                      alt={selectedMember.userName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <p>{selectedMember.userName}'s Meal History</p>
                      <p className="text-sm font-normal text-muted-foreground">
                        Last {isAdmin ? "365" : "60"} days
                      </p>
                    </div>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !mealHistory || mealHistory.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No meal history found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {mealHistory.map((meal) => {
                    const isToday = meal.meal_date === today;
                    return (
                      <div
                        key={meal.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl",
                          isToday ? "bg-primary/20 border border-primary/30" : "bg-white/5"
                        )}
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(meal.meal_date), "EEEE, MMM dd")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(meal.meal_date), "yyyy")}
                            {isToday && " • Today"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              meal.lunch ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                            )}>
                              L: {meal.lunch ? "✓" : "✗"}
                            </span>
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              meal.dinner ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                            )}>
                              D: {meal.dinner ? "✓" : "✗"}
                            </span>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7"
                                onClick={() => handleEditHistoryMeal(
                                  selectedMember!.userId,
                                  meal.meal_date,
                                  !meal.lunch,
                                  meal.dinner
                                )}
                                disabled={updateMeal.isPending}
                              >
                                <span className="text-xs">L</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7"
                                onClick={() => handleEditHistoryMeal(
                                  selectedMember!.userId,
                                  meal.meal_date,
                                  meal.lunch,
                                  !meal.dinner
                                )}
                                disabled={updateMeal.isPending}
                              >
                                <span className="text-xs">D</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Meals;
