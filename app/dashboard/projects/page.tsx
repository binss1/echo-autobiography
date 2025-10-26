'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { useProjectStore } from '@/stores/projectStore';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, setProjects } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로젝트를 불러오는데 실패했습니다.');
      }

      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('프로젝트 삭제에 실패했습니다.');
      }

      // Refresh projects list
      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : '프로젝트 삭제에 실패했습니다.');
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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-contrast mb-2">내 프로젝트</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              내가 만든 자서전 프로젝트를 관리하세요
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/projects/new')}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px] font-medium text-lg"
          >
            새 프로젝트 만들기
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              아직 프로젝트가 없습니다
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              첫 번째 자서전 프로젝트를 만들어보세요
            </p>
            <button
              onClick={() => router.push('/dashboard/projects/new')}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium text-lg"
            >
              프로젝트 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className="p-6 border rounded-lg hover:border-blue-500 transition-colors bg-white dark:bg-gray-800"
              >
                <h2 className="text-2xl font-bold mb-2 text-contrast line-clamp-2">
                  {project.title}
                </h2>
                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'completed' ? '완료' :
                     project.status === 'in_progress' ? '작성 중' : '초안'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(project.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
                  >
                    열기
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="삭제"
                  >
                    🗑️
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


