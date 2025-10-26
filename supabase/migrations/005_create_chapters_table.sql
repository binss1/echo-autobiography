-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_draft JSONB DEFAULT '[]'::jsonb,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_chapters_user_id ON chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(project_id, order);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own chapters
CREATE POLICY "Users can view their own chapters"
  ON chapters
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own chapters
CREATE POLICY "Users can insert their own chapters"
  ON chapters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own chapters
CREATE POLICY "Users can update their own chapters"
  ON chapters
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own chapters
CREATE POLICY "Users can delete their own chapters"
  ON chapters
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


