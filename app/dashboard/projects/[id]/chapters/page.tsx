'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Chapter } from '@/types/chapter';

export default function ChaptersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [projectId] = useState(params.id);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters();
  }, [projectId]);

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/chapters?project_id=${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '챕터를 불러오는데 실패했습니다.');
      }

      setChapters(data.chapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : '챕터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-xl text-gray-600 dark:text-gray-400">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700 text-lg min-h-[44px] px-4"
          >
            ← 돌아가기
          </button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-contrast mb-2">자서전 챕터</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                AI가 생성한 자서전 초안을 확인하세요
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            총 {chapters.length}개의 챕터
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-contrast mb-2">아직 챕터가 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              AI 초안 생성하기 버튼을 눌러 자서전 챕터를 만들어보세요
            </p>
            <button
              onClick={() => router.push(`/dashboard/projects/${projectId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium text-lg"
            >
              프로젝트로 돌아가기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-contrast">
                    {chapter.order}. {chapter.title}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {new Date(chapter.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                {/* 간단한 텍스트 미리보기 */}
                <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {chapter.content_draft?.content?.[0]?.content?.map((item: any, idx: number) => 
                    item.type === 'text' ? item.text : ''
                  ).join('')}
                </div>

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => router.push(`/dashboard/projects/${projectId}/chapters/${chapter.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


