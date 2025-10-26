제공해주신 TRD(Technical Requirements Document) 초안을 바탕으로, 프로젝트 "ECHO"의 성공적인 개발을 위해 각 항목을 더 구체화하고 누락된 핵심 섹션을 추가하여 완성도를 높였습니다.

특히 **AI 기능의 구체적인 구현 방식, 데이터베이스 스키마, 보안(RLS), 그리고 시니어 사용자를 위한 접근성(NFRs)** 부분을 중점적으로 보강했습니다.

-----

# Technical Requirements Document (TRD)

## (코드명: ECHO)

## 1\. Executive Technical Summary

**Project Overview:** LLM 기반 AI 자서전 작성 플랫폼 "ECHO"는 시니어 및 가족이 자신의 삶의 이야기를 체계적으로 기록하고, AI의 인터뷰 및 자동 서사 구조화 기능을 통해 각 개인의 인생사를 깊이 있게 탐구할 수 있도록 지원합니다. 플랫폼은 챕터별 작성 가이드, AI 질문 자동 생성, 맞춤형 편집 피드백, 자동 목차 및 타임라인 생성, 표지/사진/삽화 AI 추천 등 구체적인 기능을 제공하여, 사용자는 손쉽게 고품질 자서전을 완성 및 출판할 수 있습니다. 또한, 웹 접근성 표준을 준수한 UI/UX를 통해 시니어 사용자의 접근성과 사용 편의성을 극대화합니다.

**Core Technology Stack:** Next.js 기반 SSR/SSG, Supabase(PostgreSQL) 데이터베이스 및 인증, OpenAI GPT API 기반 인터뷰 및 편집 지원, TailwindCSS를 통한 반응형 UI, ImageKit을 활용한 이미지 최적화 및 CDN 제공, Vercel 기반 무중단 배포, Sentry를 이용한 실시간 에러 모니터링, LaunchDarkly 기반 기능 플래그 관리 등 구체적인 기술 스택을 사용합니다.

**Key Technical Objectives:**

  * **Performance:** 95% 타일 기준 페이지 최초 로딩 2초 이내, AI 인터뷰 응답 스트리밍 시작 1.5초 이내, 이미지 최적화 처리 1초 이내.
  * **Scalability:** 멀티테넌시(Multi-tenancy) 지원, 10,000명 동시 접속 시 서버리스 함수 및 DB 자동 스케일링, AI 인터뷰(Streaming)와 챕터 생성(Batch) 작업 큐 분리.
  * **Reliability:** 99.9% 시스템 가용성, Supabase Point-in-Time Recovery(PITR)를 통한 실시간 백업 및 주 1회 전체 스냅샷 백업.
  * **Security:** 사용자 데이터 암호화 저장, 개인정보(PII) 분리 보관, Supabase RLS(Row Level Security)를 통한 데이터 접근권한 최소화, OWASP Top 10 취약점 대응.

**Critical Technical Assumptions:**

  * OpenAI API, Supabase, Vercel 등 핵심 외부 서비스의 SLA(Service Level Agreement)가 99.9% 수준으로 준수됨.
  * 모든 사용자 데이터는 국내법(PIPA)을 준수하여 처리되며, 사용자 동의 관리 프로세스가 명확히 구현됨.
  * 시니어 사용자의 웹 접근성(WCAG 2.1 Level AA) 기준을 완전 준수함.

-----

## 2\. Tech Stack

