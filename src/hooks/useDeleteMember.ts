import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) throw new Error("Only admins can delete members");

      // Check if user is founder (cannot delete founder)
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (role?.role === "founder") {
        throw new Error("Cannot delete founder account");
      }

      // Delete user's data in order
      // 1. Delete meals
      await supabase.from("meals").delete().eq("user_id", userId);
      
      // 2. Delete deposits
      await supabase.from("deposits").delete().eq("user_id", userId);
      
      // 3. Delete expenses (paid_by)
      await supabase.from("expenses").delete().eq("paid_by", userId);
      
      // 4. Delete notifications
      await supabase.from("notifications").delete().eq("user_id", userId);
      
      // 5. Delete user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (roleError) throw roleError;

      // 6. Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("Member deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
