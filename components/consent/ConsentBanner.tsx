'use client';

import { useState, useEffect } from 'react';
import { ConsentPreferences } from '@/types/consent';

interface ConsentBannerProps {
  onConsentUpdate: (preferences: ConsentPreferences) => Promise<void>;
}

export default function ConsentBanner({ onConsentUpdate }: ConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    third_party: false,
  });

  useEffect(() => {
    // 로컬 스토리지에서 동의 여부 확인
    const consentGiven = localStorage.getItem('consent_given');
    if (!consentGiven) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allConsent: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      third_party: true,
    };
    await onConsentUpdate(allConsent);
    localStorage.setItem('consent_given', 'true');
    setShowBanner(false);
  };

  const handleAcceptEssential = async () => {
    await onConsentUpdate(preferences);
    localStorage.setItem('consent_given', 'true');
    setShowBanner(false);
  };

  const handleToggle = (key: keyof ConsentPreferences) => {
    if (key === 'essential') return; // 필수는 토글 불가
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-contrast mb-2">
          개인정보 처리 동의
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          ECHO는 개인정보 보호법(PIPA)을 준수합니다. 서비스 이용을 위해 아래 동의가 필요합니다.
        </p>
        
        <div className="space-y-2 mb-6">
          <label className="flex items-center text-lg min-h-[44px]">
            <input
              type="checkbox"
              checked={preferences.essential}
              disabled
              className="mr-3 w-5 h-5"
              readOnly
            />
            <span className="text-contrast">필수: 서비스 이용 (필수)</span>
          </label>
          
          <label className="flex items-center text-lg min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={() => handleToggle('analytics')}
              className="mr-3 w-5 h-5"
            />
            <span className="text-contrast">선택: 서비스 개선을 위한 분석</span>
          </label>
          
          <label className="flex items-center text-lg min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={() => handleToggle('marketing')}
              className="mr-3 w-5 h-5"
            />
            <span className="text-contrast">선택: 마케팅 정보 수신</span>
          </label>
          
          <label className="flex items-center text-lg min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.third_party}
              onChange={() => handleToggle('third_party')}
              className="mr-3 w-5 h-5"
            />
            <span className="text-contrast">선택: 제3자 정보 공유</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAcceptAll}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium text-lg"
          >
            모두 동의
          </button>
          <button
            onClick={handleAcceptEssential}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px] font-medium text-lg"
          >
            선택 동의
          </button>
        </div>
      </div>
    </div>
  );
}


