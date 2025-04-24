'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoaderCircle, Save, AlertTriangle } from 'lucide-react';
import { api } from "~/trpc/react";
import DocumentEditor from '~/components/DocumentEditor';
import type { DocumentBlock } from '~/components/DocumentEditor';

type DocumentData = {
  text: string;
  blocks: DocumentBlock[];
};

export default function DocumentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [docTitle, setDocTitle] = useState('');
    const [documentData, setDocumentData] = useState<DocumentData>({ text: '', blocks: [] });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isUsingBlocks, setIsUsingBlocks] = useState(false);
    const lastSavedData = useRef<{title?: string, content?: string, blocks?: DocumentBlock[]}>({});
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const utils = api.useUtils();
    const { data: document, isLoading, error, refetch } = api.document.getById.useQuery(id, {
      retry: 3,
      staleTime: 5000,
    });

    const updateTitle = api.document.updateTitle.useMutation({
        onSuccess: async () => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => {
            setSaveStatus('error');
        },
    });

    const updateContent = api.document.updateContent.useMutation({
        onSuccess: async () => {
            await utils.document.getById.invalidate(id);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => {
            setSaveStatus('error');
        },
    });

    // Функция для сохранения данных документа
    const saveDocument = useCallback((title?: string, data?: DocumentData) => {
        const titleToSave = title ?? docTitle;
        const dataToSave = data ?? documentData;
        
        // Отменяем предыдущий таймер, если он был
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Только если данные изменились, сохраняем их
        if (
            titleToSave !== lastSavedData.current.title || 
            JSON.stringify(dataToSave) !== JSON.stringify({
                text: lastSavedData.current.content,
                blocks: lastSavedData.current.blocks
            })
        ) {
            setSaveStatus('saving');
            
            try {
                // Сохраняем заголовок, если он изменился
                if (titleToSave !== lastSavedData.current.title) {
                    updateTitle.mutate({ id, title: titleToSave });
                    lastSavedData.current.title = titleToSave;
                }
                
                // Сохраняем текст документа
                let contentToSave = dataToSave.text;
                
                // Если используются блоки, сохраняем их как JSON
                if (isUsingBlocks && dataToSave.blocks.length > 0) {
                    contentToSave = JSON.stringify(dataToSave.blocks);
                }
                
                updateContent.mutate({ 
                    id, 
                    content: contentToSave
                });
                
                if (isUsingBlocks) {
                    lastSavedData.current.blocks = dataToSave.blocks;
                } else {
                    lastSavedData.current.content = dataToSave.text;
                }
            } catch (error) {
                console.error('Ошибка при сохранении документа:', error);
                setSaveStatus('error');
            }
        }
    }, [docTitle, documentData, id, isUsingBlocks, updateTitle, updateContent]);

    // Обработка изменений текста
    const handleContentChange = (content: string) => {
        setDocumentData(prev => ({ ...prev, text: content }));
        
        // Используем таймер для дебаунса сохранения
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(undefined, { text: content, blocks: documentData.blocks });
        }, 1000);
    };

    // Обработка изменений заголовка
    const handleTitleChange = (title: string) => {
        setDocTitle(title);
        
        // Используем таймер для дебаунса сохранения
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(title, documentData);
        }, 800);
    };

    // Обработка изменений блоков
    const handleBlocksChange = (blocks: DocumentBlock[]) => {
        setIsUsingBlocks(true);
        setDocumentData(prev => ({ ...prev, blocks }));
        
        // Используем таймер для дебаунса сохранения
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(undefined, { text: documentData.text, blocks });
        }, 1000);
    };

    // При изменении документа с сервера
    useEffect(() => {
        if (document) {
            setDocTitle(document.title);
            lastSavedData.current.title = document.title;
            
            // Пытаемся определить тип контента
            try {
                if (document.content) {
                    try {
                        // Пробуем парсить как JSON (для блоков)
                        const parsedContent = JSON.parse(document.content);
                        if (Array.isArray(parsedContent)) {
                            setDocumentData({ text: '', blocks: parsedContent });
                            setIsUsingBlocks(true);
                            lastSavedData.current.blocks = parsedContent;
                        } else {
                            // Если не массив, значит это обычный текст в JSON
                            setDocumentData({ text: document.content, blocks: [] });
                            setIsUsingBlocks(false);
                            lastSavedData.current.content = document.content;
                        }
                    } catch (e) {
                        // Если не удалось распарсить JSON, обрабатываем как обычный текст
                        setDocumentData({ text: document.content, blocks: [] });
                        setIsUsingBlocks(false);
                        lastSavedData.current.content = document.content;
                    }
                } else {
                    // Нет контента
                    setDocumentData({ text: '', blocks: [] });
                    setIsUsingBlocks(false);
                    lastSavedData.current.content = '';
                }
            } catch (e) {
                console.error('Ошибка при обработке документа:', e);
                setDocumentData({ text: document.content || '', blocks: [] });
                setIsUsingBlocks(false);
                lastSavedData.current.content = document.content || '';
            }
        }
    }, [document]);

    // Автосохранение перед уходом со страницы
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (saveStatus === 'saving') {
                saveDocument();
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Принудительно сохраняем при размонтировании
            if (saveStatus === 'saving') {
                saveDocument();
            }
        };
    }, [saveDocument, saveStatus]);

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
                {saveStatus === 'idle' && (
                    <span className="text-zinc-400">Сохранено</span>
                )}
                {saveStatus === 'saving' && (
                    <>
                        <LoaderCircle className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="text-zinc-300">Сохранение...</span>
                    </>
                )}
                {saveStatus === 'saved' && (
                    <>
                        <Save className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Сохранено</span>
                    </>
                )}
                {saveStatus === 'error' && (
                    <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">Ошибка сохранения</span>
                    </>
                )}
            </div>
            
            <DocumentEditor
                initialTitle={docTitle}
                initialContent={documentData.text}
                initialBlocks={documentData.blocks}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onBlocksChange={handleBlocksChange}
            />
        </div>
    );
}