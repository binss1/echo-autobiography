import { createClient } from '@/lib/supabase/server';
import { createEmbedding } from '@/lib/openai';
import type { RAGContext } from '@/types/fragment';

/**
 * RAG: 사용자의 답변을 기반으로 관련 있는 과거 대화를 검색합니다.
 * @param userId - 사용자 ID
 * @param projectId - 프로젝트 ID
 * @param queryText - 검색할 텍스트 (사용자의 답변 또는 질문)
 * @param limit - 반환할 결과의 최대 개수 (기본값: 5)
 * @returns 관련 있는 과거 대화 맥락 배열
 */
export async function searchRelevantContext(
  userId: string,
  projectId: string,
  queryText: string,
  limit: number = 5
): Promise<RAGContext[]> {
  const supabase = createClient();

  // 1. 쿼리 텍스트를 임베딩으로 변환
  const queryEmbedding = await createEmbedding(queryText);

  // 2. Supabase 벡터 검색 (cosine similarity)
  const { data: results, error } = await supabase.rpc('match_fragments', {
    query_embedding: queryEmbedding,
    match_project_id: projectId,
    match_user_id: userId,
    match_threshold: 0.5, // 유사도 임계값
    match_count: limit,
  });

  if (error) {
    console.error('Error in RAG search:', error);
    return [];
  }

  // 3. 결과를 RAGContext 형식으로 변환
  return results.map((r: any) => ({
    fragment_id: r.fragment_id,
    question: r.question,
    answer: r.answer,
    similarity: r.similarity,
  }));
}

/**
 * Supabase 데이터베이스에 match_fragments 함수를 생성합니다.
 * 이 함수는 벡터 유사도 검색을 수행합니다.
 * 
 * SQL 함수 (Supabase SQL Editor에서 실행):
 * ```sql
 * CREATE OR REPLACE FUNCTION match_fragments(
 *   query_embedding vector(1536),
 *   match_project_id uuid,
 *   match_user_id uuid,
 *   match_threshold float,
 *   match_count int
 * )
 * RETURNS TABLE (
 *   fragment_id uuid,
 *   question text,
 *   answer text,
 *   similarity float
 * )
 * LANGUAGE plpgsql
 * AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     sf.id,
 *     sf.question,
 *     sf.answer,
 *     1 - (fe.content_embedding <=> query_embedding) as similarity
 *   FROM story_fragments sf
 *   INNER JOIN fragment_embeddings fe ON sf.id = fe.fragment_id
 *   WHERE sf.project_id = match_project_id
 *     AND sf.user_id = match_user_id
 *     AND 1 - (fe.content_embedding <=> query_embedding) > match_threshold
 *   ORDER BY fe.content_embedding <=> query_embedding
 *   LIMIT match_count;
 * END;
 * $$;
 * ```
 */


