import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FinanceStats {
  totalDeposit: number;
  totalExpense: number;
  balance: number;
  todayExpense: number;
  monthlyBudget: number;
  lowBalanceThreshold: number;
  memberCount: number;
  perHeadCost: number;
}

export const useFinanceStats = () => {
  return useQuery({
    queryKey: ["finance-stats"],
    queryFn: async (): Promise<FinanceStats> => {
      const today = new Date().toISOString().split("T")[0];
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Fetch all deposits
      const { data: deposits, error: depositsError } = await supabase
        .from("deposits")
        .select("amount");

      if (depositsError) throw depositsError;

      // Fetch all expenses
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("amount, expense_date");

      if (expensesError) throw expensesError;

      // Fetch monthly budget
      const { data: budget, error: budgetError } = await supabase
        .from("monthly_budgets")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle();

      if (budgetError) throw budgetError;

      // Fetch member count
      const { count: memberCount, error: memberError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (memberError) throw memberError;

      const totalDeposit = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalExpense = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const todayExpense = expenses
        ?.filter((e) => e.expense_date === today)
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const members = memberCount || 0;
      const perHeadCost = members > 0 ? Math.round(totalExpense / members) : 0;

      return {
        totalDeposit,
        totalExpense,
        balance: totalDeposit - totalExpense,
        todayExpense,
        monthlyBudget: budget?.budget_amount ? Number(budget.budget_amount) : 0,
        lowBalanceThreshold: budget?.low_balance_threshold ? Number(budget.low_balance_threshold) : 5000,
        memberCount: members,
        perHeadCost,
      };
    },
  });
};
