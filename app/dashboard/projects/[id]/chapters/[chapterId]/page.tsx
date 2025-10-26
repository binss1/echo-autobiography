'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import type { Chapter } from '@/types/chapter';

export default function ChapterDetailPage({ 
  params 
}: { 
  params: { id: string; chapterId: string } 
}) {
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChapter();
  }, [params.chapterId]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(`/api/chapters/${params.chapterId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '챕터를 불러오는데 실패했습니다.');
      }

      setChapter(data.chapter);
      setTitle(data.chapter.title);
      setContent(data.chapter.content_draft || {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '챕터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chapter) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/chapters/${params.chapterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content_draft: content,
        }),
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다.');
      }

      const data = await response.json();
      setChapter(data.chapter);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-xl text-gray-600 dark:text-gray-400">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error || '챕터를 찾을 수 없습니다.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 text-lg mb-4 min-h-[44px] px-4"
          >
            ← 돌아가기
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-contrast">
              {isEditing ? '챕터 편집' : chapter.title}
            </h1>
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setTitle(chapter.title);
                      setContent(chapter.content_draft);
                    }}
                    disabled={saving}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px] font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 min-h-[44px] font-medium"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
                >
                  편집
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-contrast mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="챕터 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-contrast mb-2">
                  내용
                </label>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="챕터 내용을 입력하세요..."
                  editable={true}
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-contrast mb-4">
                {chapter.title}
              </h2>
              <TiptapEditor
                content={chapter.content_draft}
                onChange={() => {}}
                editable={false}
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="mt-4 text-sm text-gray-500">
            마지막 수정: {new Date(chapter.updated_at).toLocaleString('ko-KR')}
          </div>
        )}
      </div>
    </div>
  );
}
