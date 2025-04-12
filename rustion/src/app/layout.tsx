import '../styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ResizableSidebar from './_components/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion Clone',
  description: 'Minimal dark Notion clone',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100`}>
        <div className="flex h-screen overflow-hidden w-full">
          <ResizableSidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
