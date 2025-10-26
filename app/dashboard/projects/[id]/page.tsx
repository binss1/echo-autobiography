'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로젝트를 불러오는데 실패했습니다.');
      }

      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트를 불러오는데 실패했습니다.');
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

  if (error || !project) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error || '프로젝트를 찾을 수 없습니다.'}
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
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 돌아가기
          </button>
          <h1 className="text-4xl font-bold text-contrast mb-2">{project.title}</h1>
          {project.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400">{project.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
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
              마지막 수정: {new Date(project.updated_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-4 text-contrast">기본 목차</h2>
          <div className="space-y-4">
            {project.default_outline.map((item, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-contrast mb-1">
                  {item.order}. {item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-contrast mb-4">액션</h2>
          
          <a
            href={`/dashboard/projects/${params.id}/interview`}
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center min-h-[44px] flex items-center justify-center mb-4 font-medium text-lg"
          >
            🤖 AI 인터뷰 시작
          </a>

          <a
            href={`/dashboard/projects/${params.id}/fragments`}
            className="block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center min-h-[44px] flex items-center justify-center mb-4 font-medium text-lg"
          >
            📝 내 이야기 보기
          </a>

          <a
            href={`/dashboard/projects/${params.id}/chapters`}
            className="block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center min-h-[44px] flex items-center justify-center mb-4 font-medium text-lg"
          >
            📖 자서전 초안 보기
          </a>

          <button
            onClick={async () => {
              if (!confirm('저장된 이야기를 바탕으로 자서전 초안을 생성하시겠습니까?')) return;
              
              try {
                const response = await fetch('/api/generate-chapters', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ project_id: params.id }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                  alert(data.error || '초안 생성에 실패했습니다.');
                  return;
                }
                
                alert('초안이 성공적으로 생성되었습니다!');
                window.location.href = `/dashboard/projects/${params.id}`;
              } catch (error) {
                alert('초안 생성 중 오류가 발생했습니다.');
              }
            }}
            className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center min-h-[44px] flex items-center justify-center mb-4 font-medium text-lg"
          >
            ✨ AI 초안 생성하기
          </button>

          <button
            onClick={async () => {
              setIsGeneratingPdf(true);
              try {
                const response = await fetch(`/api/projects/${params.id}/generate-pdf`, {
                  method: 'POST',
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                  alert(data.error || 'PDF 생성에 실패했습니다.');
                  return;
                }
                
                // Base64 PDF를 Blob으로 변환하여 다운로드
                const pdfBlob = Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0));
                const blob = new Blob([pdfBlob], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename || '자서전.pdf';
                a.click();
                URL.revokeObjectURL(url);
              } catch (error) {
                alert('PDF 생성 중 오류가 발생했습니다.');
              } finally {
                setIsGeneratingPdf(false);
              }
            }}
            disabled={isGeneratingPdf}
            className="block w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-center min-h-[44px] flex items-center justify-center mb-4 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? '📄 PDF 생성 중...' : '📄 PDF 다운로드'}
          </button>
          
          <a
            href={`/dashboard/projects/${params.id}/edit`}
            className="block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-center min-h-[44px] flex items-center justify-center font-medium text-lg"
          >
            프로젝트 수정
          </a>
        </div>
      </div>
    </div>
  );
}
