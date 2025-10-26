-- Create generation_queue table for async batch job processing
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_generation_queue_project_id ON generation_queue(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_queue_user_id ON generation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_queue_status ON generation_queue(status);

-- Enable Row Level Security
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own generation queue items
CREATE POLICY "Users can view their own generation queue"
  ON generation_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own generation queue items
CREATE POLICY "Users can insert their own generation queue"
  ON generation_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own generation queue items
CREATE POLICY "Users can update their own generation queue"
  ON generation_queue
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own generation queue items
CREATE POLICY "Users can delete their own generation queue"
  ON generation_queue
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_generation_queue_updated_at
  BEFORE UPDATE ON generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


