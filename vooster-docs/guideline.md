```markdown

-----

# ECHO Project - Code Guidelines

## 1\. Project Overview

ECHO 프로젝트는 시니어와 그 가족들이 자신의 삶의 이야기를 기록하고 AI의 도움을 받아 고품질의 자서전을 만들 수 있도록 지원하는 LLM 기반 AI 자서전 플랫폼입니다. Next.js, Supabase, OpenAI API, TailwindCSS를 핵심 기술로 활용합니다. 주요 아키텍처는 성능을 위한 서버 컴포넌트 렌더링, 강력한 인증 시스템, AI 기반 콘텐츠 생성, 그리고 반응형 및 접근성 높은 UI를 특징으로 합니다.

## 2\. Core Principles

  * **유지보수성 (Maintainability)**: 이해하고, 수정하고, 디버깅하기 쉬운 코드를 작성합니다.
  * **가독성 (Readability)**: 코드는 명확하고 간결하며, 잘 문서화되어야 합니다.
  * **테스트 용이성 (Testability)**: 쉽게 테스트하고 검증할 수 있도록 코드를 설계합니다.
  * **성능 (Performance)**: 속도와 효율성을 위해 코드를 최적화합니다.
  * **보안 (Security)**: 사용자 데이터 보호를 위해 보안 코딩 관행을 최우선으로 합니다.

## 3\. Language-Specific Guidelines

### 3.1. TypeScript (ECMAScript Next)

  * **프로젝트 언어**: 본 프로젝트는 **TypeScript** 사용을 **강력히 권장**합니다. 타입 안정성을 통해 런타임 에러를 줄이고, 코드 자동 완성을 강화하며, 유지보수성을 크게 향상시킵니다.
  * **파일 조직 및 디렉터리 구조:** (Next.js App Router 기준)
      * `app/`: App Router 기반 라우팅 및 페이지 컴포넌트.
      * `components/`: 재사용 가능한 UI 컴포넌트 (프레젠테이션 로직).
          * `ui/`: (shadcn/ui와 유사) 버튼, 인풋 등 원자적(Atomic) 컴포넌트.
          * `common/`: 여러 페이지에서 사용되는 공통 컴포넌트 (예: `Header`, `Footer`).
          * `features/`: 특정 도메인/기능과 관련된 복합 컴포넌트 (예: `AutobiographyEditor`).
      * `lib/`: 핵심 비즈니스 로직, 외부 API 클라이언트, 유틸리티.
          * `supabaseClient.ts`: Supabase 클라이언트 인스턴스 (서버/클라이언트 구분).
          * `openaiClient.ts`: OpenAI API 클라이언트 인스턴스.
          * `utils.ts`: 순수 헬퍼 함수 (예: `formatDate`, `cn` - `clsx` + `tailwind-merge`).
          * `db.ts`: (선택적) 데이터베이스 쿼리 로직 추상화.
      * `hooks/`: 커스텀 React 훅 (예: `useAuth`).
      * `types/`: 전역 또는 공유 TypeScript 타입 정의 (예: `supabase.types.ts`).
      * `app/api/`: API 라우트 핸들러.
  * **Import/Dependency 관리:**
      * 내부 모듈 import 시 절대 경로 사용 (`@/components/Button` vs `../../components/Button`). `tsconfig.json`의 `paths` 별칭을 구성합니다.
      * 의존성 설치는 `pnpm install` 또는 `npm install` 사용. `package.json`에 버전을 명시합니다.
      * **Import 순서**: 1) React/Next.js 2) 외부 라이브러리 3) 내부 절대 경로 (`@/`) 4) 상대 경로 (`./`, `../`).
  * **에러 핸들링 패턴:**
      * 비동기 작업(API 호출) 시 `try...catch` 블록을 사용합니다.
      * React 컴포넌트의 오류 처리를 위해 **Error Boundaries** (`error.tsx`)를 적극 활용합니다.
      * 프로덕션 환경에서는 `console.error` 대신 **Sentry**와 같은 중앙 집중식 로깅 서비스에 에러를 전송합니다.

<!-- end list -->

```typescript
// MUST: API 호출 시 try...catch 및 Sentry 사용
import { Sentry } from '@/lib/sentry'; // 가상 Sentry 클라이언트

