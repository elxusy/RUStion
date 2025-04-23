'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from "~/trpc/react";
import debounce from 'lodash/debounce';

export default function DocumentPage() {
    const params = useParams();
    const id = params?.id as string;
    const [docTitle, setDocTitle] = useState('');
    const [docContent, setDocContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const utils = api.useUtils();
    const { data: document, isLoading, error } = api.document.getById.useQuery(id);

    const updateTitle = api.document.updateTitle.useMutation({
        onSuccess: async () => {
            await utils.document.invalidate();
            setIsSaving(false);
        },
        onError: (error) => {
            console.error('Ошибка при сохранении названия:', error);
            setIsSaving(false);
        },
    });

    const updateContent = api.document.updateContent.useMutation({
        onSuccess: async () => {
            await utils.document.invalidate();
            setIsSaving(false);
        },
        onError: (error) => {
            console.error('Ошибка при сохранении содержимого:', error);
            setIsSaving(false);
        },
    });

    // Создаем дебаунсированные функции для сохранения
    const debouncedUpdateTitle = useCallback(
        debounce((newTitle: string) => {
            updateTitle.mutate({ id, title: newTitle });
        }, 1000),
        [id]
    );

    const debouncedUpdateContent = useCallback(
        debounce((newContent: string) => {
            updateContent.mutate({ id, content: newContent });
        }, 1000),
        [id]
    );

    useEffect(() => {
        if (document) {
            setDocTitle(document.title);
            setDocContent(document.content || '');
        }
    }, [document]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setDocTitle(newTitle);
        setIsSaving(true);
        debouncedUpdateTitle(newTitle);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setDocContent(newContent);
        setIsSaving(true);
        debouncedUpdateContent(newContent);
    };

    if (isLoading) {
        return <div className="p-6">Загрузка...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Ошибка при загрузке документа: {error.message}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={docTitle}
                    onChange={handleTitleChange}
                    className="text-2xl font-bold w-full border-zinc-300 p-1 outline-none focus:border-blue-500"
                    placeholder="Введите название документа..."
                />
                {isSaving && (
                    <span className="text-sm text-zinc-400">Сохранение...</span>
                )}
            </div>
            <textarea
                value={docContent}
                onChange={handleContentChange}
                className="w-full h-[70vh] border rounded p-4"
                placeholder="Пиши что угодно, как в Notion..."
            />
        </div>
    );
}