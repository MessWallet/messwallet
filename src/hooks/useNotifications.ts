import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications-unread", user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast.success("All notifications marked as read");
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      title,
      message,
      type = "info",
    }: {
      userId: string;
      title: string;
      message: string;
      type?: string;
    }) => {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useSendGlobalNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      message,
      type = "info",
    }: {
      title: string;
      message: string;
      type?: string;
    }) => {
      // Get all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id");

      if (profilesError) throw profilesError;

      // Create notifications for all users
      const notifications = profiles.map((p) => ({
        user_id: p.user_id,
        title,
        message,
        type,
      }));

      const { error } = await supabase.from("notifications").insert(notifications);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast.success("Global notification sent to all users!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useAllNotifications = () => {
  return useQuery({
    queryKey: ["all-notifications"],
    queryFn: async (): Promise<(Notification & { user_name?: string; user_avatar?: string })[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(data.map((n) => n.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return data.map((n: any) => ({
        ...n,
        user_name: profileMap.get(n.user_id)?.full_name,
        user_avatar: profileMap.get(n.user_id)?.avatar_url,
      }));
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      toast.success("Notification deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