async function fetchData(userId: string) {
  try {
    const response = await fetch(`/api/user/${userId}`);
    if (!response.ok) {
      // 4xx, 5xx 에러를 명시적으로 throw
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching data:", error);
    } else {
      // 프로덕션에서는 Sentry로 에러 리포트
      Sentry.captureException(error, { tags: { context: "fetchData" } });
    }
    // 사용자에게 친화적인 에러 메시지 반환 또는 null
    return null;
  }
}

// MUST NOT: 에러 무시
async function fetchDataBad() {
  // 네트워크 에러, 404, 500 등 예외 상황 처리 불가
  const response = await fetch('/api/data'); 
  const data = await response.json();
  return data;
}
// Explanation: 잠재적인 네트워크 오류나 유효하지 않은 응답을 처리하지 않아 앱이 비정상 종료될 수 있습니다.
```

### 3.2. Next.js (App Router)

  * **파일 조직:** `app/` 디렉터리 기반 라우팅 시스템을 따릅니다.
      * `app/layout.tsx`: 루트 레이아웃 (필수).
      * `app/page.tsx`: 홈페이지 (`/`).
      * `app/dashboard/page.tsx`: `/dashboard` 라우트.
      * `app/loading.tsx`: 기본 로딩 UI.
      * `app/error.tsx`: 기본 에러 바운더리.
  * **API Routes:** `app/api/` 디렉터리 내 `route.ts` (또는 `.js`) 파일을 사용합니다.
  * **데이터 페칭:**
      * **서버 컴포넌트 (기본):** `async` 함수로 컴포넌트를 선언하고 `fetch`, `await`를 직접 사용합니다. (SSG, SSR, ISR 동작 제어는 `fetch`의 `cache` 옵션 또는 `revalidate` 옵션으로 처리)
      * **클라이언트 컴포넌트 (`'use client'`):** `useEffect` 또는 `SWR`, `React Query`를 사용하여 클라이언트 사이드에서 데이터를 페칭합니다.
      * **Server Actions:** 폼(Form) 제출 및 데이터 변경(Mutation)에 `Server Actions` 사용을 적극 권장합니다. (클라이언트 JS 없이 폼 처리 가능)

<!-- end list -->

```typescript
// MUST: 서버 컴포넌트에서의 데이터 페칭 (App Router)
// app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 이 컴포넌트는 기본적으로 서버 컴포넌트입니다.
async function getDashboardData() {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase.from('projects').select('*');
  if (error) throw new Error('Failed to fetch data');
  return data;
}

export default async function DashboardPage() {
  const data = await getDashboardData(); // 서버에서 직접 데이터 페칭

  return (
    <div>
      {data.map(project => <div key={project.id}>{project.title}</div>)}
    </div>
  );
}

// MUST NOT: 서버 컴포넌트에서 useEffect 사용
// app/some-page/page.tsx (잘못된 예시)
// import { useEffect, useState } from 'react'; // 서버 컴포넌트에서 이 훅들은 동작하지 않습니다.

export default function MyPage() {
  // const [data, setData] = useState(null); // 에러 발생

  // useEffect(() => { ... }, []); // 에러 발생

  return (
    // ...
  );
}
// Explanation: 서버 컴포넌트는 서버에서만 렌더링되므로 `useState`, `useEffect` 같은 클라이언트 훅을 사용할 수 없습니다.
// 클라이언트 훅이 필요하면 파일 상단에 'use client'를 선언해야 합니다.
```

### 3.3. Supabase

  * **클라이언트 구분:**
      * **서버 측 (Server Components, API Routes, Server Actions):** `@supabase/auth-helpers-nextjs`의 `createServerComponentClient`, `createRouteHandlerClient` 등을 사용하여 **사용자 세션**을 안전하게 처리하거나, **`service_role` 키**를 사용하여 RLS를 우회하는 관리자 작업을 수행합니다.
      * **클라이언트 측 (`'use client'`):** `createClientComponentClient`를 사용합니다.
  * **보안:**
      * **RLS (Row Level Security):** **필수.** 모든 테이블에 RLS 정책을 구현하여 사용자가 자신의 데이터에만 접근할 수 있도록 제어합니다.
      * **`service_role` 키 노출 금지:** `service_role` 키는 **절대** 클라이언트 코드나 `.env.local` (NEXT\_PUBLIC\_ 접두사)에 노출되어서는 안 됩니다. 서버 환경 변수(예: Vercel 환경 변수)로만 관리합니다.
  * **환경 변수:** Supabase URL과 `anon` 키는 `NEXT_PUBLIC_` 접두사를 붙여 `.env.local`에 저장하고, `service_role` 키는 접두사 없이 저장합니다.

<!-- end list -->

```typescript
// MUST: 서버 API 라우트에서 Supabase 사용 (Route Handler)
// app/api/projects/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  // RLS 정책에 따라 현재 로그인된 사용자의 프로젝트만 가져옴
  const { data, error } = await supabase.from('projects').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// MUST NOT: 클라이언트에서 'service_role' 키 사용
