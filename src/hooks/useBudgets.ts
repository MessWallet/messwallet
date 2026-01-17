import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Budget {
  id: string;
  month: number;
  year: number;
  budget_amount: number;
  low_balance_threshold: number;
  is_locked: boolean;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_budgets")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
  });
};

export const useCurrentBudget = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["current-budget", currentMonth, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_budgets")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle();

      if (error) throw error;
      return data as Budget | null;
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      budget_amount: number;
      low_balance_threshold?: number;
    }) => {
      const { error } = await supabase.from("monthly_budgets").insert({
        month: data.month,
        year: data.year,
        budget_amount: data.budget_amount,
        low_balance_threshold: data.low_balance_threshold || 5000,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("Budget created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      budget_amount?: number;
      low_balance_threshold?: number;
      is_locked?: boolean;
    }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("monthly_budgets")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("Budget updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
