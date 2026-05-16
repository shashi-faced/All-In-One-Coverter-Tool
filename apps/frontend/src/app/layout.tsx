import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '@/components/layout/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ConvertForge - Universal File Conversion API',
  description: 'Convert any file format. Images, video, audio, documents, and more. Enterprise-grade file conversion API with queue-based processing.',
  keywords: 'file conversion, image converter, video converter, PDF converter, API, cloud convert',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