// app/some-component/page.tsx ('use client') - (절대 금지)
import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY); // (X)
// Explanation: 'service_role' 키는 RLS를 우회하므로 클라이언트에 노출되면 모든 데이터를 탈취당할 수 있습니다.
```

### 3.4. OpenAI API

  * **API 키 관리:** OpenAI API 키는 서버 환경 변수 (`OPENAI_API_KEY`)로만 저장합니다. **절대** Git 리포지토리나 클라이언트 코드에 커밋하지 않습니다.
  * **API 호출 위치:** 모든 OpenAI API 호출은 \*\*서버(API Routes 또는 Server Actions)\*\*를 통해서만 이루어져야 합니다. 클라이언트가 직접 OpenAI API를 호출하지 않도록 합니다.
  * **최신 모델 사용:** `openai.completions.create` (레거시) 대신 \*\*`openai.chat.completions.create`\*\*와 `gpt-4o` 또는 `gpt-4-turbo` 같은 최신 챗 모델 사용을 권장합니다.
  * **스트리밍 (Streaming):** AI 인터뷰 기능의 응답성 향상을 위해 **스트리밍 응답**을 사용합니다. (Vercel AI SDK 사용 권장)
  * **비용 최적화 및 속도 제한:** API 사용량을 모니터링하고, 불필요한 호출을 줄이도록 프롬프트를 최적화합니다. 또한, 서버 API 라우트에 **속도 제한(Rate Limiting)**(예: `@upstash/ratelimit`)을 구현하여 어뷰징을 방지합니다.

<!-- end list -->

```typescript
// MUST: Chat Completions API 및 서버사이드 호출
// app/api/generate-chapter/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 서버 환경 변수
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o', // 최신 챗 모델 사용
      messages: [
        { role: 'system', content: 'You are a helpful autobiography assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
    });
    
    const text = chatCompletion.choices[0].message.content;
    return NextResponse.json({ text });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}

// MUST NOT: 레거시 API 사용 또는 클라이언트에서 키 사용
// const openai = new OpenAI({ apiKey: 'sk-...' }); // (X)
// const completion = await openai.completions.create({ ... }); // (X)
// Explanation: API 키 하드코딩은 심각한 보안 위험이며, 레거시 API는 성능 및 기능 면에서 최신 챗 모델보다 떨어집니다.
```

### 3.5. TailwindCSS

  * **설정:** `tailwind.config.ts` 파일을 프로젝트 디자인 시스템(색상, 글꼴, 간격)에 맞게 커스터마이징합니다.
  * **유틸리티 클래스:** 스타일링은 유틸리티 클래스 사용을 원칙으로 합니다. `@apply`를 사용한 커스텀 CSS 작성은 최소화합니다.
  * **조건부 클래스:** `clsx`와 `tailwind-merge` 유틸리티 라이브러리 (보통 `cn` 헬퍼 함수로 결합)를 사용하여 조건부 클래스를 명확하고 안전하게 관리합니다.
  * **컴포넌트 추출:** 반복되는 유틸리티 클래스 패턴은 재사용 가능한 React 컴포넌트(예: `Button`, `Card`)로 추출합니다.

<!-- end list -->

```tsx
// MUST: cn 헬퍼 함수와 유틸리티 클래스 사용
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-bold py-2 px-4 rounded',
        {
          'bg-blue-500 hover:bg-blue-700 text-white': variant === 'primary',
          'bg-gray-200 hover:bg-gray-300 text-gray-800': variant === 'secondary',
        },
        className // 외부에서 주입된 클래스가 기존 클래스와 병합/덮어쓰기됨
      )}
      {...props}
    />
  );
}

