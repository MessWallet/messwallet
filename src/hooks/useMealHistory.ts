import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, format } from "date-fns";

export interface MealHistoryRecord {
  id: string;
  user_id: string;
  meal_date: string;
  lunch: boolean;
  dinner: boolean;
  marked_by: string | null;
  auto_marked: boolean;
  created_at: string;
}

export const useMealHistory = (userId: string, days: number = 60) => {
  const { user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ["meal-history", userId, days],
    queryFn: async (): Promise<MealHistoryRecord[]> => {
      // Members can only view their own history
      if (!isAdmin && user?.id !== userId) {
        throw new Error("Unauthorized");
      }

      const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .gte("meal_date", startDate)
        .order("meal_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!user,
  });
};

export const useAllMealsHistory = (days: number = 60) => {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["all-meals-history", days],
    queryFn: async (): Promise<MealHistoryRecord[]> => {
      if (!isAdmin) {
        throw new Error("Unauthorized - Admin only");
      }

      const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .gte("meal_date", startDate)
        .order("meal_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });
};
