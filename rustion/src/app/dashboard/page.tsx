import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📋 Dashboard</h1>
            <Link href="/doc/new" className="bg-blue-500 text-white px-4 py-2 rounded">
                ➕ Новый документ
            </Link>
        </div>
    );
}
