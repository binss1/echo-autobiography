-- Create match_fragments function for vector similarity search
CREATE OR REPLACE FUNCTION match_fragments(
  query_embedding vector(1536),
  match_project_id uuid,
  match_user_id uuid,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  fragment_id uuid,
  question text,
  answer text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sf.id,
    sf.question,
    sf.answer,
    1 - (fe.content_embedding <=> query_embedding) as similarity
  FROM story_fragments sf
  INNER JOIN fragment_embeddings fe ON sf.id = fe.fragment_id
  WHERE sf.project_id = match_project_id
    AND sf.user_id = match_user_id
    AND 1 - (fe.content_embedding <=> query_embedding) > match_threshold
  ORDER BY fe.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


