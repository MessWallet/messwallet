import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Loader2,
  Receipt,
  Wallet,
  Utensils,
  Calendar,
  Bell,
  Search,
  Check,
  X,
} from "lucide-react";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { useDeposits, useDeleteDeposit } from "@/hooks/useDeposits";
import { useMeals, useDeleteMeal } from "@/hooks/useMeals";
import { useBudgets, useDeleteBudget } from "@/hooks/useBudgets";
import { useAllNotifications, useDeleteNotification, useMarkAsRead } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TabType = "expenses" | "deposits" | "meals" | "budgets" | "notifications";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DataDeletionSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>("expenses");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: deposits, isLoading: depositsLoading } = useDeposits();
  const { data: meals, isLoading: mealsLoading } = useMeals();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: notifications, isLoading: notificationsLoading } = useAllNotifications();

  const deleteExpense = useDeleteExpense();
  const deleteDeposit = useDeleteDeposit();
  const deleteMeal = useDeleteMeal();
  const deleteBudget = useDeleteBudget();
  const deleteNotification = useDeleteNotification();
  const markAsRead = useMarkAsRead();

  const tabs = [
    { id: "expenses" as TabType, label: "Expenses", icon: Receipt, count: expenses?.length || 0 },
    { id: "deposits" as TabType, label: "Deposits", icon: Wallet, count: deposits?.length || 0 },
    { id: "meals" as TabType, label: "Meals", icon: Utensils, count: meals?.length || 0 },
    { id: "budgets" as TabType, label: "Budgets", icon: Calendar, count: budgets?.length || 0 },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell, count: notifications?.length || 0 },
  ];

  const filteredExpenses = expenses?.filter(
    (e) =>
      e.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paid_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeposits = deposits?.filter(
    (d) => d.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = notifications?.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading =
    activeTab === "expenses" ? expensesLoading :
    activeTab === "deposits" ? depositsLoading :
    activeTab === "meals" ? mealsLoading :
    activeTab === "budgets" ? budgetsLoading :
    notificationsLoading;

  return (
    <GlassCard className="p-6 border-destructive/20">
      <div className="flex items-center gap-3 mb-4">
        <Trash2 className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold">Data Deletion Center</h3>
        <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full">
          Admin Only
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm("");
            }}
            className="gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Search */}
      {(activeTab === "expenses" || activeTab === "deposits" || activeTab === "notifications") && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {/* Expenses */}
            {activeTab === "expenses" && (
              <>
                {(!filteredExpenses || filteredExpenses.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">No expenses found</p>
                ) : (
                  filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{expense.item_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>৳{expense.amount.toLocaleString()}</span>
                          <span>•</span>
                          <span>{expense.paid_by_name}</span>
                          <span>•</span>
                          <span>{format(new Date(expense.expense_date), "MMM dd")}</span>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{expense.item_name}" (৳{expense.amount})? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteExpense.mutate(expense.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Deposits */}
            {activeTab === "deposits" && (
              <>
                {(!filteredDeposits || filteredDeposits.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">No deposits found</p>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {deposit.user_avatar && (
                          <img
                            src={deposit.user_avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{deposit.user_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>৳{deposit.amount.toLocaleString()}</span>
                            <span>•</span>
                            <span>{format(new Date(deposit.deposit_date), "MMM dd, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete ৳{deposit.amount} deposit from {deposit.user_name}? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDeposit.mutate(deposit.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Meals */}
            {activeTab === "meals" && (
              <>
                {(!meals || meals.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">No meals found for today</p>
                ) : (
                  meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {meal.user_avatar && (
                          <img
                            src={meal.user_avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{meal.user_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Lunch: {meal.lunch ? "Yes" : "No"}</span>
                            <span>•</span>
                            <span>Dinner: {meal.dinner ? "Yes" : "No"}</span>
                          </div>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Meal Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete meal record for {meal.user_name}? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMeal.mutate(meal.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Budgets */}
            {activeTab === "budgets" && (
              <>
                {(!budgets || budgets.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">No budgets found</p>
                ) : (
                  budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="font-medium">{months[budget.month - 1]} {budget.year}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Budget: ৳{budget.budget_amount.toLocaleString()}</span>
                          <span>•</span>
                          <span>Alert at ৳{budget.low_balance_threshold?.toLocaleString()}</span>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete budget for {months[budget.month - 1]} {budget.year}? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteBudget.mutate(budget.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <>
                {(!filteredNotifications || filteredNotifications.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">No notifications found</p>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border border-white/10",
                        notification.is_read ? "bg-white/5" : "bg-primary/10"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {notification.user_avatar && (
                          <img
                            src={notification.user_avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{notification.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{notification.user_name}</span>
                            <span>•</span>
                            <span>{format(new Date(notification.created_at), "MMM dd, HH:mm")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "shrink-0",
                            notification.is_read
                              ? "text-muted-foreground hover:bg-white/10"
                              : "text-success hover:bg-success/20"
                          )}
                          onClick={() => markAsRead.mutate(notification.id)}
                          title={notification.is_read ? "Already read" : "Mark as read"}
                        >
                          {notification.is_read ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete this notification for {notification.user_name}? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteNotification.mutate(notification.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </GlassCard>
  );
};
