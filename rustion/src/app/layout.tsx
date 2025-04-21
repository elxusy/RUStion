import '../styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { auth } from '../server/auth';
import { Sidebar } from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RUStion',
  description: 'Система управления обучением',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="ru">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100`}>
        <div className="flex min-h-screen">
          {/* Боковое меню только для авторизованных пользователей */}
          {session?.user && (
            <aside className="w-64 border-r border-gray-700 bg-gray-800">
              <Sidebar />
            </aside>
          )}
          
          {/* Основной контент */}
          <main className={`flex-1 ${!session?.user ? 'w-full' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
