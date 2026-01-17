import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    queryFn: async (): Promise<Budget[]> => {
      const { data, error } = await supabase
        .from("monthly_budgets")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCurrentBudget = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["current-budget"],
    queryFn: async (): Promise<Budget | null> => {
      const { data, error } = await supabase
        .from("monthly_budgets")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      budget_amount: number;
      low_balance_threshold: number;
    }) => {
      const { error } = await supabase.from("monthly_budgets").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      toast.success("Budget created successfully!");
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
      budget_amount: number;
      low_balance_threshold: number;
    }) => {
      const { error } = await supabase
        .from("monthly_budgets")
        .update({
          budget_amount: data.budget_amount,
          low_balance_threshold: data.low_balance_threshold,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      toast.success("Budget updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("monthly_budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      toast.success("Budget deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
