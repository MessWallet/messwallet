import { useState } from "react";
import { format } from "date-fns";
import { Trash2, SmilePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { ImagePreviewModal } from "./ImagePreviewModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onReact: (reaction: string) => void;
  onDelete?: () => void;
  showSeen?: boolean;
}

const REACTIONS = ["👍", "❤️", "😂", "😡", "👎"];

export const MessageBubble = ({
  message,
  isOwn,
  onReact,
  onDelete,
  showSeen,
}: MessageBubbleProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);

  const senderName = message.sender?.full_name || "Unknown User";
  const senderAvatar = message.sender?.avatar_url || "/placeholder.svg";
  const messageTime = format(new Date(message.created_at), "h:mm a");

  // Group reactions by type
  const groupedReactions = message.reactions.reduce((acc, r) => {
    if (!acc[r.reaction]) {
      acc[r.reaction] = [];
    }
    acc[r.reaction].push(r);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex gap-2", isOwn && "flex-row-reverse")}
      >
        {/* Avatar */}
        <img
          src={senderAvatar}
          alt={senderName}
          className="w-8 h-8 rounded-full object-cover shrink-0 self-end"
        />

        <div className={cn("max-w-[70%]", isOwn && "items-end")}>
          {/* Sender name and time */}
          <div
            className={cn(
              "flex items-center gap-2 mb-1 text-xs",
              isOwn && "flex-row-reverse"
            )}
          >
            <span className="text-muted-foreground/70">{senderName}</span>
            <span className="text-muted-foreground/50">{messageTime}</span>
          </div>

          {/* Message bubble */}
          <div
            className={cn(
              "relative group rounded-2xl px-4 py-2",
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-white/10 rounded-bl-sm"
            )}
          >
            {/* Text content */}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {/* Images */}
            {message.images.length > 0 && (
              <div
                className={cn(
                  "grid gap-1 mt-2",
                  message.images.length === 1 && "grid-cols-1",
                  message.images.length === 2 && "grid-cols-2",
                  message.images.length >= 3 && "grid-cols-2"
                )}
              >
                {message.images.map((img, index) => (
                  <motion.img
                    key={img.id}
                    src={img.image_url}
                    alt="Chat image"
                    className={cn(
                      "rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity",
                      message.images.length === 1
                        ? "max-w-full max-h-64"
                        : "w-full h-32"
                    )}
                    onClick={() => setPreviewImage(img.image_url)}
                    whileHover={{ scale: 1.02 }}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                isOwn ? "-left-16" : "-right-16"
              )}
            >
              <Popover open={showReactions} onOpenChange={setShowReactions}>
                <PopoverTrigger asChild>
                  <button className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <SmilePlus className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side={isOwn ? "left" : "right"}
                  className="w-auto p-2 bg-background/95 backdrop-blur-xl border-white/10"
                >
                  <div className="flex gap-1">
                    {REACTIONS.map((reaction) => (
                      <motion.button
                        key={reaction}
                        onClick={() => {
                          onReact(reaction);
                          setShowReactions(false);
                        }}
                        className="text-xl p-1 hover:bg-white/10 rounded transition-colors"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {reaction}
                      </motion.button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-full bg-destructive/20 hover:bg-destructive/40 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-1 mt-1",
                isOwn && "justify-end"
              )}
            >
              {Object.entries(groupedReactions).map(([reaction, users]) => (
                <motion.button
                  key={reaction}
                  onClick={() => onReact(reaction)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{reaction}</span>
                  <span className="text-muted-foreground">{users.length}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Seen by */}
          {showSeen && message.seen_by.length > 0 && (
            <div
              className={cn(
                "flex -space-x-1 mt-1",
                isOwn && "justify-end"
              )}
            >
              {message.seen_by.slice(0, 5).map((seen) => (
                <img
                  key={seen.id}
                  src={seen.user?.avatar_url || "/placeholder.svg"}
                  alt={seen.user?.full_name || "User"}
                  title={`Seen by ${seen.user?.full_name}`}
                  className="w-4 h-4 rounded-full border border-background object-cover"
                />
              ))}
              {message.seen_by.length > 5 && (
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px]">
                  +{message.seen_by.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Image preview modal */}
      <ImagePreviewModal
        open={!!previewImage}
        onOpenChange={() => setPreviewImage(null)}
        imageUrl={previewImage || ""}
      />
    </>
  );
};