| Category | Technology / Library | Reasoning (Why it's chosen for this project) |
|---|---|---|
| **Platform (Frontend/Backend)** | **Next.js 14+ (App Router)** | 서버 사이드 렌더링(SSR) 및 정적 사이트 생성(SSG)을 지원하여 초기 로딩 속도 최적화(SEO 유리). React 기반 컴포넌트 재사용성. API Routes (Serverless Functions)를 통해 별도 백엔드 서버 없이 비즈니스 로직 처리. |
| **Database & Auth** | **Supabase (PostgreSQL)** | 관리형 PostgreSQL DB. 내장된 인증(Auth), 스토리지(Storage), 실시간(Realtime) 기능을 제공하여 MVP 개발 속도 극대화. **`pg_vector`** 확장을 통한 벡터 데이터베이스 기능(RAG 구현용) 지원. |
| **AI (LLM)** | **OpenAI GPT-4o / GPT-4 Turbo** | RAG 기반 '공감형 인터뷰' 및 '초안 생성'에 필요한 고품질 언어 모델. API 응답 속도와 비용 효율성을 고려하여 모델 선정. (GPT-3.5-Turbo는 단순 윤문 기능에 활용) |
| **AI (STT)** | **Google Speech-to-Text API** (또는 Naver Clova) | 시니어 사용자의 음성 입력을 텍스트로 변환. 한국어 인식률, 특히 방언 및 고유명사 인식률이 높은 서비스 선정. (MVP 단계에서는 브라우저 내장 Web Speech API로 테스트) |
| **Styling & UI** | **TailwindCSS + shadcn/ui** | 유틸리티 우선 CSS 프레임워크로 신속한 UI 개발 및 일관성 유지. `shadcn/ui`를 통해 접근성(a11y)이 확보된 고품질 컴포넌트(버튼, 폼 등) 즉시 활용. |
| **Rich Text Editor** | **Tiptap (or Lexical)** | 자서전 본문 작성을 위한 블록 기반 리치 텍스트 에디터. 확장성이 뛰어나며, 실시간 문법/문체 교정(AI 연동) 기능 구현에 용이. |
| **Image Optimization** | **ImageKit.io** | 사용자가 업로드한 원본 이미지를 실시간으로 리사이징, 포맷 변환(WebP), 최적화하여 CDN으로 제공. 자서전 이미지 로딩 속도 및 LCP 개선에 필수적. |
| **Deployment & Hosting** | **Vercel** | Next.js에 최적화된 호스팅 플랫폼. Git 연동(GitHub/GitLab)을 통한 자동 CI/CD, 무중단 배포, 글로벌 CDN, Serverless Function 환경 기본 제공. |
| **Monitoring** | **Sentry** | 프론트엔드 및 백엔드(API Routes)에서 발생하는 에러를 실시간으로 추적하고 알림. 사용자 경험에 영향을 미치는 버그 조기 발견 및 대응. |
| **Feature Flags** | **LaunchDarkly (or Vercel Flags)** | 신규 기능(예: AI 사진 배치)을 특정 사용자 그룹(베타 테스터)에게만 선별적으로 배포(Canary) 및 A/B 테스트. 리스크 관리 및 점진적 롤아웃. |
| **State Management** | **Zustand (or Jotai)** | React의 복잡한 상태(예: 사용자 인증 상태, 에디터 내용)를 단순하고 효율적으로 관리. Boilerplate가 적고 Next.js App Router와 호환성이 높음. |

-----

## 3\. System Architecture (High-Level)

본 시스템은 **Vercel 기반의 서버리스 아키텍처**를 채택합니다.

1.  **Client (User):** 사용자는 웹 브라우저(PC/Tablet)를 통해 Next.js 애플리케이션에 접속합니다.
2.  **Edge Network (Vercel):** Next.js의 정적 에셋(JS, CSS)과 사전 렌더링된 페이지(SSR/SSG)가 Vercel CDN을 통해 사용자에게 빠르게 전송됩니다.
3.  **Application Logic (Vercel Functions):**
      * AI 인터뷰, 챕터 생성, STT 변환 등 모든 동적 로직은 Next.js API Routes (Serverless Functions)에서 처리됩니다.
      * 이 함수들은 필요시 외부 API(OpenAI, ImageKit, Google STT)를 호출합니다.
4.  **Data & Auth (Supabase):**
      * 모든 사용자 데이터(프로젝트, 스토리 조각, 챕터)는 Supabase PostgreSQL DB에 저장됩니다.
      * 인증은 Supabase Auth를 통해 JWT 기반으로 처리됩니다.
      * 업로드된 이미지/음성 파일은 Supabase Storage 또는 ImageKit에 저장됩니다.

<!-- end list -->

```plaintext
[User (Browser)] <--> [Vercel Edge Network (Next.js Frontend)]
       |
       | (API Calls)
       v
[Vercel Serverless Functions (Next.js API Routes)]
       |
       +--- (Auth/Data/Vector) --> [Supabase (Postgres, Auth, pg_vector)]
       |
       +--- (LLM Calls) ---------> [OpenAI API (GPT-4o)]
       |
       +--- (Media) -------------> [ImageKit.io (CDN, Optimization)]
       |
       +--- (Error Logs) --------> [Sentry]
```

-----

## 4\. Core Feature Technical Specifications

### 4.1. 공감형 AI 인터뷰 (RAG + Streaming)

  * **목표:** 사용자의 이전 답변 맥락을 기억하고 자연스러운 후속 질문을 생성.
  * **기술:** RAG (Retrieval-Augmented Generation) + `pg_vector` + Streaming.
  * **프로세스:**
    1.  **[Embedding]** 사용자가 '스토리 조각(답변)'을 저장할 때마다, 해당 텍스트를 임베딩하여 Supabase `pg_vector`에 저장합니다. (`fragment_embeddings` 테이블)
    2.  **[Retrieval]** 사용자가 새 질문을 요청하거나 답변을 입력하면, 해당 내용을 쿼리로 사용하여 `pg_vector`에서 가장 관련성 높은 과거 대화(스토리 조각) N개를 검색합니다.
    3.  **[Augmentation]** 검색된 맥락(과거 대화)과 현재 대화, 그리고 "당신은 따뜻한 인터뷰어입니다..."라는 시스템 프롬프트를 조합하여 OpenAI API에 전달합니다.
    4.  **[Generation & Streaming]** OpenAI API의 응답을 `stream`으로 받아, 사용자가 즉각적으로 AI의 답변(질문)을 볼 수 있도록 UI에 실시간으로 렌더링합니다. (Vercel AI SDK 활용)

### 4.2. 스토리 캡처 (STT & Rich Text Editor)

  * **목표:** 음성 입력을 텍스트로 변환하고, 이를 즉시 편집할 수 있는 환경 제공.
  * **기술:** Google STT API (or Web Speech API) + Tiptap Editor.
  * **프로세스:**
    1.  사용자가 '음성 녹음' 버튼을 누르고 말하면, 오디오 데이터가 서버리스 함수로 전송됩니다.
    2.  서버리스 함수는 이 오디오를 STT API로 전달하여 텍스트 변환 결과를 받습니다. (장문 인식 모드 활성화)
    3.  변환된 텍스트는 Tiptap 에디터의 새 블록(Paragraph)으로 즉시 삽입됩니다.
    4.  사용자는 Tiptap 에디터에서 STT 오류를 실시간으로 수정하고, 문장(AI 윤문) 또는 단락(문체 변경) 단위로 AI 편집 지원을 요청할 수 있습니다.

### 4.3. 자동 서사 구조화 (Async Batch Job)

  * **목표:** 수집된 '스토리 조각'들을 바탕으로 자서전 목차와 챕터별 초안을 생성.
  * **기술:** Vercel Cron Jobs (or Supabase PG Cron) + OpenAI API (Batch).
  * **프로세스:**
    1.  사용자가 '초안 생성하기' 버튼을 클릭합니다.
    2.  이는 특정 `project_id`에 대한 '초안 생성' 작업을 비동기 큐(Vercel KV 또는 Supabase 테이블)에 등록합니다. (사용자에게는 "초안 생성 중입니다..." 알림 표시)
    3.  예약된 Cron Job(예: 1분마다 실행)이 큐를 확인하고 작업을 처리합니다.
    4.  작업 로직:
        a. 해당 `project_id`의 모든 '스토리 조각'을 불러옵니다.
        b. OpenAI API에 "다음 텍스트들을 유년기, 청년기... 등 시간순으로 분류하고, 각 챕터의 제목을 정하고, 내용을 서사적으로 재구성해줘"라는 복잡한 프롬프트를 전송합니다.
        c. 반환된 텍스트(JSON 또는 Markdown 형식)를 파싱하여 `chapters` 테이블에 저장합니다.
    5.  작업 완료 시 사용자에게 웹 푸시 또는 이메일로 알림을 보냅니다.

### 4.4. 출판 (PDF/eBook 생성)

  * **목표:** 완성된 자서전 콘텐츠를 인쇄 가능한 PDF 파일로 변환.
  * **기술:** `Puppeteer` (Serverless Function) 또는 서드파티 API (`Gotenberg`, `PDFShift`).
  * **프로세스:**
    1.  사용자가 'PDF 다운로드'를 요청합니다.
    2.  자서전의 모든 챕터 콘텐츠(HTML)와 CSS(인쇄용 스타일)를 결합합니다.
    3.  `Puppeteer` (Headless Chrome)를 실행하는 전용 서버리스 함수를 호출합니다. (메모리 증설 필요. 예: Vercel Pro Plan)
    4.  `Puppeteer`가 해당 HTML/CSS를 로드하여 PDF 파일로 렌더링합니다.
    5.  생성된 PDF를 Supabase Storage에 업로드하고, 사용자에게 다운로드 URL을 제공합니다.

-----

## 5\. Data Management & Schema

  * **DB:** Supabase (PostgreSQL)
  * **핵심 원칙:** PIPA 준수를 위해 모든 데이터는 서울 리전(ap-northeast-2)에 저장.

### 5.1. Logical Database Schema (Key Tables)

  * **`users`** (Supabase Auth 제공)
      * `id` (uuid, PK), `email`, `created_at`, `raw_user_meta_data` (이름 등)
  * **`projects`** (자서전 프로젝트)
      * `id` (uuid, PK), `user_id` (uuid, FK, RLS 키), `title` (text), `status` (enum: drafting, completed), `created_at`
  * **`story_fragments`** (AI 인터뷰로 수집된 개별 에피소드/답변)
      * `id` (uuid, PK), `project_id` (uuid, FK), `user_id` (uuid, FK, RLS 키), `content_raw` (text, 원본 답변), `audio_url` (text, nullable), `created_at` (timestamp)
  * **`fragment_embeddings`** (RAG용 벡터 데이터)
      * `id` (uuid, PK), `fragment_id` (uuid, FK), `user_id` (uuid, FK, RLS 키), `content_embedding` (vector, 1536 dims)
  * **`chapters`** (AI가 생성/편집한 챕터)
      * `id` (uuid, PK), `project_id` (uuid, FK), `user_id` (uuid, FK, RLS 키), `title` (text), `content_draft` (jsonb, Tiptap JSON 형식), `order` (int)
  * **`images`** (사용자 업로드 이미지)
      * `id` (uuid, PK), `project_id` (uuid, FK), `user_id` (uuid, FK, RLS 키), `imagekit_url` (text), `caption` (text)

-----

## 6\. Security & Compliance

1.  **Authentication:** Supabase Auth를 통해 JWT(JSON Web Token) 기반 인증 시행. 모든 API 요청은 유효한 JWT를 포함해야 함.
2.  **Authorization (RLS):** **Supabase의 RLS(Row Level Security)를 모든 핵심 테이블에 적용.** 사용자는 자신의 `user_id`와 일치하는 데이터(프로젝트, 챕터, 스토리 조각 등)에만 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 권한을 가짐. 이는 멀티테넌시 보안의 핵심임.
3.  **Data Encryption:** 모든 데이터는 전송 중(SSL/TLS) 및 저장 시(At-rest encryption, Supabase 제공) 암호화됨.
4.  **PIPA (개인정보보호법):**
      * 모든 사용자 데이터는 Supabase 서울 리전에 저장.
      * 회원가입 시 개인정보 수집/이용 동의, AI 처리 동의 명시적 수신.
      * 사용자 탈퇴 시 모든 관련 데이터(프로젝트, 챕터, 이미지 등) 즉시 또는 배치로 완전 삭제(Hard Delete) 처리.
5.  **OWASP Top 10:**
      * **Injection:** Supabase 클라이언트 라이브러리 사용으로 SQL Injection 방지.
      * **Broken Access Control:** RLS(상기 2번)를 통해 철저히 방어.
      * **XSS (Cross-Site Scripting):** Next.js(React)의 기본 이스케이핑 및 Tiptap 에디터의 콘텐츠 정제(Sanitization)를 통해 방어.

-----

## 7\. Deployment & DevOps (CI/CD)

  * **Repository:** GitHub (Private)
  * **CI/CD Pipeline:** Vercel
  * **환경 (Environments):**
    1.  **`development` (Local):** 로컬 개발 환경 (Supabase CLI 연동).
    2.  **`staging` (Preview):** `dev` 또는 `feature/*` 브랜치 PUSH 시 Vercel이 자동 생성하는 프리뷰 URL. QA팀 및 기획자 리뷰용.
    3.  **`production`:** `main` 브랜치 PUSH(또는 PR Merge) 시 Vercel이 자동 빌드 및 프로덕션 배포.
  * **Database Migrations:** Supabase CLI를 사용하여 마이그레이션 파일(`schema.sql`)을 관리하고, Vercel 배포 파이프라인과 연동하여 프로덕션 DB 스키마를 안전하게 변경.
  * **Monitoring:** Sentry를 Vercel 프로젝트에 연동하여 에러 발생 시 즉시 Slack/Email 알림 수신.

-----

## 8\. Non-Functional Requirements (NFRs)

1.  **Accessibility (A11y):**
      * **목표:** **WCAG 2.1 Level AA 표준 준수.** (시니어 사용자를 위한 필수 요구사항)
      * **구현:**
          * 모든 인터랙티브 요소(버튼, 링크)에 대한 키보드 접근성(Focus a11y) 보장.
          * 시맨틱 HTML (`<nav>`, `<main>`, `<button>`) 사용.
          * 최소 4.5:1 이상의 텍스트 명암비 준수 (Tailwind 색상 팔레트 정의).
          * 기본 글꼴 크기 `16px` 이상, 사용자가 브라우저에서 200%까지 확대해도 레이아웃이 깨지지 않아야 함.
          * 모든 이미지에 `alt` 텍스트 제공.
2.  **Performance:** (1. Executive Summary 참조)
      * Next.js의 ISR(Incremental Static Regeneration)을 활용하여 자주 변경되지 않는 페이지(예: 소개 페이지)는 정적 캐시.
      * `ImageKit`을 통한 이미지 최적화 및 WebP 포맷 우선 제공.
3.  **Scalability:**
      * Vercel 서버리스 함수와 Supabase DB는 사용량에 따라 자동 스케일링됨.
      * AI 초안 생성 등 리소스 집약적 작업은 비동기 처리하여 메인 스레드를 차단하지 않음.
4.  **Usability (UX for Seniors):**
      * '다음 단계'가 명확한 단순한 UI 플로우.
      * 터치 영역(버튼 크기)은 최소 `44x44px` 이상 (Fitts's Law 적용).
      * 아이콘과 함께 명확한 텍스트 레이블 병기.
      * 모든 작업은 '실시간 자동 저장'되어 사용자가 실수로 페이지를 닫아도 데이터가 유실되지 않음. (Zustand 상태를 LocalStorage에 연동 또는 Debounce를 통한 자동 API 저장)