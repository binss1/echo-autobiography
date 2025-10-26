'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StoryFragment } from '@/types/fragment';

export default function FragmentsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [projectId] = useState(params.id);
  const [fragments, setFragments] = useState<StoryFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [memoContent, setMemoContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFragments();
  }, [projectId]);

  const fetchFragments = async () => {
    try {
      const response = await fetch(`/api/fragments?project_id=${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '스토리 조각을 불러오는데 실패했습니다.');
      }

      setFragments(data.fragments);
    } catch (err) {
      setError(err instanceof Error ? err.message : '스토리 조각을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fragmentId: string) => {
    if (!confirm('이 스토리 조각을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/fragments/${fragmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.');
      }

      // 목록에서 제거
      setFragments(fragments.filter(f => f.id !== fragmentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleSaveMemo = async () => {
    if (!memoContent.trim()) {
      alert('메모 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/fragments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          answer: memoContent.trim(),
          // question이 null이면 임시 메모로 구분
          question: null,
        }),
      });

      if (!response.ok) {
        throw new Error('메모 저장에 실패했습니다.');
      }

      // 메모 폼 닫기 및 리프레시
      setShowMemoForm(false);
      setMemoContent('');
      await fetchFragments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '메모 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
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
              <h1 className="text-4xl font-bold text-contrast mb-2">글감 보관함</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                AI 인터뷰에서 모은 이야기 조각들
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowMemoForm(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] font-medium text-lg"
              >
                + 임시 메모 추가
              </button>
              <button
                onClick={() => router.push(`/dashboard/projects/${projectId}/interview`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium text-lg"
              >
                + 새 인터뷰
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            총 {fragments.length}개의 이야기가 저장되었습니다
          </div>
        </div>

        {fragments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-contrast mb-2">아직 이야기가 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              AI 인터뷰를 시작하거나 임시 메모를 추가하여 첫 번째 이야기를 작성해보세요
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowMemoForm(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] font-medium text-lg"
              >
                📝 임시 메모 추가
              </button>
              <button
                onClick={() => router.push(`/dashboard/projects/${projectId}/interview`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium text-lg"
              >
                🤖 AI 인터뷰 시작
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fragments.map((fragment) => (
              <div
                key={fragment.id}
                className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-shadow"
              >
                {fragment.question ? (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-blue-600 uppercase mb-1">
                      AI 인터뷰
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      {fragment.question}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-purple-600 uppercase mb-1">
                      임시 메모
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    내용
                  </div>
                  <p className="text-base text-contrast whitespace-pre-wrap">
                    {fragment.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    {new Date(fragment.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(fragment.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium min-h-[32px] min-w-[32px]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 임시 메모 추가 Drawer */}
      {showMemoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-contrast">임시 메모 추가</h2>
                <button
                  onClick={() => setShowMemoForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl min-h-[32px] min-w-[32px]"
                >
                  ×
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                나중에 AI가 초안 생성 시 활용할 수 있는 메모를 저장하세요
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <label className="block text-sm font-medium text-contrast mb-2">
                메모 내용
              </label>
              <textarea
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                placeholder="예: 첫 월급날의 기억, 할머니의 손맛, 어린 시절 놀던 동네..."
                rows={10}
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-4">
              <button
                onClick={() => setShowMemoForm(false)}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 min-h-[44px] font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSaveMemo}
                disabled={isSaving || !memoContent.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 min-h-[44px] font-medium"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
