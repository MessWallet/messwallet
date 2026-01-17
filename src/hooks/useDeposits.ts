import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  deposit_date: string;
  added_by: string;
  notes: string | null;
  created_at: string;
  // Joined data
  user_name?: string;
  user_avatar?: string;
}

export interface CreateDepositData {
  user_id: string;
  amount: number;
  deposit_date?: string;
  notes?: string;
}

export const useDeposits = (limit?: number) => {
  return useQuery({
    queryKey: ["deposits", limit],
    queryFn: async (): Promise<Deposit[]> => {
      let query = supabase
        .from("deposits")
        .select(`
          *,
          profiles!deposits_user_id_fkey(full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((deposit: any) => ({
        ...deposit,
        user_name: deposit.profiles?.full_name,
        user_avatar: deposit.profiles?.avatar_url,
      }));
    },
  });
};

export const useCreateDeposit = () => {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateDepositData) => {
      if (!user) throw new Error("Not authenticated");
      if (!isAdmin) throw new Error("Only admins can add deposits");

      const { error } = await supabase.from("deposits").insert({
        ...data,
        added_by: user.id,
        deposit_date: data.deposit_date || new Date().toISOString().split("T")[0],
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Deposit added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
