import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Send, Loader2, Megaphone } from "lucide-react";
import { useSendGlobalNotification } from "@/hooks/useNotifications";

export const GlobalNotificationSection = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  const sendGlobalNotification = useSendGlobalNotification();

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;

    await sendGlobalNotification.mutateAsync({ title, message, type });
    setTitle("");
    setMessage("");
    setType("info");
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Megaphone className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Send Global Notification</h3>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
          Admin Only
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Message *</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message..."
            className="bg-white/5 border-white/10 min-h-[80px]"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!title.trim() || !message.trim() || sendGlobalNotification.isPending}
          className="w-full gap-2"
        >
          {sendGlobalNotification.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send to All Users
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
};
