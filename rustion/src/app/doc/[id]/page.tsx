'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoaderCircle, Save, AlertTriangle } from 'lucide-react';
import { api } from "~/trpc/react";
import DocumentEditor from '~/components/DocumentEditor';
import type { DocumentBlock } from '~/components/DocumentEditor';

// Изменяем структуру данных документа
type DocumentData = {
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
    const [docTitle, setDocTitle] = useState('');
    const [documentData, setDocumentData] = useState<DocumentData>({ text: '', blocks: [] });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isUsingBlocks, setIsUsingBlocks] = useState(false);
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const lastSavedData = useRef<{
      title?: string, 
      textContent?: string, 
      blocks?: DocumentBlock[]
    }>({});
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const userActiveRef = useRef(false);

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
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => {
            setSaveStatus('error');
        },
    });

    // Функция для отслеживания активности пользователя
    const markUserActive = useCallback(() => {
        userActiveRef.current = true;
        
        // Сбрасываем предыдущий таймер неактивности
        if (activityTimeoutRef.current) {
            clearTimeout(activityTimeoutRef.current);
        }
        
        // Устанавливаем новый таймер неактивности
        activityTimeoutRef.current = setTimeout(() => {
            userActiveRef.current = false;
            
            // Если есть несохраненные изменения, сохраняем их
            if (hasPendingChanges) {
                saveDocument();
            }
        }, 3000); // Пользователь считается неактивным после 3 секунд бездействия
    }, [hasPendingChanges]);

    // Функция для сохранения данных документа
    const saveDocument = useCallback(() => {
        const titleToSave = docTitle;
        const dataToSave = documentData;
        
        // Отменяем предыдущий таймер сохранения, если он был
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        // Формируем данные для сервера в новом формате
        const serverData: ServerDocumentData = {
            textContent: dataToSave.text || ''
        };
        
        // Если есть блоки, сохраняем их отдельно
        if (isUsingBlocks && dataToSave.blocks.length > 0) {
            serverData.blocksContent = JSON.stringify(dataToSave.blocks);
        }

        // Проверка, действительно ли данные изменились
        const textChanged = dataToSave.text !== (lastSavedData.current.textContent || '');
        const blocksChanged = isUsingBlocks && 
            JSON.stringify(dataToSave.blocks) !== JSON.stringify(lastSavedData.current.blocks || []);
        const titleChanged = titleToSave !== (lastSavedData.current.title || '');

        // Только если данные изменились, сохраняем их
        if (titleChanged || textChanged || blocksChanged) {
            console.log('Сохраняем изменения в документе', { 
                titleChanged,
                textChanged,
                blocksChanged,
                isUsingBlocks,
                currentText: dataToSave.text
            });
            
            setSaveStatus('saving');
            
            try {
                // Сохраняем заголовок, если он изменился
                if (titleChanged) {
                    updateTitle.mutate({ id, title: titleToSave });
                    lastSavedData.current.title = titleToSave;
                }
                
                // Преобразуем данные в JSON для сохранения
                const contentToSave = JSON.stringify(serverData);
                console.log('Сохраняем контент в формате:', contentToSave);
                
                // Используем мутацию для сохранения всех данных вместе
                updateContent.mutate({ 
                    id, 
                    content: contentToSave
                }, {
                    onSuccess: () => {
                        console.log('Текст успешно сохранен');
                        // Обновляем последние сохраненные данные
                        lastSavedData.current.textContent = dataToSave.text;
                        
                        if (isUsingBlocks) {
                            lastSavedData.current.blocks = JSON.parse(JSON.stringify(dataToSave.blocks));
                        }
                        
                        // Очищаем флаг ожидающих изменений
                        setHasPendingChanges(false);
                    }
                });
            } catch (error: unknown) {
                console.error('Ошибка при сохранении документа:', error);
                setSaveStatus('error');
            }
        } else {
            console.log('Нет изменений для сохранения');
            // Если изменений нет, просто сбрасываем флаг
            setHasPendingChanges(false);
        }
    }, [docTitle, documentData, id, isUsingBlocks, updateTitle, updateContent]);

    // Запланировать отложенное сохранение
    const scheduleSave = useCallback(() => {
        // Отмечаем пользователя активным при любом изменении
        markUserActive();
        
        // Устанавливаем флаг наличия изменений
        setHasPendingChanges(true);
        
        // Отменяем предыдущий таймер, если он был
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Устанавливаем таймер на автосохранение через 2 секунды,
        // даже если пользователь всё ещё активен
        saveTimeoutRef.current = setTimeout(() => {
            if (!userActiveRef.current) {
                saveDocument();
            }
        }, 2000);
    }, [markUserActive, saveDocument]);

    // Обработка изменений текста
    const handleContentChange = (content: string) => {
        console.log('Изменился текст документа', content.length);
        setDocumentData(prev => ({ ...prev, text: content }));
        scheduleSave();
    };

    // Обработка изменений заголовка
    const handleTitleChange = (title: string) => {
        setDocTitle(title);
        scheduleSave();
    };

    // Обработка изменений блоков
    const handleBlocksChange = (blocks: DocumentBlock[]) => {
        console.log('Изменились блоки документа', blocks.length);
        setIsUsingBlocks(true);
        setDocumentData(prev => ({ ...prev, blocks }));
        scheduleSave();
    };

    // При изменении документа с сервера
    useEffect(() => {
        if (document) {
            setDocTitle(document.title);
            lastSavedData.current.title = document.title;
            
            // Устанавливаем контент
            if (document.content) {
                try {
                    // Пробуем парсить как JSON (в новом формате)
                    const serverData = JSON.parse(document.content) as ServerDocumentData;
                    
                    // Проверяем формат данных
                    if (serverData && typeof serverData === 'object') {
                        // Новый формат с разделением текста и блоков
                        if ('textContent' in serverData) {
                            setDocumentData(prev => ({ ...prev, text: serverData.textContent || '' }));
                            lastSavedData.current.textContent = serverData.textContent || '';
                            
                            // Если есть блоки, загружаем их
                            if (serverData.blocksContent) {
                                try {
                                    const blocks = JSON.parse(serverData.blocksContent) as DocumentBlock[];
                                    setDocumentData(prev => ({ ...prev, blocks }));
                                    setIsUsingBlocks(true);
                                    lastSavedData.current.blocks = blocks;
                                } catch (e) {
                                    console.error('Ошибка при парсинге блоков', e);
                                    setIsUsingBlocks(false);
                                }
                            }
                        } 
                        // Старый формат (для обратной совместимости)
                        else if (Array.isArray(document.content)) {
                            setDocumentData({ text: '', blocks: document.content });
                            setIsUsingBlocks(true);
                            lastSavedData.current.blocks = document.content;
                        } else {
                            // Если не массив, значит это обычный текст или HTML
                            setDocumentData({ text: document.content, blocks: [] });
                            setIsUsingBlocks(false);
                            lastSavedData.current.textContent = document.content;
                        }
                    } else {
                        // Старый формат данных - только текст
                        setDocumentData({ text: document.content, blocks: [] });
                        setIsUsingBlocks(false);
                        lastSavedData.current.textContent = document.content;
                    }
                } catch (e) {
                    // Если не удалось распарсить JSON, считаем что это обычный текст или HTML
                    setDocumentData({ text: document.content, blocks: [] });
                    setIsUsingBlocks(false);
                    lastSavedData.current.textContent = document.content;
                }
            } else {
                // Нет контента
                setDocumentData({ text: '', blocks: [] });
                setIsUsingBlocks(false);
                lastSavedData.current.textContent = '';
            }
        }
    }, [document]);

    // Событие потери фокуса - сохраняем при переключении на другую вкладку
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (window.document.visibilityState === 'hidden' && hasPendingChanges) {
                saveDocument();
            }
        };
        
        window.document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [saveDocument, hasPendingChanges]);

    // Настройка глобальных обработчиков событий для отслеживания активности
    useEffect(() => {
        const handleUserActivity = () => {
            markUserActive();
        };
        
        // Отслеживаем активность пользователя
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('touchstart', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);
        
        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('touchstart', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
        };
    }, [markUserActive]);

    // Автосохранение перед уходом со страницы
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasPendingChanges) {
                // Попытка синхронного сохранения перед закрытием
                console.log('Сохранение перед закрытием страницы');
                saveDocument();
                
                // Стандартное предупреждение о несохраненных изменениях
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            
            // Принудительно сохраняем при размонтировании компонента
            if (hasPendingChanges) {
                console.log('Сохранение при размонтировании компонента');
                try {
                    // Формируем данные для сервера
                    const serverData: ServerDocumentData = {
                        textContent: documentData.text || ''
                    };
                    
                    // Если есть блоки, сохраняем их отдельно
                    if (isUsingBlocks && documentData.blocks.length > 0) {
                        serverData.blocksContent = JSON.stringify(documentData.blocks);
                    }
                    
                    // Преобразуем в JSON для сохранения
                    const contentToSave = JSON.stringify(serverData);
                        
                    // Используем напрямую API на сервере - синхронное сохранение
                    fetch(`/api/trpc/document.updateContent?batch=1`, {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            0: {
                                json: {
                                    id,
                                    content: contentToSave
                                }
                            }
                        })
                    }).then(() => {
                        console.log('Сохранение выполнено успешно при размонтировании');
                    }).catch((err) => {
                        console.error('Ошибка сохранения при размонтировании', err);
                    });
                    
                    if (docTitle !== lastSavedData.current.title) {
                        fetch(`/api/trpc/document.updateTitle?batch=1`, {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                0: {
                                    json: {
                                        id,
                                        title: docTitle
                                    }
                                }
                            })
                        });
                    }
                } catch (e) {
                    console.error('Ошибка принудительного сохранения', e);
                }
            }
            
            // Очищаем все таймеры
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (activityTimeoutRef.current) {
                clearTimeout(activityTimeoutRef.current);
            }
        };
    }, [saveDocument, hasPendingChanges, docTitle, documentData, id, isUsingBlocks]);

    // Обработчик для принудительного сохранения по нажатию Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasPendingChanges) {
                    saveDocument();
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [saveDocument, hasPendingChanges]);

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
                {(saveStatus === 'idle' && !hasPendingChanges) && (
                    <span className="text-zinc-400">Сохранено</span>
                )}
                {(saveStatus === 'idle' && hasPendingChanges) && (
                    <span className="text-zinc-400">Изменения не сохранены</span>
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
                
                {hasPendingChanges && (
                    <button 
                        onClick={saveDocument}
                        className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                        Сохранить
                    </button>
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