'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Chapter } from '@/types/chapter';

interface SortableItemProps {
  chapter: Chapter;
  onView: (chapterId: string) => void;
}

function SortableItem({ chapter, onView }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-shadow cursor-move">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1" {...attributes} {...listeners}>
            <div className="text-2xl mt-1">⋮⋮</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-contrast mb-2">{chapter.title}</h3>
              <div className="text-sm text-gray-500 mb-3">
                순서: {chapter.order}
              </div>
              <p className="text-base text-gray-700 dark:text-gray-300 line-clamp-3">
                {typeof chapter.content_draft === 'string'
                  ? chapter.content_draft
                  : JSON.stringify(chapter.content_draft)}
              </p>
              <div className="mt-4 text-xs text-gray-500">
                {new Date(chapter.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onView(chapter.id)}
            className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
          >
            자세히 보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChaptersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [projectId] = useState(params.id);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      // order 기준으로 정렬
      const sortedChapters = [...data.chapters].sort((a, b) => a.order - b.order);
      setChapters(sortedChapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : '챕터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);

    const newChapters = arrayMove(chapters, oldIndex, newIndex);

    // 로컬 상태 업데이트
    setChapters(newChapters);

    // 서버에 순서 업데이트
    setIsSaving(true);
    try {
      const updates = newChapters.map((chapter, index) => ({
        id: chapter.id,
        order: index,
      }));

      // 모든 챕터의 order를 업데이트
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/chapters/${update.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: update.order }),
          })
        )
      );
    } catch (err) {
      console.error('Failed to update chapter order:', err);
      alert('챕터 순서 업데이트에 실패했습니다.');
      // 실패 시 원래 상태로 복원
      fetchChapters();
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewChapter = (chapterId: string) => {
    router.push(`/dashboard/projects/${projectId}/chapters/${chapterId}`);
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

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>총 {chapters.length}개의 챕터</span>
            {isSaving && <span className="text-blue-600">순서 저장 중...</span>}
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {chapters.map((chapter) => (
                  <SortableItem key={chapter.id} chapter={chapter} onView={handleViewChapter} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}


