import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Send, Images } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChat, ChatMessage } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { MessageBubble } from "./MessageBubble";
import { MediaGallery } from "./MediaGallery";
import { cn } from "@/lib/utils";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminMode?: boolean;
}

export const ChatModal = ({ open, onOpenChange, adminMode = false }: ChatModalProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, addReaction, markAsSeen, deleteMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark visible messages as seen
  useEffect(() => {
    if (open && user) {
      messages.forEach((msg) => {
        if (!msg.seen_by.some((s) => s.user_id === user.id)) {
          markAsSeen(msg.id);
        }
      });
    }
  }, [open, messages, user, markAsSeen]);

  const handleSend = async () => {
    if ((!inputValue.trim() && selectedImages.length === 0) || sending) return;

    setSending(true);
    await sendMessage(inputValue, selectedImages);
    setInputValue("");
    setSelectedImages([]);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (showMediaGallery) {
    return (
      <MediaGallery 
        open={open} 
        onOpenChange={onOpenChange}
        onBack={() => setShowMediaGallery(false)}
        adminMode={adminMode}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 bg-background/95 backdrop-blur-xl border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <h2 className="font-semibold">Mess Family Chat</h2>
              <p className="text-xs text-muted-foreground">
                {adminMode ? "Admin Mode - Delete Enabled" : "All members"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMediaGallery(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Images className="w-4 h-4 mr-2" />
              All Media
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <span className="text-4xl mb-2">💬</span>
              <p>No messages yet</p>
              <p className="text-sm">Be the first to say hello!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  onReact={(reaction) => addReaction(message.id, reaction)}
                  onDelete={adminMode ? () => deleteMessage(message.id) : undefined}
                  showSeen={index === messages.length - 1 || message.seen_by.length > 0}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Selected Images Preview */}
        <AnimatePresence>
          {selectedImages.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 p-3"
            >
              <div className="flex gap-2 overflow-x-auto">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Selected"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 focus-within:border-primary/50 transition-colors">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent px-4 py-3 resize-none outline-none text-sm max-h-32"
                style={{ minHeight: "44px" }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={(!inputValue.trim() && selectedImages.length === 0) || sending}
              className="shrink-0 rounded-full w-10 h-10 p-0"
            >
              {sending ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
