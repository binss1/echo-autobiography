'use client';

import { useState } from 'react';
import ConsentBanner from './ConsentBanner';
import { ConsentPreferences } from '@/types/consent';

export default function ConsentBannerWrapper() {
  const [loading, setLoading] = useState(false);

  const handleConsentUpdate = async (preferences: ConsentPreferences) => {
    setLoading(true);
    
    try {
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => null);

      const userAgent = navigator.userAgent;

      // 각 동의 유형에 대해 기록 생성
      const consentPromises = Object.entries(preferences).map(([type, granted]) => {
        if (type === 'essential') return null; // essential은 이미 회원가입 시 동의
        return fetch('/api/consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            consent_type: type,
            granted,
            ip_address: ipAddress,
            user_agent: userAgent,
          }),
        });
      }).filter(Boolean);

      await Promise.all(consentPromises);
    } catch (error) {
      console.error('Failed to save consent:', error);
    } finally {
      setLoading(false);
    }
  };

  return <ConsentBanner onConsentUpdate={handleConsentUpdate} />;
}


