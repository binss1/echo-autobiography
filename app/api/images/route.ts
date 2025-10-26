import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET: 프로젝트의 모든 이미지 조회
 * Query params: project_id, fragment_id (optional), chapter_id (optional)
 */
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
    const fragmentId = searchParams.get('fragment_id');
    const chapterId = searchParams.get('chapter_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('images')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (fragmentId) {
      query = query.eq('fragment_id', fragmentId);
    }

    if (chapterId) {
      query = query.eq('chapter_id', chapterId);
    }

    const { data: images, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새 이미지 업로드
 * Body: { project_id, fragment_id?, chapter_id?, url, caption?, file_name?, file_size?, mime_type? }
 */
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
    const { project_id, fragment_id, chapter_id, url, caption, file_name, file_size, mime_type } = body;

    if (!project_id || !url) {
      return NextResponse.json(
        { error: 'project_id and url are required' },
        { status: 400 }
      );
    }

    const { data: image, error } = await supabase
      .from('images')
      .insert({
        project_id,
        fragment_id,
        chapter_id,
        user_id: user.id,
        url,
        caption,
        file_name,
        file_size,
        mime_type,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
