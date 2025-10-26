export interface Chapter {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  content_draft: any; // JSONB from Tiptap
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChapterInput {
  project_id: string;
  title: string;
  content_draft?: any;
  order: number;
}

export interface UpdateChapterInput {
  title?: string;
  content_draft?: any;
  order?: number;
}


