import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useNotifications } from "@/hooks/useNotifications";
import { useMembers } from "@/hooks/useMembers";
import { useExpenses } from "@/hooks/useExpenses";
import { useDeposits } from "@/hooks/useDeposits";
import { useAuth } from "@/contexts/AuthContext";
import {
  History as HistoryIcon,
  Bell,
  Users,
  Receipt,
  Wallet,
  Loader2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const History = () => {
  const { data: notifications, isLoading: notificationsLoading } = useNotifications();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: deposits, isLoading: depositsLoading } = useDeposits();
  const { isAdmin } = useAuth();

  const isLoading = notificationsLoading || membersLoading || expensesLoading || depositsLoading;

  return (
    <DashboardLayout title="History & Notifications" titleBn="ইতিহাস ও বিজ্ঞপ্তি">
      <div className="space-y-6">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden md:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="deposits" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden md:inline">Deposits</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Members</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                All Notifications
              </h3>

              {notificationsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : notifications?.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {notifications?.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          notification.is_read
                            ? "bg-white/5 border-white/10"
                            : "bg-primary/10 border-primary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {format(new Date(notification.created_at), "MMM dd, HH:mm")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </GlassCard>
          </TabsContent>

          {/* Expenses History Tab */}
          <TabsContent value="expenses">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-destructive" />
                Expense History
              </h3>

              {expensesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : expenses?.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No expenses recorded</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {expenses?.map((expense) => (
                      <div
                        key={expense.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-destructive/20">
                              <Receipt className="w-4 h-4 text-destructive" />
                            </div>
                            <div>
                              <p className="font-medium">{expense.item_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Paid by: {expense.paid_by_name} • Added by: {expense.added_by_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-destructive">
                              -৳{Number(expense.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(expense.expense_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </GlassCard>
          </TabsContent>

          {/* Deposits History Tab */}
          <TabsContent value="deposits">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-success" />
                Deposit History
              </h3>

              {depositsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : deposits?.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No deposits recorded</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {deposits?.map((deposit) => (
                      <div
                        key={deposit.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={deposit.user_avatar}
                              alt={deposit.user_name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-medium">{deposit.user_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Added by: {deposit.added_by_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-success">
                              +৳{Number(deposit.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(deposit.deposit_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </GlassCard>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                All Members
              </h3>

              {membersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : members?.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No members found</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {members?.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar_url}
                              alt={member.full_name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.full_name}</p>
                                <RoleBadge role={member.role} size="sm" />
                              </div>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-success">+৳{member.totalDeposit.toLocaleString()}</p>
                            <p className="text-destructive">-৳{member.totalExpense.toLocaleString()}</p>
                            <p className="text-muted-foreground">{member.mealCount} meals</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default History;
