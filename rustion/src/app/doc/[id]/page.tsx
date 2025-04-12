'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function DocumentPage() {
    const params = useParams();
    const id = params?.id;
    const [docTitle, setDocTitle] = useState(id || 'Документ');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocTitle(e.target.value);
    };

    return (
        <div className="p-6">
            <input
                type="text"
                value={docTitle}
                onChange={handleTitleChange}
                className="text-2xl font-bold mb-4 w-full border-zinc-300 p-1 outline-none focus:border-blue-500"
                placeholder="Введите название документа..."
            />
            <textarea
                className="w-full h-[70vh] border rounded p-4"
                placeholder="Пиши что угодно, как в Notion..."
            />
        </div>
    );
}