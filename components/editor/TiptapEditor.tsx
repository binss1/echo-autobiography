'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = '여기에 내용을 입력하세요...',
  editable = true,
}: TiptapEditorProps) {
  const [isRefining, setIsRefining] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none px-4 py-3 min-h-[400px] text-contrast',
      },
    },
  });

  const handleRefineText = async () => {
    if (!editor || isRefining) return;

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (!selectedText.trim()) {
      alert('다듬을 텍스트를 선택해주세요.');
      return;
    }

    setIsRefining(true);

    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          tone: 'warm', // 따뜻한 톤
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '문장 다듬기에 실패했습니다.');
      }

      // 선택된 텍스트를 다듬어진 텍스트로 교체
      const { from, to } = editor.state.selection;
      editor.chain().focus().insertContentAt({ from, to }, data.refinedText).run();
    } catch (error) {
      console.error('Refine error:', error);
      alert(error instanceof Error ? error.message : '문장 다듬기에 실패했습니다.');
    } finally {
      setIsRefining(false);
    }
  };

  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      
      if (currentContent !== newContent) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return <div className="border rounded-lg p-4 min-h-[400px] bg-white dark:bg-gray-800">로딩 중...</div>;
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      {/* 툴바 */}
      {editable && (
        <div className="border-b p-2 flex gap-2 flex-wrap bg-gray-50 dark:bg-gray-900">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] ${
              editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="굵게 (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] ${
              editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="기울임 (Ctrl+I)"
          >
            <em>I</em>
          </button>
          
          <div className="border-l border-gray-300 dark:border-gray-600 mx-1" />
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="제목 1"
          >
            H1
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="제목 2"
          >
            H2
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] ${
              editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="제목 3"
          >
            H3
          </button>
          
          <div className="border-l border-gray-300 dark:border-gray-600 mx-1" />
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] ${
              editor.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="글머리 기호 목록"
          >
            •
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] ${
              editor.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title="번호 목록"
          >
            1.
          </button>

          <div className="border-l border-gray-300 dark:border-gray-600 mx-1" />

          <button
            onClick={handleRefineText}
            disabled={isRefining}
            className="px-3 py-2 rounded hover:bg-purple-100 dark:hover:bg-purple-900 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 min-h-[36px] disabled:opacity-50 font-medium text-sm"
            title="AI로 문장 다듬기 (텍스트 선택 후 클릭)"
          >
            ✨ {isRefining ? '다듬는 중...' : '문장 다듬기'}
          </button>
        </div>
      )}
      
      {/* 에디터 콘텐츠 */}
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 16px;
          min-height: 400px;
        }
        
        .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          font-weight: bold;
          margin: 0.8em 0 0.4em;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
        }
        
        .ProseMirror h3 {
          font-size: 1.25em;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
