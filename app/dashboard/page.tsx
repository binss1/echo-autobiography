import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-contrast mb-2">
            안녕하세요, {user.email}님
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            나만의 자서전을 만들어보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/dashboard/projects/new"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer min-h-[200px] block"
          >
            <h2 className="text-2xl font-bold mb-2 text-contrast">새 자서전 시작</h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI의 도움으로 나의 이야기를 기록해보세요
            </p>
          </a>

          <a
            href="/dashboard/projects"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer min-h-[200px] block"
          >
            <h2 className="text-2xl font-bold mb-2 text-contrast">기존 프로젝트</h2>
            <p className="text-gray-600 dark:text-gray-400">
              이어서 작성하거나 수정할 수 있습니다
            </p>
          </a>

          <div className="p-6 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer min-h-[200px]">
            <h2 className="text-2xl font-bold mb-2 text-contrast">가이드 보기</h2>
            <p className="text-gray-600 dark:text-gray-400">
              자서전 작성 방법을 알아보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
