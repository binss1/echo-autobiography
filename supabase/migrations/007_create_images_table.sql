-- Create images table for user uploaded images
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  fragment_id UUID REFERENCES story_fragments(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_fragment_id ON images(fragment_id);
CREATE INDEX IF NOT EXISTS idx_images_chapter_id ON images(chapter_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own images
CREATE POLICY "Users can view their own images"
  ON images
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own images
CREATE POLICY "Users can insert their own images"
  ON images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
  ON images
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
  ON images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
