export interface Image {
  id: string;
  project_id: string;
  fragment_id: string | null;
  chapter_id: string | null;
  user_id: string;
  url: string;
  caption: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateImageInput {
  project_id: string;
  fragment_id?: string;
  chapter_id?: string;
  url: string;
  caption?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
}

export interface UpdateImageInput {
  caption?: string;
}
