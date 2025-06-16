import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import './globals.css'

// Dynamically import WebVitalsReporter to avoid SSR issues
const WebVitalsReporter = dynamic(() => import('@/components/performance/WebVitalsReporter'), {
  ssr: false
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RK Institute Management System',
  description: 'Comprehensive management system for RK Institute',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {/* Critical CSS inlined for immediate rendering */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html{font-family:system-ui,-apple-system,sans-serif}
            body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;margin:0;padding:0}
            .gradient-bg{background:linear-gradient(135deg,#f0f9ff 0%,#e0e7ff 50%,#f3e8ff 100%)}
            .btn-primary{background:linear-gradient(90deg,#2563eb 0%,#1d4ed8 100%);color:white;font-weight:500;padding:.75rem 1.5rem;border-radius:.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,.1);transition:all .3s ease;border:none;cursor:pointer}
            .btn-primary:hover{background:linear-gradient(90deg,#1d4ed8 0%,#1e40af 100%);box-shadow:0 20px 25px -5px rgba(0,0,0,.1);transform:translateY(-2px)}
            .card{background:rgba(255,255,255,.8);backdrop-filter:blur(4px);border-radius:1rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);border:1px solid #f3f4f6;padding:2rem;transition:all .3s ease}
            .animate-spin{animation:spin 1s linear infinite}
            @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            .grid{display:grid}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
            .gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}
            .flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}
            .space-y-8>*+*{margin-top:2rem}
            .text-lg{font-size:1.125rem;line-height:1.75rem}.text-2xl{font-size:1.5rem;line-height:2rem}.font-bold{font-weight:700}.text-gray-900{color:#111827}.text-white{color:#fff}
            @media (min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
            @media (min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}
            @media (min-width:1024px){.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}}
          `
        }} />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen">
          {children}
        </div>

        {/* Performance monitoring */}
        <WebVitalsReporter />

        {/* Tailwind CSS loads normally through Next.js */}
      </body>
    </html>
  )
}
