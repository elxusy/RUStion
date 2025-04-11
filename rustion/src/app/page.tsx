import Link from "next/link";
import { auth, signOut } from "~/server/auth";
import { PowerIcon } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">
          Добро пожаловать!
        </h1>
        
        {session ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-1">Вы вошли как:</p>
              <p className="font-medium text-lg text-white">
                {session.user?.name || session.user?.email}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg text-center transition duration-200"
              >
                Перейти в Dashboard
              </Link>
              
              <form
                action={async () => {
                  'use server';
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-red-400 py-3 px-4 rounded-lg transition duration-200"
                >
                  <PowerIcon className="w-5 h-5" />
                  Выйти
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              href="/api/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg text-center transition duration-200"
            >
              Войти
            </Link>
            <p className="text-sm text-gray-400 text-center">
              Для доступа к системе требуется авторизация
            </p>
          </div>
        )}
      </div>
    </div>
  );
}