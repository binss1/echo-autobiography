import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { openai } from '@/lib/openai';
import { streamText } from 'ai';
import { searchRelevantContext } from '@/lib/rag';

/**
 * RAG 기반 AI 질문 생성 스트리밍 API
 * 
 * POST /api/ai/chat
 * 
 * Request Body:
 * {
 *   "project_id": "uuid",
 *   "conversation_history": [
 *     { "role": "user", "content": "답변 내용" },
 *     { "role": "assistant", "content": "질문 내용" }
 *   ]
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
    const { project_id, conversation_history } = body;

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    // 1. RAG: 관련 있는 과거 대화 검색 (최근 답변 3개)
    const recentAnswers = conversation_history
      .filter((msg: any) => msg.role === 'user')
      .slice(-3)
      .map((msg: any) => msg.content)
      .join(' ');

    const ragContext = await searchRelevantContext(
      user.id,
      project_id,
      recentAnswers || '자서전',
      3 // 최대 3개의 관련 대화
    );

    // 2. System Prompt 구성
    const systemPrompt = `당신은 친근하고 따뜻한 AI 인터뷰어입니다. 시니어 사용자에게 그들의 삶의 이야기를 자연스럽게 듣고 있습니다.

**목표:**
- 사용자의 과거 경험을 깊이 있게 탐구
- 감정과 세부 사항을 이끌어내는 질문
- 자연스러운 대화 흐름 유지

**제약사항:**
- 한 번에 하나의 질문만
- 질문은 간결하고 이해하기 쉬워야 함
- 이야기를 듣는 자세로 공감과 호기심 표현

**이전 대화 맥락:**
${ragContext.length > 0 
  ? ragContext.map((ctx, i) => 
      `\n${i + 1}. Q: ${ctx.question || '(질문 없음)'}\n   A: ${ctx.answer}`
    ).join('\n')
  : '(아직 대화가 없습니다)'}`;

    // 3. Conversation History를 OpenAI 형식으로 변환
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversation_history.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // 4. OpenAI Streaming 응답 생성
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      temperature: 0.7,
      maxTokens: 200,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


