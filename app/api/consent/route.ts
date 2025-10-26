import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET: 사용자의 모든 동의 기록 조회
export async function GET() {
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

    const { data: consents, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ consents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 새 동의 기록 생성
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
    const { consent_type, granted, ip_address, user_agent } = body;

    if (!consent_type) {
      return NextResponse.json(
        { error: 'Consent type is required' },
        { status: 400 }
      );
    }

    // 이미 동의한 기록이 있으면 철회로 표시
    if (!granted) {
      await supabase
        .from('consent_records')
        .update({ withdrawn_at: new Date().toISOString(), granted: false })
        .eq('user_id', user.id)
        .eq('consent_type', consent_type)
        .is('withdrawn_at', null);
    }

    const { data: consent, error } = await supabase
      .from('consent_records')
      .insert({
        user_id: user.id,
        consent_type,
        granted,
        ip_address,
        user_agent,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ consent }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


