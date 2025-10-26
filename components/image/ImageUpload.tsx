'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onUploadSuccess: (url: string, fileName: string, fileSize: number) => void;
  maxSize?: number; // MB
  accept?: string;
}

export function ImageUpload({ onUploadSuccess, maxSize = 10, accept = 'image/*' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기가 너무 큽니다. (최대 ${maxSize}MB)`);
      return;
    }

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 파일을 Blob URL로 변환하여 임시 URL 생성
    const url = URL.createObjectURL(file);
    const fileName = file.name;
    const fileSize = file.size;

    setUploading(true);
    setError(null);

    try {
      // 이미지가 성공적으로 선택되었으므로 콜백 호출
      onUploadSuccess(url, fileName, fileSize);
      
      // 파일 입력 리셋
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 min-h-[44px] font-medium inline-block"
        >
          {uploading ? '업로드 중...' : '이미지 선택'}
        </label>
        {preview && (
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
          >
            제거
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="미리보기"
            className="max-w-full h-48 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
