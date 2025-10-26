import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { openai } from '@/lib/openai';

/**
 * AI 기반 문장 다듬기 API
 * 
 * POST /api/ai/refine
 * 
 * Request Body:
 * {
 *   "text": "원본 텍스트",
 *   "tone": "warm" | "formal" | "casual" (기본값: "warm")
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
    const { text, tone = 'warm' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    const toneMap: Record<string, string> = {
      warm: '따뜻하고 감성적인',
      formal: '정중하고 격식 있는',
      casual: '편안하고 친근한',
    };

    const systemPrompt = `당신은 전문 편집자입니다. 주어진 텍스트를 문법을 교정하고, 문체를 더 ${toneMap[tone] || '따뜻하고 감성적인'} 톤으로 다듬어주세요.

**주의사항:**
- 원본의 의미와 사실을 절대 변경하지 않습니다
- 문장의 구조를 자연스럽게 개선합니다
- 오탈자와 맞춤법을 교정합니다
- 명확하고 읽기 쉽게 다듬습니다
- 불필요한 수식어나 과장된 표현은 제거합니다`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `다음 텍스트를 다듬어주세요:\n\n${text}` },
      ],
      temperature: 0.3, // 일관성 있는 결과를 위해 낮은 temperature
      max_tokens: 500,
    });

    const refinedText = response.choices[0].message.content;

    if (!refinedText) {
      return NextResponse.json(
        { error: 'Failed to refine text' },
        { status: 500 }
      );
    }

    return NextResponse.json({ refinedText });
  } catch (error) {
    console.error('AI refine error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
