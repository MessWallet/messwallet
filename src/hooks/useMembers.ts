import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string;
  role: "founder" | "secondary_admin" | "tertiary_admin" | "member";
  totalDeposit: number;
  totalExpense: number;
  mealCount: number;
  serial_position: number;
}

export const useMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<Member[]> => {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch deposits aggregated by user
      const { data: deposits, error: depositsError } = await supabase
        .from("deposits")
        .select("user_id, amount");

      if (depositsError) throw depositsError;

      // Fetch expenses aggregated by user (paid_by)
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("paid_by, amount");

      if (expensesError) throw expensesError;

      // Fetch meals count
      const { data: meals, error: mealsError } = await supabase
        .from("meals")
        .select("user_id, lunch, dinner");

      if (mealsError) throw mealsError;

      // Combine data
      const members: Member[] = profiles.map((profile) => {
        const role = roles.find((r) => r.user_id === profile.user_id);
        const userDeposits = deposits.filter((d) => d.user_id === profile.user_id);
        const userExpenses = expenses.filter((e) => e.paid_by === profile.user_id);
        const userMeals = meals.filter((m) => m.user_id === profile.user_id);

        const totalDeposit = userDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
        const totalExpense = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const mealCount = userMeals.reduce((sum, m) => {
          return sum + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0);
        }, 0);

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          role: (role?.role || "member") as Member["role"],
          totalDeposit,
          totalExpense,
          mealCount,
          serial_position: profile.serial_position || 999,
        };
      });

      // Sort: first by serial_position, then by role as fallback
      return members.sort((a, b) => {
        // Founder always first
        if (a.role === "founder") return -1;
        if (b.role === "founder") return 1;
        
        // Then by serial_position
        if (a.serial_position !== b.serial_position) {
          return a.serial_position - b.serial_position;
        }
        
        // Fallback to role order
        const roleOrder = { founder: 0, secondary_admin: 1, tertiary_admin: 2, member: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
      });
    },
  });
};
