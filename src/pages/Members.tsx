import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useMembers } from "@/hooks/useMembers";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Users, Loader2, TrendingUp, TrendingDown, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Members = () => {
  const navigate = useNavigate();
  const { data: members, isLoading } = useMembers();

  const handleMemberClick = (userId: string) => {
    navigate(`/member/${userId}`);
  };

  return (
    <DashboardLayout title="Members" titleBn="সদস্য">
      <div className="space-y-6">
        {/* Summary */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/20">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Total Members</p>
              <p className="text-3xl font-bold">{members?.length || 0}</p>
            </div>
          </div>
        </GlassCard>

        {/* Members grid - sorted by serial_position */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : members?.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No members yet</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members?.map((member, index) => {
              const balance = member.totalDeposit - member.totalExpense;
              const isPositive = balance >= 0;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard 
                    className="p-6 hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => handleMemberClick(member.user_id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Serial Number Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          member.role === "founder" ? "bg-warning/20 text-warning" : "bg-white/10 text-muted-foreground"
                        )}>
                          #{member.serial_position || index + 1}
                        </span>
                      </div>

                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{member.full_name}</h3>
                        </div>
                        <RoleBadge role={member.role} />
                        <p className="text-sm text-muted-foreground mt-1 truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Deposit
                        </span>
                        <span className="text-success font-medium">৳{member.totalDeposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Expense
                        </span>
                        <span className="text-destructive font-medium">৳{member.totalExpense.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          Meals
                        </span>
                        <span className="font-medium">{member.mealCount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/5">
                        <span className="font-medium">Balance</span>
                        <span className={cn(
                          "font-bold",
                          isPositive ? "text-success" : "text-destructive"
                        )}>
                          {isPositive ? "+" : ""}৳{balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Members;
