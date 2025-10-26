-- Enable pg_vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create story_fragments table
CREATE TABLE IF NOT EXISTS story_fragments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT,
  answer TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fragment_embeddings table
CREATE TABLE IF NOT EXISTS fragment_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fragment_id UUID NOT NULL REFERENCES story_fragments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_story_fragments_project_id ON story_fragments(project_id);
CREATE INDEX IF NOT EXISTS idx_story_fragments_user_id ON story_fragments(user_id);
CREATE INDEX IF NOT EXISTS idx_fragment_embeddings_fragment_id ON fragment_embeddings(fragment_id);
CREATE INDEX IF NOT EXISTS idx_fragment_embeddings_user_id ON fragment_embeddings(user_id);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_fragment_embeddings_vector ON fragment_embeddings 
  USING ivfflat (content_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE story_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragment_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own story fragments
CREATE POLICY "Users can view their own story fragments"
  ON story_fragments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own story fragments
CREATE POLICY "Users can insert their own story fragments"
  ON story_fragments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own story fragments
CREATE POLICY "Users can update their own story fragments"
  ON story_fragments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own story fragments
CREATE POLICY "Users can delete their own story fragments"
  ON story_fragments
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can view their own fragment embeddings
CREATE POLICY "Users can view their own fragment embeddings"
  ON fragment_embeddings
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own fragment embeddings
CREATE POLICY "Users can insert their own fragment embeddings"
  ON fragment_embeddings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own fragment embeddings
CREATE POLICY "Users can delete their own fragment embeddings"
  ON fragment_embeddings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_story_fragments_updated_at
  BEFORE UPDATE ON story_fragments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


