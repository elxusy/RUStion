import { auth, signOut } from "../../server/auth";
import { redirect } from "next/navigation";
import { PowerIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  
  // Если пользователь не авторизован, перенаправляем на главную
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">
              Добро пожаловать, {session.user.name || session.user.email}
            </p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <Button
              type="submit"
              className="flex items-center gap-2 bg-gray-800 text-red-400 hover:bg-gray-700"
            >
              <PowerIcon className="h-5 w-5" />
              Выйти
            </Button>
          </form>
        </div>
        
        {/* Здесь будет основной контент dashboard */}
        <div className="mt-6">
          <p className="text-gray-300">Основной контент будет добавлен позже</p>
        </div>
      </div>
    </div>
  );
}