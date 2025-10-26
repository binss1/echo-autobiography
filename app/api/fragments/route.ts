import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createEmbedding } from '@/lib/openai';

// GET: 프로젝트의 모든 스토리 조각 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const { data: fragments, error } = await supabase
      .from('story_fragments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ fragments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 새 스토리 조각 생성 (Embedding 자동 생성)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { project_id, question, answer, audio_url } = body;

    if (!project_id || !answer) {
      return NextResponse.json(
        { error: 'project_id and answer are required' },
        { status: 400 }
      );
    }

    // 1. 스토리 조각 저장
    const { data: fragment, error: fragmentError } = await supabase
      .from('story_fragments')
      .insert({
        project_id,
        user_id: user.id,
        question,
        answer,
        audio_url,
      })
      .select()
      .single();

    if (fragmentError) {
      return NextResponse.json(
        { error: fragmentError.message },
        { status: 500 }
      );
    }

    // 2. Embedding 생성 및 저장
    try {
      const embedding = await createEmbedding(answer);

      const { error: embeddingError } = await supabase
        .from('fragment_embeddings')
        .insert({
          fragment_id: fragment.id,
          user_id: user.id,
          content_embedding: embedding,
        });

      if (embeddingError) {
        console.error('Failed to save embedding:', embeddingError);
        // Embedding 저장 실패는 치명적이지 않으므로 로그만 남김
      }
    } catch (embeddingError) {
      console.error('Failed to create embedding:', embeddingError);
      // Embedding 생성 실패는 치명적이지 않으므로 로그만 남김
    }

    return NextResponse.json({ fragment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


