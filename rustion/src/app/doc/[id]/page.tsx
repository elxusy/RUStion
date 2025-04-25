'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoaderCircle, Save, AlertTriangle } from 'lucide-react';
import { api } from "~/trpc/react";
import DocumentEditor from '~/components/DocumentEditor';
import type { DocumentBlock } from '~/components/editorUtils';
import debounce from 'lodash/debounce';

// Изменяем структуру данных документа
type DocumentData = {
  title: string;
  text: string;
  blocks: DocumentBlock[];
};

// Новая структура для хранения на сервере
interface ServerDocumentData {
  textContent: string;
  blocksContent?: string; // JSON строка с блоками
}

export default function DocumentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [documentData, setDocumentData] = useState<DocumentData>({ title: '', text: '', blocks: [] });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const lastSavedData = useRef<DocumentData>({ title: '', text: '', blocks: [] });
    const isFirstLoad = useRef(true);
    const isSaving = useRef(false);

    const utils = api.useUtils();
    const { data: document, isLoading, error, refetch } = api.document.getById.useQuery(id, {
      retry: 3,
      staleTime: 5000,
    });

    const updateTitle = api.document.updateTitle.useMutation({
        onError: () => setSaveStatus('error'),
    });
    const updateContent = api.document.updateContent.useMutation({
        onError: () => setSaveStatus('error'),
    });

    // useEffect для первой загрузки документа
    useEffect(() => {
        if (document && isFirstLoad.current) {
            let title = document.title || '';
            let text = '';
            let blocks: DocumentBlock[] = [];
            if (document.content) {
                try {
                    const serverData = JSON.parse(document.content) as ServerDocumentData;
                    if (serverData && typeof serverData === 'object') {
                        if ('textContent' in serverData) {
                            text = serverData.textContent || '';
                            if (serverData.blocksContent) {
                                try {
                                    blocks = JSON.parse(serverData.blocksContent) as DocumentBlock[];
                                } catch {}
                            }
                        } else if (Array.isArray(document.content)) {
                            blocks = document.content;
                        } else {
                            text = document.content;
                        }
                    } else {
                        text = document.content;
                    }
                } catch {
                    text = document.content;
                }
            }
            setDocumentData({ title, text, blocks });
            lastSavedData.current = { title, text, blocks };
            isFirstLoad.current = false;
        }
    }, [document, id]);

    // Единый обработчик изменений
    const handleDocumentChange = (patch: Partial<DocumentData>) => {
        setDocumentData(prev => {
            const next = { ...prev, ...patch };
            // Сохраняем только если реально что-то изменилось
            if (
                next.title !== lastSavedData.current.title ||
                next.text !== lastSavedData.current.text ||
                JSON.stringify(next.blocks) !== JSON.stringify(lastSavedData.current.blocks)
            ) {
                saveDocument(next);
            }
            return next;
        });
    };

    // Асинхронное автосохранение (теперь принимает nextData)
    const saveDocument = useCallback(async (nextData?: DocumentData) => {
        if (isSaving.current) return;
        isSaving.current = true;
        setSaveStatus('saving');
        const { title, text, blocks } = nextData || documentData;
        const serverData: ServerDocumentData = { textContent: text || '' };
        if (blocks.length > 0) serverData.blocksContent = JSON.stringify(blocks);
        const textChanged = text !== lastSavedData.current.text;
        const blocksChanged = JSON.stringify(blocks) !== JSON.stringify(lastSavedData.current.blocks);
        const titleChanged = title !== lastSavedData.current.title;
        try {
            if (titleChanged) {
                await updateTitle.mutateAsync({ id, title });
            }
            if (textChanged || blocksChanged) {
                const contentToSave = JSON.stringify(serverData);
                await updateContent.mutateAsync({ id, content: contentToSave });
            }
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
            lastSavedData.current = { title, text, blocks };
            await utils.document.getById.invalidate(id);
            await utils.document.getAll.invalidate();
        } catch {
            setSaveStatus('error');
        } finally {
            isSaving.current = false;
        }
    }, [documentData, id, updateTitle, updateContent]);

    // UI для состояний загрузки и ошибок
    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white">
                <LoaderCircle className="h-12 w-12 animate-spin text-blue-400" />
                <p className="mt-4 text-lg">Загрузка документа...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white">
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <h2 className="mt-4 text-xl font-bold">Ошибка при загрузке документа</h2>
                <p className="mt-2 text-zinc-400">{error.message}</p>
                <div className="mt-6 flex gap-4">
                    <button 
                        onClick={() => refetch()} 
                        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        Попробовать снова
                    </button>
                    <button 
                        onClick={() => router.push('/')} 
                        className="rounded border border-zinc-600 px-4 py-2 font-medium text-zinc-300 hover:bg-zinc-800"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-zinc-900 p-0">
            <div className="fixed right-6 top-4 z-50 flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm">
                {saveStatus === 'saving' && (
                    <>
                        <LoaderCircle className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="text-zinc-300">Сохранение...</span>
                    </>
                )}
                {saveStatus === 'error' && (
                    <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">Ошибка сохранения</span>
                    </>
                )}
                {saveStatus === 'saved' && !hasPendingChanges && (
                    <>
                        <Save className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Сохранено</span>
                    </>
                )}
            </div>
            <DocumentEditor
                initialTitle={documentData.title}
                initialContent={documentData.text}
                initialBlocks={documentData.blocks}
                onTitleChange={title => handleDocumentChange({ title })}
                onContentChange={text => handleDocumentChange({ text })}
                onBlocksChange={blocks => handleDocumentChange({ blocks })}
            />
        </div>
    );
}