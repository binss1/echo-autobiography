import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { openai } from '@/lib/openai';

/**
 * AI 기반 자서전 챕터 초안 생성 API
 * 
 * POST /api/generate-chapters
 * 
 * Request Body:
 * {
 *   "project_id": "uuid"
 * }
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
    const { project_id } = body;

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    // 1. 프로젝트의 모든 스토리 조각 가져오기
    const { data: fragments, error: fragmentsError } = await supabase
      .from('story_fragments')
      .select('*')
      .eq('project_id', project_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (fragmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch story fragments' },
        { status: 500 }
      );
    }

    if (!fragments || fragments.length === 0) {
      return NextResponse.json(
        { error: 'No story fragments found. Please create some stories first.' },
        { status: 400 }
      );
    }

    // 2. 스토리 조각을 프롬프트로 변환
    const storiesText = fragments
      .map((f: any, index: number) => {
        const question = f.question ? `질문: ${f.question}\n` : '';
        return `### 에피소드 ${index + 1}\n${question}답변: ${f.answer}\n`;
      })
      .join('\n');

    // 3. OpenAI API 호출 - 챕터 구조 및 내용 생성
    const systemPrompt = `당신은 전문 자서전 편집자입니다. 주어진 개인 스토리들을 바탕으로 체계적이고 감동적인 자서전 챕터를 구성하고 작성해야 합니다.

**작업:**
1. 스토리들을 시간순(유년기 → 청년기 → 성인기 → 노년기) 또는 주제별로 분류
2. 각 챕터에 적절한 제목 부여
3. 각 챕터의 서사적 본문 작성 (원본 스토리를 문체를 자연스럽게 다듬어서 포함)

**출력 형식 (JSON):**
{
  "chapters": [
    {
      "title": "챕터 제목",
      "content": "챕터 본문 내용 (자연스러운 서사 형식으로 작성)",
      "order": 1
    }
  ]
}

**주의사항:**
- 원본 스토리의 내용을 최대한 보존하되, 문체를 다듬어 읽기 쉽게 작성
- 각 챕터는 300-500자 정도의 분량으로 구성
- 감정과 세부사항을 잘 살려서 생동감 있게 작성`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `다음은 한 분의 생애 이야기들입니다:\n\n${storiesText}\n\n위 스토리들을 바탕으로 자서전 챕터를 구성하고 작성해주세요.` },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const generatedText = response.choices[0].message.content;
    if (!generatedText) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    // 4. JSON 파싱
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const chapters = parsedData.chapters || [];

    // 5. 기존 챕터 삭제 (새로 생성하기 전에)
    await supabase
      .from('chapters')
      .delete()
      .eq('project_id', project_id)
      .eq('user_id', user.id);

    // 6. 새로운 챕터 저장
    const chapterInserts = chapters.map((chapter: any, index: number) => ({
      project_id,
      user_id: user.id,
      title: chapter.title || `챕터 ${index + 1}`,
      content_draft: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: chapter.content?.split('\n').map((line: string) => ({
              type: 'text',
              text: line,
            })),
          },
        ],
      },
      order: chapter.order || index + 1,
    }));

    const { data: createdChapters, error: insertError } = await supabase
      .from('chapters')
      .insert(chapterInserts)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // 7. 프로젝트 상태 업데이트
    await supabase
      .from('projects')
      .update({ status: 'in_progress' })
      .eq('id', project_id)
      .eq('user_id', user.id);

    return NextResponse.json({
      chapters: createdChapters,
      message: 'Chapters generated successfully',
    });
  } catch (error) {
    console.error('Error generating chapters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


