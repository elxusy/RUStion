import Link from "next/link";

export default function HomePage() {
  return (
      <div className="p-8 max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">🗒️ RUStion</h1>
          <p className="text-zinc-400 mt-2">Твой личный рабочий стол. Минимализм. Темнота. Контроль.</p>
        </header>

        <section className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-xl shadow hover:bg-zinc-700 transition">
            <Link href="/doc/demo">📄 Пример документа</Link>
          </div>

          {/* Кнопка создать новый документ */}
          <Link href="/doc/new">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
              ➕ Новый документ
            </button>
          </Link>
        </section>
      </div>
  );
}
