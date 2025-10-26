# ECHO - AI 자서전 플랫폼

시니어와 가족을 위한 LLM 기반 AI 자서전 작성 플랫폼

## 프로젝트 개요

ECHO는 시니어와 그 가족들이 자신의 삶의 이야기를 기록하고, AI의 도움을 받아 고품질의 자서전을 만들 수 있도록 지원하는 웹 기반 플랫폼입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (JWT)
- **State Management**: Zustand
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
# 또는
yarn install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
.
├── app/                    # Next.js App Router 페이지
├── components/             # 재사용 가능한 UI 컴포넌트
│   ├── ui/                # 원자적 컴포넌트 (버튼, 인풋 등)
│   ├── common/            # 공통 컴포넌트 (헤더, 푸터 등)
│   └── features/          # 기능별 컴포넌트
├── lib/                   # 핵심 비즈니스 로직
│   ├── supabase/         # Supabase 클라이언트
│   └── utils.ts          # 유틸리티 함수
├── stores/               # Zustand 상태 관리
├── hooks/                # 커스텀 React 훅
└── types/                # TypeScript 타입 정의
```

## 다음 단계

현재 완료된 작업:
- ✅ 프로젝트 초기 설정 (Next.js, TypeScript, TailwindCSS)
- ✅ Supabase 클라이언트 설정 (서버/클라이언트)
- ✅ Zustand 인증 스토어 생성
- ✅ 프로젝트 관리 (CRUD)
- ✅ AI 인터뷰 (RAG + LLM Streaming)
- ✅ 스토리 캡처 (STT + 텍스트 입력)
- ✅ 글감 보관함 (임시 메모 저장)
- ✅ AI 초안 생성 (스토리 → 챕터 자동 구성)
- ✅ 챕터 조회 및 표시 UI
- ✅ 챕터 편집 UI (Tiptap 리치 텍스트 에디터)

다음에 구현할 작업:
- [ ] PDF/eBook 생성
- [ ] 이미지 업로드 및 관리
- [ ] 출판 기능

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
