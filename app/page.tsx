export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-contrast">
          ECHO 자서전 플랫폼
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          AI의 도움으로 나만의 자서전을 만들어보세요
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/signin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] min-h-[44px]"
          >
            로그인
          </a>
          <a
            href="/auth/signup"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[120px] min-h-[44px]"
          >
            회원가입
          </a>
        </div>
      </div>
    </main>
  );
}


