import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
}

export const ImagePreviewModal = ({
  open,
  onOpenChange,
  imageUrl,
}: ImagePreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black/90 border-white/10">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </Button>
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-auto max-h-[85vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
