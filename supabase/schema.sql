-- Agile Self - Supabase Database Schema
-- Version: 1.0
-- Description: PostgreSQL schema for KPTA retrospective application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Note: Supabase Auth handles the auth.users table
-- This is the public profile table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_frequency TEXT CHECK (reminder_frequency IN ('weekly', 'monthly')) DEFAULT 'weekly',
  reminder_day TEXT DEFAULT 'Sunday',
  reminder_time TIME DEFAULT '18:00:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RETROSPECTIVES TABLE
-- =====================================================
CREATE TABLE public.retrospectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  period_type TEXT CHECK (period_type IN ('weekly', 'monthly')) DEFAULT 'weekly',
  period_start_date DATE,
  period_end_date DATE,
  status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- KEEPS TABLE
-- =====================================================
CREATE TABLE public.keeps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retrospective_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROBLEMS TABLE
-- =====================================================
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retrospective_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRIES TABLE
-- =====================================================
CREATE TABLE public.tries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retrospective_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIONS TABLE
-- =====================================================
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  retrospective_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
  try_id UUID REFERENCES public.tries(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_retrospectives_user_id ON public.retrospectives(user_id);
CREATE INDEX idx_retrospectives_created_at ON public.retrospectives(created_at DESC);
CREATE INDEX idx_retrospectives_status ON public.retrospectives(status, user_id);

CREATE INDEX idx_keeps_retrospective_id ON public.keeps(retrospective_id);
CREATE INDEX idx_problems_retrospective_id ON public.problems(retrospective_id);
CREATE INDEX idx_tries_retrospective_id ON public.tries(retrospective_id);

CREATE INDEX idx_actions_user_id ON public.actions(user_id);
CREATE INDEX idx_actions_completed ON public.actions(is_completed, user_id);
CREATE INDEX idx_actions_retrospective_id ON public.actions(retrospective_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keeps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Retrospectives policies
CREATE POLICY "Users can view own retrospectives"
  ON public.retrospectives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retrospectives"
  ON public.retrospectives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own retrospectives"
  ON public.retrospectives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own retrospectives"
  ON public.retrospectives FOR DELETE
  USING (auth.uid() = user_id);

-- Keeps policies
CREATE POLICY "Users can view own keeps"
  ON public.keeps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = keeps.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own keeps"
  ON public.keeps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = keeps.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own keeps"
  ON public.keeps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = keeps.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own keeps"
  ON public.keeps FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = keeps.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

-- Problems policies
CREATE POLICY "Users can view own problems"
  ON public.problems FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = problems.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own problems"
  ON public.problems FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = problems.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own problems"
  ON public.problems FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = problems.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own problems"
  ON public.problems FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = problems.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

-- Tries policies
CREATE POLICY "Users can view own tries"
  ON public.tries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = tries.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tries"
  ON public.tries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = tries.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tries"
  ON public.tries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = tries.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tries"
  ON public.tries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.retrospectives
    WHERE retrospectives.id = tries.retrospective_id
    AND retrospectives.user_id = auth.uid()
  ));

-- Actions policies
CREATE POLICY "Users can view own actions"
  ON public.actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions"
  ON public.actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON public.actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions"
  ON public.actions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retrospectives_updated_at
  BEFORE UPDATE ON public.retrospectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================
-- Uncomment to insert sample data for testing

/*
-- Sample user (requires auth.users entry first)
INSERT INTO public.users (id, email, display_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@agileSelf.com', 'Demo User');

INSERT INTO public.user_preferences (user_id) VALUES
  ('00000000-0000-0000-0000-000000000001');

-- Sample retrospective
INSERT INTO public.retrospectives (id, user_id, title, period_type, period_start_date, period_end_date, status) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Week 1 Retrospective', 'weekly', '2025-10-16', '2025-10-22', 'completed');

-- Sample keeps
INSERT INTO public.keeps (retrospective_id, text, order_index) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Completed project milestone on time', 0),
  ('00000000-0000-0000-0000-000000000011', 'Had productive team meetings', 1);

-- Sample problems
INSERT INTO public.problems (retrospective_id, text, order_index) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Too many distractions during work', 0),
  ('00000000-0000-0000-0000-000000000011', 'Poor sleep quality this week', 1);

-- Sample tries
INSERT INTO public.tries (retrospective_id, text, order_index) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Use Pomodoro technique for focused work', 0),
  ('00000000-0000-0000-0000-000000000011', 'Establish bedtime routine', 1);

-- Sample actions
INSERT INTO public.actions (user_id, retrospective_id, text, is_completed, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Download Pomodoro timer app', false, 0),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Set phone to Do Not Disturb from 10 PM', true, 1);
*/
