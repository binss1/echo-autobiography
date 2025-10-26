'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProjectStore } from '@/stores/projectStore';
import { CreateProjectInput } from '@/types/project';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addProject } = useProjectStore();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const input: CreateProjectInput = {
        title: title.trim(),
        description: description.trim() || undefined,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로젝트 생성에 실패했습니다.');
      }

      addProject(data.project);
      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-contrast mb-2">새 자서전 프로젝트</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            나만의 자서전 작성을 시작해보세요
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-contrast mb-3">
              프로젝트 제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="예: 나의 인생 이야기"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-medium text-contrast mb-3">
              한 줄 소개
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="이 프로젝트에 대한 간단한 설명을 입력하세요 (선택사항)"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] font-medium text-lg"
            >
              {loading ? '생성 중...' : '프로젝트 시작하기'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] font-medium text-lg"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


