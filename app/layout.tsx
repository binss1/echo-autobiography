import type { Metadata } from 'next';
import './globals.css';
import ConsentBannerWrapper from '@/components/consent/ConsentBannerWrapper';

export const metadata: Metadata = {
  title: 'ECHO - AI 자서전 플랫폼',
  description: '시니어와 가족을 위한 AI 자서전 작성 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ConsentBannerWrapper />
      </body>
    </html>
  );
}
