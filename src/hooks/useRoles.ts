import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppRole = "founder" | "secondary_admin" | "tertiary_admin" | "member";

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("User role updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useClearAllData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Delete in order to avoid foreign key constraints
      // 1. Delete meals
      const { error: mealsError } = await supabase.from("meals").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (mealsError) throw mealsError;

      // 2. Delete expenses
      const { error: expensesError } = await supabase.from("expenses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (expensesError) throw expensesError;

      // 3. Delete deposits
      const { error: depositsError } = await supabase.from("deposits").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (depositsError) throw depositsError;

      // 4. Delete shared bills
      const { error: billsError } = await supabase.from("shared_bills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (billsError) throw billsError;

      // 5. Delete monthly budgets
      const { error: budgetsError } = await supabase.from("monthly_budgets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (budgetsError) throw budgetsError;

      // 6. Delete audit logs
      const { error: auditError } = await supabase.from("audit_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (auditError) throw auditError;

      // 7. Delete notifications
      const { error: notificationsError } = await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (notificationsError) throw notificationsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("All data cleared successfully! Users and profiles remain intact.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear data: ${error.message}`);
    },
  });
};
