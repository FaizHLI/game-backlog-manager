-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  theme_preference TEXT DEFAULT 'system',
  show_completed_games BOOLEAN DEFAULT TRUE,
  default_view TEXT DEFAULT 'grid',
  default_sort TEXT DEFAULT 'title-asc'
);

-- Create a table for games
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  igdb_id INTEGER,
  title TEXT NOT NULL,
  cover_url TEXT,
  platform TEXT,
  release_date DATE,
  developer TEXT,
  publisher TEXT,
  genres TEXT[] DEFAULT '{}',
  status TEXT NOT NULL,
  progress INTEGER,
  rating NUMERIC,
  play_time INTEGER,
  notes TEXT,
  added_date DATE DEFAULT CURRENT_DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_igdb_id ON games(igdb_id);

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up a trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Set up Row Level Security (RLS) for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Set up Row Level Security (RLS) for the games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON games FOR DELETE
  USING (auth.uid() = user_id);