// MUST NOT: 인라인 스타일 사용
<button style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px' }}>Click me</button>
// Explanation: 인라인 스타일은 TailwindCSS의 일관된 디자인 시스템(테마)을 무시하고 유지보수를 어렵게 만듭니다.
```

## 4\. Code Style Rules

### MUST Follow (필수):

  * **코드 포매팅:** **Prettier**를 사용하여 코드를 자동 포맷합니다. (일관된 들여쓰기: 2 스페이스, `singleQuote: true`, `trailingComma: 'es5'`)
      * 이유: 프로젝트 전체의 코드 스타일 일관성 확보.
  * **린팅:** **ESLint** (및 TypeScript ESLint)를 사용하여 잠재적 오류를 잡고 코드 스타일 규칙을 강제합니다.
      * 이유: 오류 방지 및 코드 품질 유지.
  * **네이밍 컨벤션:**
      * 변수, 함수: `camelCase` (e.g., `userName`, `calculateTotal`).
      * 컴포넌트, 타입/인터페이스: `PascalCase` (e.g., `UserProfile`, `IProject`).
      * 상수: `UPPER_SNAKE_CASE` (e.g., `API_URL`, `MAX_USERS`).
      * 이유: 코드 가독성 및 유지보수성 향상.
  * **주석:** 복잡한 로직이나 명확하지 않은 코드를 설명하기 위해 명확하고 간결한 주석을 작성합니다. 함수와 컴포넌트에는 JSDoc 스타일의 주석을 권장합니다.
      * 이유: 코드 이해 및 유지보수 용이성.
  * **테스트:** 모든 중요 컴포넌트와 함수에 대해 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)를 작성합니다. (예: `Jest`, `React Testing Library` 사용)
      * 이유: 코드 품질 보장 및 리팩토링 시 회귀(regression) 방지.
  * **접근성 (Accessibility):** WCAG 2.1 AA 표준을 준수합니다. 시맨틱 HTML 사용, 이미지에 `alt` 텍스트 제공, 충분한 색상 대비, 키보드 네비게이션 보장.
      * 이유: 모든 사용자가(특히 시니어 사용자) 플랫폼을 원활하게 사용할 수 있도록 보장.
  * **에러 핸들링:** 예기치 않은 오류를 정상적으로 처리하기 위해 견고한 에러 핸들링을 구현합니다. 오류를 기록하고 사용자 친화적인 에러 메시지를 표시합니다.
      * 이유: 애플리케이션 충돌 방지 및 사용자 경험 향상.
  * **보안 모범 사례:** 사용자 입력값 검증(Sanitize), SQL 인젝션 방지(Supabase RLS로 대부분 해결), XSS(Cross-Site Scripting) 공격 방어. 모든 통신은 HTTPS 사용.
      * 이유: 사용자 데이터와 플랫폼을 보안 위협으로부터 보호.

### MUST NOT Do (금지):

  * **전역 변수:** 전역 변수 사용을 피합니다. 모듈이나 React Context, Zustand 등을 사용합니다.
      * 이유: 전역 변수는 네이밍 충돌을 일으키고 코드 추론을 어렵게 만듭니다.
  * **매직 넘버 (Magic Numbers):** 설명 없는 숫자 값을 코드에 직접 사용하지 않습니다. 명명된 상수로 대체합니다.
      * 이유: 코드 가독성 향상.
  * **중첩된 콜백 (Callback Hell):** 깊게 중첩된 콜백을 피합니다. Promises나 `async/await`를 사용합니다.
      * 이유: 코드 가독성 및 유지보수성 향상.
  * **`console.log` (프로덕션):** 프로덕션 빌드에 `console.log`, `console.warn` 등을 남기지 않습니다. (린트 규칙으로 제거)
      * 이유: 민감한 정보 유출 가능성 및 성능 저하.
  * **보안 취약점 무시:** 린터나 보안 스캐너가 보고하는 보안 취약점을 절대 무시하지 않고 즉시 조치합니다.
      * 이유: 플랫폼이 공격에 노출될 수 있습니다.
  * **과도한 엔지니어링 (Over-engineering):** 현재 요구사항에 집중하고 코드를 단순하게 유지합니다.
      * 이유: 불필요한 복잡성은 유지보수를 어렵게 만듭니다.
  * **시크릿 커밋 (Committing Secrets):** API 키, DB 비밀번호 등 민감 정보를 **절대** Git 리포지토리에 커밋하지 않습니다. 환경 변수를 사용합니다.
      * 이유: 민감 정보가 외부에 노출됩니다.
  * **긴 함수 (Long Functions):** 함수는 단일 책임 원칙(SRP)을 따르고, 가능한 짧게(이상적으로 50줄 미만) 유지합니다. 큰 함수는 더 작고 관리하기 쉬운 단위로 분리합니다.
      * 이유: 가독성 및 테스트 용이성 향상.

## 5\. Architecture Patterns

  * **컴포넌트 기반 아키텍처:** UI는 재사용 가능한 React 컴포넌트 (서버/클라이언트 구분)로 구축합니다.
  * **데이터 흐름:** 데이터는 부모에서 자식 컴포넌트로 단방향(props)으로 흐릅니다. 자식에서 부모로의 데이터 전달은 콜백 함수를 사용합니다.
  * **상태 관리 (State Management):**
      * 컴포넌트 로컬 상태: `useState` 사용.
      * 공유 상태 (복잡함): **Zustand**를 우선적으로 고려합니다. (간단하고 강력하며 보일러플레이트가 적음)
      * 정적 데이터 (테마, 인증 상태): React Context 사용.
  * **API 설계 (App Router):**
      * `app/api/`의 라우트 핸들러는 RESTful 원칙을 따릅니다.
      * API 라우트는 Supabase 및 OpenAI API의 **보안 게이트웨이** 역할을 하며, 인증 및 핵심 비즈니스 로직(검증 등)만 처리하고 최대한 가볍게 유지합니다.
      * 데이터 변경(C/U/D)은 **Server Actions** 사용을 적극 권장합니다.
  * **아키텍처 레이어 (Next.js App Router 기준):**
      * **프레젠테이션 (Presentation):** `app/` 디렉터리의 React 서버 및 클라이언트 컴포넌트.
      * **비즈니스 로직 / API (Logic/API):** `app/api/`의 라우트 핸들러 및 `Server Actions`.
      * **데이터 접근 (Data Access):** `lib/` 폴더 내의 Supabase/OpenAI 클라이언트 래퍼(wrapper) 함수.

<!-- end list -->

```typescript
// MUST: 재사용 가능한 프레젠테이션 컴포넌트
// components/ui/Button.tsx
import { cn } from '@/lib/utils';

// (ButtonProps 정의...)

function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(/* ... Tailwind 클래스 ... */, className)}
      {...props}
    />
  );
}

// MUST NOT: 컴포넌트 내에서 과도한 비즈니스 로직/데이터 페칭 혼합
// app/dashboard/BadButton.tsx ('use client') - (안티 패턴)
function BadButton() {
    const [data, setData] = useState(null)

    // 컴포넌트가 직접 데이터 페칭 로직을 모두 소유 (재사용 불가)
    useEffect(() => {
        fetch('/api/getData')
            .then(res => res.json())
            .then(setData)
            // 에러 처리 누락
    }, [])

    return (
        <div>
            {data ? <p>Data: {data.value}</p> : <p>Loading...</p>}
            <button>Click</button> 
        </div>
    )
}
// Explanation: 이 컴포넌트는 데이터 페칭과 UI 로직이 강하게 결합되어 있습니다.
// 재사용이 불가능하며 테스트하기 어렵습니다. 데이터 페칭은 상위 서버 컴포넌트나 커스텀 훅(useQuery 등)으로 분리해야 합니다.
```