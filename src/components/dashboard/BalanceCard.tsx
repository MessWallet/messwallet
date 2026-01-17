import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface BalanceCardProps {
  balance: number;
  totalDeposit: number;
  totalExpense: number;
}

export const BalanceCard = ({ balance, totalDeposit, totalExpense }: BalanceCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <GlassCard variant="balance" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Current Balance</p>
            <p className="text-xs text-muted-foreground/60">মোট ব্যালেন্স</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary animate-pulse-glow rounded-lg inline-block">
            {formatCurrency(balance)}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/20">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposit</p>
              <p className="text-sm font-semibold text-success">
                {formatCurrency(totalDeposit)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/20">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Expense</p>
              <p className="text-sm font-semibold text-destructive">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
