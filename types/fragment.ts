export interface StoryFragment {
  id: string;
  project_id: string;
  user_id: string;
  question: string | null;
  answer: string;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FragmentEmbedding {
  id: string;
  fragment_id: string;
  user_id: string;
  content_embedding: number[]; // vector(1536)
  created_at: string;
}

export interface CreateFragmentInput {
  project_id: string;
  question?: string;
  answer: string;
  audio_url?: string;
}

export interface UpdateFragmentInput {
  question?: string;
  answer?: string;
  audio_url?: string;
}

export interface RAGContext {
  fragment_id: string;
  question: string | null;
  answer: string;
  similarity: number;
}


