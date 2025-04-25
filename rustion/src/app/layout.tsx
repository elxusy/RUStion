import '../styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { auth } from '../server/auth';
import dynamic from 'next/dynamic';
import { TRPCReactProvider } from "~/trpc/react";
import SidebarClientWrapper from './_components/SidebarClientWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RUStion',
  description: 'Система управления документами',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="ru">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100`}>
        <TRPCReactProvider>
          <div className="flex min-h-screen">
            {session?.user && <SidebarClientWrapper />}
            <main className="flex-1 overflow-auto transition-all duration-200 ease-in-out ml-[280px]" id="main-content">
              {children}
            </main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}