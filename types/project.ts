export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'in_progress' | 'completed';
  default_outline: DefaultOutlineItem[];
  created_at: string;
  updated_at: string;
}

export interface DefaultOutlineItem {
  title: string;
  description?: string;
  order: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: 'draft' | 'in_progress' | 'completed';
}


