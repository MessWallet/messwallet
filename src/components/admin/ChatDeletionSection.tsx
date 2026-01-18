import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChatModal } from "@/components/chat/ChatModal";
import { useChat } from "@/hooks/useChat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ChatDeletionSection = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { deleteAllChat } = useChat();

  const handleDeleteAll = async () => {
    await deleteAllChat();
    setConfirmDelete(false);
  };

  return (
    <>
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Delete Chat</h3>
            <p className="text-sm text-muted-foreground">
              Manage and delete chat messages
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Open Chat (Admin Mode)
          </Button>
          
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Chat History
          </Button>
        </div>
      </GlassCard>

      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        adminMode={true}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete All Chat History
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL messages, photos, reactions, and
              seen data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
