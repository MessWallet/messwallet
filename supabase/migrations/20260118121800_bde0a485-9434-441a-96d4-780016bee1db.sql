-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_message_images table for multiple images per message
CREATE TABLE public.chat_message_images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_reactions table
CREATE TABLE public.chat_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction TEXT NOT NULL CHECK (reaction IN ('👍', '❤️', '😂', '😡', '👎')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id, reaction)
);

-- Create chat_seen table
CREATE TABLE public.chat_seen (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS on all chat tables
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_message_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_seen ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Authenticated users can view all messages"
ON public.chat_messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can delete any message"
ON public.chat_messages FOR DELETE
USING (is_admin(auth.uid()));

-- Chat images policies
CREATE POLICY "Authenticated users can view all images"
ON public.chat_message_images FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add images to their messages"
ON public.chat_message_images FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.chat_messages 
    WHERE id = message_id AND sender_id = auth.uid()
));

CREATE POLICY "Admins can delete any image"
ON public.chat_message_images FOR DELETE
USING (is_admin(auth.uid()));

-- Chat reactions policies
CREATE POLICY "Authenticated users can view all reactions"
ON public.chat_reactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add reactions"
ON public.chat_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
ON public.chat_reactions FOR DELETE
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Chat seen policies
CREATE POLICY "Authenticated users can view seen status"
ON public.chat_seen FOR SELECT
USING (true);

CREATE POLICY "Users can mark messages as seen"
ON public.chat_seen FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete seen records"
ON public.chat_seen FOR DELETE
USING (is_admin(auth.uid()));

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true);

-- Storage policies for chat images
CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete chat images"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-images' AND is_admin(auth.uid()));

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_message_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_seen;

-- Create indexes for performance
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_images_message_id ON public.chat_message_images(message_id);
CREATE INDEX idx_chat_reactions_message_id ON public.chat_reactions(message_id);
CREATE INDEX idx_chat_seen_message_id ON public.chat_seen(message_id);