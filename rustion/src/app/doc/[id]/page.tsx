"use client";


import { useParams } from 'next/navigation';

export default function DocumentPage() {
    const params = useParams();
    const id = params?.id;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📝 Документ {id}</h1>
            <textarea
                className="w-full h-[70vh] border rounded p-4"
                placeholder="Пиши что угодно, как в Notion..."
            />
        </div>
    );
}
