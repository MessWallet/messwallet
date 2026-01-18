import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
  images: ChatMessageImage[];
  reactions: ChatReaction[];
  seen_by: ChatSeen[];
}

export interface ChatMessageImage {
  id: string;
  message_id: string;
  image_url: string;
  created_at: string;
}

export interface ChatReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface ChatSeen {
  id: string;
  message_id: string;
  user_id: string;
  seen_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

export const useChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; avatar_url: string }>>({});

  // Fetch all profiles for lookup
  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name, avatar_url");
    if (data) {
      const profileMap: Record<string, { full_name: string; avatar_url: string }> = {};
      data.forEach((p) => {
        profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      });
      setProfiles(profileMap);
    }
  }, []);

  // Fetch messages with images, reactions, and seen status
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    
    const { data: messagesData, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      return;
    }

    if (!messagesData || messagesData.length === 0) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messageIds = messagesData.map((m) => m.id);

    // Fetch images
    const { data: imagesData } = await supabase
      .from("chat_message_images")
      .select("*")
      .in("message_id", messageIds);

    // Fetch reactions
    const { data: reactionsData } = await supabase
      .from("chat_reactions")
      .select("*")
      .in("message_id", messageIds);

    // Fetch seen status
    const { data: seenData } = await supabase
      .from("chat_seen")
      .select("*")
      .in("message_id", messageIds);

    // Build messages with related data
    const enrichedMessages: ChatMessage[] = messagesData.map((msg) => ({
      ...msg,
      sender: profiles[msg.sender_id],
      images: (imagesData || []).filter((img) => img.message_id === msg.id),
      reactions: (reactionsData || []).map((r) => ({
        ...r,
        user: profiles[r.user_id],
      })).filter((r) => r.message_id === msg.id),
      seen_by: (seenData || []).map((s) => ({
        ...s,
        user: profiles[s.user_id],
      })).filter((s) => s.message_id === msg.id),
    }));

    setMessages(enrichedMessages);
    setLoading(false);
  }, [profiles]);

  // Send a message
  const sendMessage = async (content: string, imageFiles?: File[]) => {
    if (!user) return;

    try {
      // Create message
      const { data: messageData, error: messageError } = await supabase
        .from("chat_messages")
        .insert({ sender_id: user.id, content: content || null })
        .select()
        .single();

      if (messageError) throw messageError;

      // Upload images if any
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("chat-images")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }

          const { data: publicUrl } = supabase.storage
            .from("chat-images")
            .getPublicUrl(fileName);

          await supabase.from("chat_message_images").insert({
            message_id: messageData.id,
            image_url: publicUrl.publicUrl,
          });
        }
      }

      // Mark as seen by sender
      await supabase.from("chat_seen").insert({
        message_id: messageData.id,
        user_id: user.id,
      });

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Add reaction
  const addReaction = async (messageId: string, reaction: string) => {
    if (!user) return;

    try {
      // Check if reaction exists
      const { data: existing } = await supabase
        .from("chat_reactions")
        .select()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("reaction", reaction)
        .single();

      if (existing) {
        // Remove reaction
        await supabase.from("chat_reactions").delete().eq("id", existing.id);
      } else {
        // Add reaction
        await supabase.from("chat_reactions").insert({
          message_id: messageId,
          user_id: user.id,
          reaction,
        });
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  // Mark message as seen
  const markAsSeen = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase.from("chat_seen").upsert(
        { message_id: messageId, user_id: user.id },
        { onConflict: "message_id,user_id" }
      );
    } catch (error) {
      // Ignore duplicate errors
    }
  };

  // Delete message (admin only)
  const deleteMessage = async (messageId: string) => {
    try {
      // First delete images from storage
      const { data: images } = await supabase
        .from("chat_message_images")
        .select("image_url")
        .eq("message_id", messageId);

      if (images) {
        for (const img of images) {
          const path = img.image_url.split("/chat-images/")[1];
          if (path) {
            await supabase.storage.from("chat-images").remove([path]);
          }
        }
      }

      // Delete message (cascade will handle related records)
      const { error } = await supabase.from("chat_messages").delete().eq("id", messageId);
      if (error) throw error;
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  // Delete all chat (admin only)
  const deleteAllChat = async () => {
    try {
      // Get all images
      const { data: images } = await supabase.from("chat_message_images").select("image_url");
      
      if (images) {
        const paths = images
          .map((img) => img.image_url.split("/chat-images/")[1])
          .filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from("chat-images").remove(paths);
        }
      }

      // Delete all messages (cascade will handle rest)
      const { error } = await supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      
      toast.success("All chat deleted");
    } catch (error) {
      console.error("Error deleting all chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Get all media
  const getAllMedia = useCallback(async () => {
    const { data } = await supabase
      .from("chat_message_images")
      .select(`
        *,
        message:chat_messages(sender_id, created_at)
      `)
      .order("created_at", { ascending: false });

    return (data || []).map((img) => ({
      ...img,
      sender: img.message ? profiles[img.message.sender_id] : undefined,
    }));
  }, [profiles]);

  // Setup realtime subscriptions
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (Object.keys(profiles).length > 0) {
      fetchMessages();
    }
  }, [profiles, fetchMessages]);

  useEffect(() => {
    // Subscribe to messages
    const messagesChannel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        () => fetchMessages()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_message_images" },
        () => fetchMessages()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_reactions" },
        () => fetchMessages()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_seen" },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    addReaction,
    markAsSeen,
    deleteMessage,
    deleteAllChat,
    getAllMedia,
    refetch: fetchMessages,
  };
};
