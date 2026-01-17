import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Meal {
  id: string;
  user_id: string;
  meal_date: string;
  lunch: boolean;
  dinner: boolean;
  marked_by: string | null;
  auto_marked: boolean;
  created_at: string;
  // Joined data
  user_name?: string;
  user_avatar?: string;
}

export interface TodayMealSummary {
  userId: string;
  userName: string;
  userAvatar: string;
  lunch: boolean;
  dinner: boolean;
}

export const useMeals = (date?: string) => {
  const today = date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["meals", today],
    queryFn: async (): Promise<Meal[]> => {
      const { data, error } = await supabase
        .from("meals")
        .select(`
          *,
          profiles!meals_user_id_fkey(full_name, avatar_url)
        `)
        .eq("meal_date", today)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((meal: any) => ({
        ...meal,
        user_name: meal.profiles?.full_name,
        user_avatar: meal.profiles?.avatar_url,
      }));
    },
  });
};

export const useTodayMealsSummary = () => {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["today-meals-summary"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url");

      if (profilesError) throw profilesError;

      // Get today's meals
      const { data: meals, error: mealsError } = await supabase
        .from("meals")
        .select("*")
        .eq("meal_date", today);

      if (mealsError) throw mealsError;

      // Combine - default to true if no meal record exists
      const summary: TodayMealSummary[] = profiles.map((profile) => {
        const meal = meals.find((m) => m.user_id === profile.user_id);
        return {
          userId: profile.user_id,
          userName: profile.full_name,
          userAvatar: profile.avatar_url,
          lunch: meal?.lunch ?? true,
          dinner: meal?.dinner ?? true,
        };
      });

      const lunchCount = summary.filter((s) => s.lunch).length;
      const dinnerCount = summary.filter((s) => s.dinner).length;

      return { summary, lunchCount, dinnerCount };
    },
  });
};

export const useUpdateMeal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      date,
      lunch,
      dinner,
    }: {
      userId: string;
      date: string;
      lunch?: boolean;
      dinner?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if meal record exists
      const { data: existing } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .eq("meal_date", date)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("meals")
          .update({
            lunch: lunch ?? existing.lunch,
            dinner: dinner ?? existing.dinner,
            marked_by: user.id,
            auto_marked: false,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("meals").insert({
          user_id: userId,
          meal_date: date,
          lunch: lunch ?? true,
          dinner: dinner ?? true,
          marked_by: user.id,
          auto_marked: false,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["today-meals-summary"] });
      toast.success("Meal updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
