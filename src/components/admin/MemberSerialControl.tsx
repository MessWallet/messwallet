import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useMembers, Member } from "@/hooks/useMembers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  GripVertical,
  Save,
  Loader2,
  ListOrdered,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const MemberSerialControl = () => {
  const { data: members, isLoading } = useMembers();
  const [orderedMembers, setOrderedMembers] = useState<Member[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (members) {
      // Sort by serial_position if available, otherwise by role
      const sorted = [...members].sort((a, b) => {
        // Founder always first
        if (a.role === "founder") return -1;
        if (b.role === "founder") return 1;
        return 0;
      });
      setOrderedMembers(sorted);
    }
  }, [members]);

  const handleReorder = (newOrder: Member[]) => {
    // Keep founder at position 1
    const founder = newOrder.find(m => m.role === "founder");
    const others = newOrder.filter(m => m.role !== "founder");
    
    const finalOrder = founder ? [founder, ...others] : newOrder;
    setOrderedMembers(finalOrder);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update each member's serial position
      const updates = orderedMembers.map((member, index) => 
        supabase
          .from("profiles")
          .update({ serial_position: index + 1 })
          .eq("user_id", member.user_id)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(r => r.error);

      if (hasError) {
        throw new Error("Failed to update some positions");
      }

      toast.success("Member order saved successfully!");
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save member order");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ListOrdered className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Member Serial Control</h3>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Founder Only</span>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Order
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop members to set their display order across the app. Founder position is fixed at #1.
      </p>

      <Reorder.Group
        axis="y"
        values={orderedMembers}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {orderedMembers.map((member, index) => (
          <Reorder.Item
            key={member.id}
            value={member}
            className={`${member.role === "founder" ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
            drag={member.role !== "founder"}
          >
            <motion.div
              className={`flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 transition-colors ${
                member.role !== "founder" ? "hover:bg-white/10" : ""
              }`}
              whileHover={{ scale: member.role !== "founder" ? 1.01 : 1 }}
              whileTap={{ scale: member.role !== "founder" ? 0.99 : 1 }}
            >
              {/* Serial Number */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                index === 0 ? "bg-warning/20 text-warning" : "bg-white/10 text-muted-foreground"
              }`}>
                {index + 1}
              </div>

              {/* Drag Handle */}
              <div className={`${member.role === "founder" ? "opacity-30" : "opacity-60 hover:opacity-100"}`}>
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Avatar */}
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="w-12 h-12 rounded-xl object-cover"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{member.full_name}</span>
                  {member.role === "founder" && (
                    <Crown className="w-4 h-4 text-warning shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>

              {/* Role Badge */}
              <RoleBadge role={member.role} size="sm" />
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {hasChanges && (
        <motion.p
          className="text-sm text-warning mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          You have unsaved changes. Click "Save Order" to apply.
        </motion.p>
      )}
    </GlassCard>
  );
};
