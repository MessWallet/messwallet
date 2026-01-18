import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface MediaItem {
  id: string;
  image_url: string;
  created_at: string;
  message_id: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

interface MediaGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  adminMode?: boolean;
}

export const MediaGallery = ({
  open,
  onOpenChange,
  onBack,
  adminMode,
}: MediaGalleryProps) => {
  const { getAllMedia } = useChat();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const data = await getAllMedia();
      setMedia(data);
      setLoading(false);
    };

    if (open) {
      fetchMedia();
    }
  }, [open, getAllMedia]);

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from storage
      const path = imageUrl.split("/chat-images/")[1];
      if (path) {
        await supabase.storage.from("chat-images").remove([path]);
      }

      // Delete from database
      await supabase.from("chat_message_images").delete().eq("id", imageId);
      
      setMedia((prev) => prev.filter((m) => m.id !== imageId));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl h-[85vh] p-0 bg-background/95 backdrop-blur-xl border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold">All Media</h2>
              <p className="text-xs text-muted-foreground">
                {media.length} photos
              </p>
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Gallery */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <span className="text-4xl mb-2">📷</span>
                <p>No photos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={item.image_url}
                      alt="Media"
                      className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewImage(item.image_url)}
                    />
                    
                    {/* Overlay with info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs text-white/80 truncate">
                          {item.sender?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-white/60">
                          {format(new Date(item.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-white/60">
                          {format(new Date(item.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Delete button for admin */}
                    {adminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(item.id, item.image_url);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image preview */}
      <ImagePreviewModal
        open={!!previewImage}
        onOpenChange={() => setPreviewImage(null)}
        imageUrl={previewImage || ""}
      />
    </>
  );
};
