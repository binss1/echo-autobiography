'use client';

import { useEffect, useState } from 'react';
import { ConsentRecord, ConsentPreferences } from '@/types/consent';

export default function ConsentManagementPage() {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      const response = await fetch('/api/consent');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '동의 기록을 불러오는데 실패했습니다.');
      }

      setConsents(data.consents);
    } catch (err) {
      setError(err instanceof Error ? err.message : '동의 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConsent = async (consent_type: string, granted: boolean) => {
    try {
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => null);

      const userAgent = navigator.userAgent;

      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consent_type,
          granted,
          ip_address: ipAddress,
          user_agent: userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '동의 설정 변경에 실패했습니다.');
      }

      // 목록 새로고침
      fetchConsents();
    } catch (err) {
      alert(err instanceof Error ? err.message : '동의 설정 변경에 실패했습니다.');
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

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // 각 동의 유형별 최신 기록 찾기
  const getLatestConsent = (consent_type: string) => {
    return consents
      .filter((c) => c.consent_type === consent_type)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const essentialConsent = getLatestConsent('essential');
  const analyticsConsent = getLatestConsent('analytics');
  const marketingConsent = getLatestConsent('marketing');
  const thirdPartyConsent = getLatestConsent('third_party');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-contrast mb-2">개인정보 동의 관리</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            개인정보 수집 및 이용에 대한 동의를 관리할 수 있습니다
          </p>
        </div>

        <div className="space-y-6">
          {/* 필수 동의 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-contrast mb-1">서비스 이용 (필수)</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  계정 생성, 자서전 작성, AI 기능 사용에 필수입니다
                </p>
              </div>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-lg font-medium">
                동의됨
              </span>
            </div>
            {essentialConsent && (
              <p className="text-sm text-gray-500">
                동의일: {new Date(essentialConsent.granted_at).toLocaleString('ko-KR')}
              </p>
            )}
          </div>

          {/* 분석 동의 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-contrast mb-1">서비스 개선 분석</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  사용자 경험 개선을 위한 익명 분석 데이터 수집
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-lg font-medium min-h-[44px] flex items-center ${
                  analyticsConsent?.granted && !analyticsConsent?.withdrawn_at
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {analyticsConsent?.granted && !analyticsConsent?.withdrawn_at ? '동의됨' : '거부됨'}
                </span>
                <button
                  onClick={() => handleUpdateConsent('analytics', !(analyticsConsent?.granted && !analyticsConsent?.withdrawn_at))}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
                >
                  {analyticsConsent?.granted && !analyticsConsent?.withdrawn_at ? '철회' : '동의'}
                </button>
              </div>
            </div>
            {analyticsConsent && (
              <p className="text-sm text-gray-500">
                {analyticsConsent.granted && !analyticsConsent.withdrawn_at ? '동의일' : '철회일'}: {
                  analyticsConsent.granted && !analyticsConsent.withdrawn_at
                    ? new Date(analyticsConsent.granted_at).toLocaleString('ko-KR')
                    : new Date(analyticsConsent.withdrawn_at!).toLocaleString('ko-KR')
                }
              </p>
            )}
          </div>

          {/* 마케팅 동의 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-contrast mb-1">마케팅 정보 수신</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  프로모션, 이벤트, 새로운 기능 안내 등
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-lg font-medium min-h-[44px] flex items-center ${
                  marketingConsent?.granted && !marketingConsent?.withdrawn_at
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {marketingConsent?.granted && !marketingConsent?.withdrawn_at ? '동의됨' : '거부됨'}
                </span>
                <button
                  onClick={() => handleUpdateConsent('marketing', !(marketingConsent?.granted && !marketingConsent?.withdrawn_at))}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
                >
                  {marketingConsent?.granted && !marketingConsent?.withdrawn_at ? '철회' : '동의'}
                </button>
              </div>
            </div>
            {marketingConsent && (
              <p className="text-sm text-gray-500">
                {marketingConsent.granted && !marketingConsent.withdrawn_at ? '동의일' : '철회일'}: {
                  marketingConsent.granted && !marketingConsent.withdrawn_at
                    ? new Date(marketingConsent.granted_at).toLocaleString('ko-KR')
                    : new Date(marketingConsent.withdrawn_at!).toLocaleString('ko-KR')
                }
              </p>
            )}
          </div>

          {/* 제3자 공유 동의 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-contrast mb-1">제3자 정보 공유</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  서비스 제공을 위한 파트너사 정보 공유
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-lg font-medium min-h-[44px] flex items-center ${
                  thirdPartyConsent?.granted && !thirdPartyConsent?.withdrawn_at
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {thirdPartyConsent?.granted && !thirdPartyConsent?.withdrawn_at ? '동의됨' : '거부됨'}
                </span>
                <button
                  onClick={() => handleUpdateConsent('third_party', !(thirdPartyConsent?.granted && !thirdPartyConsent?.withdrawn_at))}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
                >
                  {thirdPartyConsent?.granted && !thirdPartyConsent?.withdrawn_at ? '철회' : '동의'}
                </button>
              </div>
            </div>
            {thirdPartyConsent && (
              <p className="text-sm text-gray-500">
                {thirdPartyConsent.granted && !thirdPartyConsent.withdrawn_at ? '동의일' : '철회일'}: {
                  thirdPartyConsent.granted && !thirdPartyConsent.withdrawn_at
                    ? new Date(thirdPartyConsent.granted_at).toLocaleString('ko-KR')
                    : new Date(thirdPartyConsent.withdrawn_at!).toLocaleString('ko-KR')
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


