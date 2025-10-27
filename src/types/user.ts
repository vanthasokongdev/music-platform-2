export type UserRole = 'artist' | 'arranger' | 'engineer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  display_name: string;
  bio?: string;
  avatar_url?: string;
  achievements?: string[];
  specialties?: string[];
  rating?: number;
  projects_count?: number;
  portfolio_links?: string[];
}

export interface DemoTrack {
  id: string;
  artist_id: string;
  title: string;
  genre: string;
  description?: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ProductionRoom {
  id: string;
  demo_track_id: string;
  artist_id: string;
  arranger_id?: string;
  engineer_id?: string;
  admin_id: string;
  status: 'setup' | 'in_progress' | 'review' | 'completed';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  file_url?: string;
  created_at: string;
}