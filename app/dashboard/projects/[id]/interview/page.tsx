'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface InterviewPageProps {
  params: {
    id: string;
  };
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const router = useRouter();
  const [projectId] = useState(params.id);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // STT 음성 인식 훅
  const { isListening, transcript, error: speechError, startListening, stopListening, clearTranscript } = 
    useSpeechRecognition({ language: 'ko-KR', continuous: true, interimResults: true });

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/ai/chat',
    body: { project_id: projectId },
    onResponse: (response) => {
      // AI 응답(질문) 저장
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        setCurrentQuestion(lastMessage.content);
      }
    },
  });

  // 첫 로드 시 초기 질문 생성
  useEffect(() => {
    if (messages.length === 0) {
      append({
        role: 'user',
        content: '안녕하세요. 자서전 작성을 시작하겠습니다.',
      });
    }
  }, []);

  // 메시지 끝으로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // STT 결과가 입력 필드에 반영되도록
  useEffect(() => {
    if (transcript && inputRef.current) {
      inputRef.current.value = transcript;
    }
  }, [transcript]);

  const handleSendAnswer = async (answer: string) => {
    if (!answer.trim() || isLoading) return;

    // 답변을 스토리 조각으로 저장
    await saveFragment(answer);

    // AI 챗에 답변 추가
    await append({
      role: 'user',
      content: answer,
    });

    // STT 초기화
    clearTranscript();
  };

  const saveFragment = async (answer: string) => {
    try {
      await fetch('/api/fragments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          question: currentQuestion,
          answer: answer,
        }),
      });
    } catch (error) {
      console.error('Failed to save fragment:', error);
    }
  };

  const handleStartOver = () => {
    setMessages([]);
    setCurrentQuestion('');
    clearTranscript();
    append({
      role: 'user',
      content: '안녕하세요. 자서전 작성을 시작하겠습니다.',
    });
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 text-lg mb-4 min-h-[44px] px-4"
          >
            ← 뒤로
          </button>
          <h1 className="text-4xl font-bold text-contrast mb-2">AI 인터뷰</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            AI가 당신의 이야기를 듣고 질문합니다
          </p>
        </div>

        {/* 채팅 영역 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 min-h-[500px] max-h-[600px] overflow-y-auto mb-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400 text-xl">
              첫 질문을 준비하고 있습니다...
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-6 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-contrast'
                }`}
              >
                <p className="text-lg whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-6 text-left">
              <div className="inline-block bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 답변 입력 영역 */}
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <ChatInput 
            onSend={handleSendAnswer} 
            disabled={isLoading}
            isListening={isListening}
            onMicClick={handleMicClick}
            speechError={speechError}
            inputRef={inputRef}
          />
        )}

        {/* 시작하기 버튼 */}
        {messages.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={handleStartOver}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px] font-medium text-lg"
            >
              처음부터 다시 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 답변 입력 컴포넌트 (STT 기능 포함)
function ChatInput({ 
  onSend, 
  disabled,
  isListening,
  onMicClick,
  speechError,
  inputRef,
}: { 
  onSend: (text: string) => void; 
  disabled: boolean;
  isListening: boolean;
  onMicClick: () => void;
  speechError: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-center">
      {/* 음성 입력 버튼 */}
      <button
        type="button"
        onClick={onMicClick}
        disabled={disabled}
        className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px] ${
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? '음성 인식 중... (클릭하면 중지)' : '음성으로 입력하기'}
      >
        {isListening ? '🎤' : '🎙️'}
      </button>

      {/* 텍스트 입력 필드 */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isListening ? '말씀해주세요...' : '답변을 입력하세요...'}
        disabled={disabled || isListening}
        className="flex-1 px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] disabled:opacity-50"
        autoFocus
      />
      
      {/* 전송 버튼 */}
      <button
        type="submit"
        disabled={disabled || !input.trim() || isListening}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px] font-medium text-lg"
      >
        전송
      </button>

      {/* 오류 메시지 */}
      {speechError && (
        <div className="absolute mt-2 text-sm text-red-600">
          {speechError}
        </div>
      )}
    </form>
  );
}
