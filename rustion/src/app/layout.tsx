import '../styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ResizableSidebar from './_components/sidebar';
import { auth } from '~/server/auth';
import { TRPCReactProvider } from '~/trpc/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion Clone',
  description: 'Minimal dark Notion clone',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100`}>
        <TRPCReactProvider>
          <div className="flex h-screen overflow-hidden w-full">
            {session && <ResizableSidebar />}
            <main className={`${session ? 'flex-1' : 'w-full'} overflow-y-auto p-6`}>{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
