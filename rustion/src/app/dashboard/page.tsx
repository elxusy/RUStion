import Link from "next/link";
import { auth, signOut } from "~/server/auth";
import { redirect } from "next/navigation";
import { PowerIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Шапка с кнопкой выхода */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-400">🗒️ RUStion</h1>
          <p className="text-gray-400 mt-2">
            Привет, {session.user?.name || session.user?.email}!
          </p>
        </div>
        
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-red-400 px-4 py-2 rounded-lg transition-colors border border-gray-700"
          >
            <PowerIcon className="w-5 h-5" />
            Выйти
          </button>
        </form>
      </header>

      {/* Основное содержимое */}
      <main className="max-w-4xl mx-auto">
        <section className="space-y-6">
          {/* Документы */}
          <div className="grid gap-4">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors">
              <Link 
                href="/doc/demo" 
                className="flex items-center gap-3 text-lg"
              >
                <span className="text-blue-400">📄</span>
                <span>Пример документа</span>
              </Link>
            </div>

            {/* Можно добавить больше документов */}
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors opacity-70">
              <div className="flex items-center gap-3 text-lg text-gray-400">
                <span>📊</span>
                <span>Отчет за март (скоро)</span>
              </div>
            </div>
          </div>

          {/* Кнопка создания документа */}
          <Link 
            href="/doc/new"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <span>➕</span>
            <span>Новый документ</span>
          </Link>
        </section>

        {/* Статистика или доп. информация */}
        <div className="mt-16 p-6 bg-gray-800 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Статистика</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="text-sm">Создано документов</p>
              <p className="text-2xl font-bold">1</p>
            </div>
            <div>
              <p className="text-sm">Последняя активность</p>
              <p className="text-2xl font-bold">Сегодня</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}