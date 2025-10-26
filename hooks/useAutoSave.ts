'use client';

import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  value: unknown;
  onSave: () => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ value, onSave, delay = 500, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 첫 렌더링 시에는 저장하지 않음
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) {
      return;
    }

    // 기존 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      onSave();
    }, delay);

    // 클린업: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay, enabled]);
}


