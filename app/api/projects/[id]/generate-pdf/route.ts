import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generatePDF } from '@/lib/pdf-generator';

/**
 * POST: 프로젝트 PDF 생성
 * 
 * POST /api/projects/[id]/generate-pdf
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;

    // 1. 프로젝트 정보 조회
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // 2. 챕터 조회
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('order', { ascending: true });

    if (chaptersError) {
      return NextResponse.json(
        { error: 'Failed to fetch chapters' },
        { status: 500 }
      );
    }

    if (!chapters || chapters.length === 0) {
      return NextResponse.json(
        { error: 'No chapters found' },
        { status: 400 }
      );
    }

    // 3. PDF 생성
    const pdfData = await generatePDF({
      title: project.title,
      chapters: chapters.map((ch) => ({
        title: ch.title,
        content: ch.content_draft,
      })),
      author: user.email?.split('@')[0] || 'Unknown',
    });

    // 4. PDF를 Base64로 인코딩하여 응답
    const base64 = Buffer.from(pdfData).toString('base64');

    return NextResponse.json({
      pdf: base64,
      filename: `${project.title}_자서전.pdf`,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
