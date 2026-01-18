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
  added_by_name?: string;
  added_by_avatar?: string;
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
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data.flatMap((d: any) => [d.user_id, d.added_by]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, serial_position")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]));

      // Map deposits with profile info
      const deposits = data.map((deposit: any) => ({
        ...deposit,
        user_name: profileMap.get(deposit.user_id)?.full_name,
        user_avatar: profileMap.get(deposit.user_id)?.avatar_url,
        added_by_name: profileMap.get(deposit.added_by)?.full_name,
        added_by_avatar: profileMap.get(deposit.added_by)?.avatar_url,
      }));

      return deposits;
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

      const { data: deposit, error } = await supabase.from("deposits").insert({
        ...data,
        added_by: user.id,
        deposit_date: data.deposit_date || new Date().toISOString().split("T")[0],
      }).select().single();

      if (error) throw error;

      // Get depositor's name
      const { data: depositor } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", data.user_id)
        .single();

      // Get all user profiles for notifications
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id");

      if (profiles) {
        const notifications = profiles.map((p) => ({
          user_id: p.user_id,
          title: "New Deposit Added",
          message: `${depositor?.full_name || "Someone"} deposited ৳${data.amount}`,
          type: "success",
        }));

        await supabase.from("notifications").insert(notifications);
      }

      return deposit;
    },
    onSuccess: () => {
      // Invalidate all related queries immediately
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast.success("Deposit added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateBulkDeposit = () => {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (data: { amount: number; notes?: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (!isAdmin) throw new Error("Only admins can add deposits");

      // Get all members
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) throw new Error("No members found");

      const today = new Date().toISOString().split("T")[0];

      // Create deposits for all members
      const deposits = profiles.map((p) => ({
        user_id: p.user_id,
        amount: data.amount,
        notes: data.notes,
        added_by: user.id,
        deposit_date: today,
      }));

      const { error } = await supabase.from("deposits").insert(deposits);
      if (error) throw error;

      // Create notifications for all users
      const notifications = profiles.map((p) => ({
        user_id: p.user_id,
        title: "Bulk Deposit Added",
        message: `৳${data.amount.toFixed(2)} deposited for all members`,
        type: "success",
      }));

      await supabase.from("notifications").insert(notifications);

      return { count: profiles.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast.success(`Deposit added for ${data.count} members!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deposits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Deposit deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
