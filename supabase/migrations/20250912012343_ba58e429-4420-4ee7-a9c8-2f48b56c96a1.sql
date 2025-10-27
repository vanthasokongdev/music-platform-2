-- Create demo_tracks table (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'demo_tracks') THEN
    CREATE TABLE public.demo_tracks (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      genre TEXT,
      description TEXT,
      audio_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      feedback TEXT,
      submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      reviewed_by UUID REFERENCES public.profiles(id)
    );
    
    ALTER TABLE public.demo_tracks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create production_rooms table (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'production_rooms') THEN
    CREATE TABLE public.production_rooms (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      demo_track_id UUID REFERENCES public.demo_tracks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.production_rooms ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create room_members table (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'room_members') THEN
    CREATE TABLE public.room_members (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      room_id UUID NOT NULL REFERENCES public.production_rooms(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(room_id, user_id)
    );
    
    ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create messages table (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    CREATE TABLE public.messages (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      room_id UUID REFERENCES public.production_rooms(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_dm BOOLEAN NOT NULL DEFAULT false,
      sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create achievements table (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'achievements') THEN
    CREATE TABLE public.achievements (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      project_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create storage buckets (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'demo-tracks') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('demo-tracks', 'demo-tracks', false);
  END IF;
  
  IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
  END IF;
END $$;