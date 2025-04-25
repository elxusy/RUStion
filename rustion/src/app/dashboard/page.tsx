import { auth, signOut } from "../../server/auth";
import { redirect } from "next/navigation";
import { PowerIcon, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { type RouterOutputs } from "~/trpc/shared";
import Link from "next/link";

type Document = RouterOutputs["document"]["getAll"][number];

export default async function DashboardPage() {
  const session = await auth();
  
  // Если пользователь не авторизован, перенаправляем на главную
  if (!session?.user) {
    redirect("/");
  }

  const documents = await api.document.getAll();

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Добро пожаловать в RUStion</h1>
            <p className="text-zinc-400 mt-1">
              {session.user.name || session.user.email}
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
              className="flex items-center gap-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              <PowerIcon className="h-5 w-5" />
              Выйти
            </Button>
          </form>
        </div>
        
        <div className="space-y-8">
          {/* Быстрый старт */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Быстрый старт</h2>
            <div className="space-y-4 text-zinc-300">
              <p>Добро пожаловать в RUStion! Вот несколько советов для начала работы:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Создайте новый документ, нажав на кнопку "+" в сайдбаре</li>
                <li>Используйте перетаскивание для организации документов</li>
                <li>Закрепляйте важные документы, чтобы они всегда были под рукой</li>
                <li>Перетащите документ в корзину для удаления</li>
              </ul>
            </div>
          </div>

          {/* Все документы */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Ваши документы</h2>
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="text-zinc-400 text-center py-8">
                  У вас пока нет документов. Создайте новый документ, нажав на кнопку "+" в сайдбаре.
                </div>
              ) : (
                documents.map((doc: Document) => (
                  <Link 
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    className="block"
                  >
                    <div 
                      className="flex items-center gap-3 p-3 hover:bg-zinc-700 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center group-hover:bg-zinc-600 transition-colors">
                        <FileText className="w-4 h-4 text-zinc-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-zinc-100 font-medium truncate">{doc.title}</h3>
                        <p className="text-zinc-400 text-sm">
                          Создан {format(new Date(doc.createdAt), "d MMMM yyyy 'в' HH:mm", { locale: ru })}
                        </p>
                      </div>
                      {doc.isPinned && (
                        <div className="text-zinc-400 text-sm">
                          Закреплен
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Советы по использованию */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Советы по использованию</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-700/50 rounded-lg">
                <h3 className="text-zinc-100 font-medium mb-2">Организация</h3>
                <p className="text-zinc-300 text-sm">Используйте перетаскивание для организации документов в нужном порядке</p>
              </div>
              <div className="p-4 bg-zinc-700/50 rounded-lg">
                <h3 className="text-zinc-100 font-medium mb-2">Быстрый доступ</h3>
                <p className="text-zinc-300 text-sm">Закрепляйте важные документы для быстрого доступа</p>
              </div>
              <div className="p-4 bg-zinc-700/50 rounded-lg">
                <h3 className="text-zinc-100 font-medium mb-2">Безопасность</h3>
                <p className="text-zinc-300 text-sm">Все ваши документы надежно хранятся и синхронизируются</p>
              </div>
              <div className="p-4 bg-zinc-700/50 rounded-lg">
                <h3 className="text-zinc-100 font-medium mb-2">Производительность</h3>
                <p className="text-zinc-300 text-sm">Быстрая работа даже с большим количеством документов</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}