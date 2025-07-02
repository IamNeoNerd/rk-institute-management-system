import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RK Institute Management System',
  description: 'Comprehensive management system for RK Institute'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        {/* Performance optimizations */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link rel='dns-prefetch' href='//fonts.gstatic.com' />
      </head>
      <body className={inter.className}>
        <div className='min-h-screen'>{children}</div>

        {/* Performance monitoring initialization */}
        <Script
          id='performance-init'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance monitoring
              if (typeof window !== 'undefined') {
                import('/lib/performance/PerformanceInit.js').then(module => {
                  module.performanceInit.initialize().catch(console.error);
                }).catch(console.error);
              }
            `
          }}
        />
      </body>
    </html>
  );
}
