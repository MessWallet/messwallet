import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Expense {
  id: string;
  category_id: string | null;
  item_name: string;
  amount: number;
  quantity: number | null;
  unit: string | null;
  paid_by: string;
  added_by: string;
  expense_date: string;
  expense_type: string;
  is_emergency: boolean;
  notes: string | null;
  created_at: string;
  // Joined data
  paid_by_name?: string;
  paid_by_avatar?: string;
  added_by_name?: string;
  added_by_avatar?: string;
  category_name?: string;
  category_name_bn?: string;
}

export interface CreateExpenseData {
  category_id?: string;
  item_name: string;
  amount: number;
  quantity?: number;
  unit?: string;
  paid_by: string;
  expense_date?: string;
  expense_type?: string;
  is_emergency?: boolean;
  notes?: string;
}

export const useExpenses = (limit?: number) => {
  return useQuery({
    queryKey: ["expenses", limit],
    queryFn: async (): Promise<Expense[]> => {
      let query = supabase
        .from("expenses")
        .select(`
          *,
          expense_categories(name, name_bn)
        `)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately for paid_by and added_by
      const userIds = [...new Set(data.flatMap((e: any) => [e.paid_by, e.added_by]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]));

      return data.map((expense: any) => ({
        ...expense,
        paid_by_name: profileMap.get(expense.paid_by)?.full_name,
        paid_by_avatar: profileMap.get(expense.paid_by)?.avatar_url,
        added_by_name: profileMap.get(expense.added_by)?.full_name,
        added_by_avatar: profileMap.get(expense.added_by)?.avatar_url,
        category_name: expense.expense_categories?.name,
        category_name_bn: expense.expense_categories?.name_bn,
      }));
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("expenses").insert({
        ...data,
        added_by: user.id,
        expense_date: data.expense_date || new Date().toISOString().split("T")[0],
        expense_type: data.expense_type || "market",
        is_emergency: data.is_emergency || false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("Expense added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("Expense deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
