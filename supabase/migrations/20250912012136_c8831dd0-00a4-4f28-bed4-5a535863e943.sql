-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('artist', 'arranger', 'engineer', 'admin');

-- Create enum for demo status
CREATE TYPE public.demo_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for production room status
CREATE TYPE public.room_status AS ENUM ('active', 'completed', 'paused');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo_tracks table
CREATE TABLE public.demo_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT,
  description TEXT,
  audio_url TEXT NOT NULL,
  status demo_status NOT NULL DEFAULT 'pending',
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Create production_rooms table
CREATE TABLE public.production_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_track_id UUID NOT NULL REFERENCES public.demo_tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status room_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_members table
CREATE TABLE public.room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.production_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.production_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_dm BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('demo-tracks', 'demo-tracks', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for demo_tracks
CREATE POLICY "Artists can view their own demos" 
ON public.demo_tracks FOR SELECT 
TO authenticated 
USING (artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all demos" 
ON public.demo_tracks FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Artists can insert their own demos" 
ON public.demo_tracks FOR INSERT 
TO authenticated 
WITH CHECK (artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'artist'));

CREATE POLICY "Admins can update demo status" 
ON public.demo_tracks FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for production_rooms
CREATE POLICY "Room members can view their rooms" 
ON public.production_rooms FOR SELECT 
TO authenticated 
USING (id IN (
  SELECT room_id FROM public.room_members rm
  JOIN public.profiles p ON rm.user_id = p.id
  WHERE p.user_id = auth.uid()
));

-- RLS Policies for room_members
CREATE POLICY "Users can view room memberships" 
ON public.room_members FOR SELECT 
TO authenticated 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
       EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for messages
CREATE POLICY "Room members can view room messages" 
ON public.messages FOR SELECT 
TO authenticated 
USING (
  (room_id IS NOT NULL AND room_id IN (
    SELECT room_id FROM public.room_members rm
    JOIN public.profiles p ON rm.user_id = p.id
    WHERE p.user_id = auth.uid()
  )) OR
  (is_dm = true AND (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ))
);

CREATE POLICY "Users can send messages to their rooms" 
ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (
  sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
  (
    (room_id IS NOT NULL AND room_id IN (
      SELECT room_id FROM public.room_members rm
      JOIN public.profiles p ON rm.user_id = p.id
      WHERE p.user_id = auth.uid()
    )) OR
    (is_dm = true)
  )
);

-- RLS Policies for achievements
CREATE POLICY "Public achievements are viewable" 
ON public.achievements FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can manage their own achievements" 
ON public.achievements FOR ALL 
TO authenticated 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Storage policies for demo tracks
CREATE POLICY "Artists can upload their own demo tracks" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'demo-tracks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Artists can view their own demo tracks" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'demo-tracks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all demo tracks" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'demo-tracks' AND EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'artist')::user_role,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_rooms_updated_at
  BEFORE UPDATE ON public.production_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();