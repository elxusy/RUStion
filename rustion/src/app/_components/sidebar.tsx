'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Trash2, Plus, FileText, Home } from 'lucide-react';
import DocumentList from './doclist';
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

type Document = RouterOutputs["document"]["getAll"][number];

export default function ResizableSidebar() {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();
  const { data: documents = [], isError } = api.document.getAll.useQuery(undefined, {
    retry: 1
  });

  const createDocument = api.document.create.useMutation({
    onSuccess: async (newDoc) => {
      console.log("Документ успешно создан:", newDoc.id);
      try {
        await utils.document.getAll.invalidate();
      } catch (err) {
        console.error("Ошибка при обновлении списка документов:", err);
      }
    },
    onError: (error) => {
      console.error("Ошибка при создании документа:", error);
    }
  });

  const deleteDocument = api.document.delete.useMutation({
    onSuccess: async () => {
      try {
        await utils.document.getAll.invalidate();
      } catch (err) {
        console.error("Ошибка при обновлении списка после удаления:", err);
      }
    },
    onError: (error) => {
      console.error("Ошибка при удалении документа:", error);
    }
  });

  const togglePin = api.document.togglePin.useMutation({
    onSuccess: async () => {
      try {
        await utils.document.getAll.invalidate();
      } catch (err) {
        console.error("Ошибка при обновлении списка после закрепления:", err);
      }
    },
    onError: (error) => {
      console.error("Ошибка при закреплении документа:", error);
    }
  });

  const updateOrder = api.document.updateOrder.useMutation({
    onSuccess: async () => {
      try {
        await utils.document.getAll.invalidate();
      } catch (err) {
        console.error("Ошибка при обновлении порядка документов:", err);
      }
    },
    onError: (error) => {
      console.error("Ошибка при изменении порядка:", error);
    }
  });

  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'collapsed') {
      setIsCollapsed(true);
    }
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      localStorage.setItem('sidebarState', 'collapsed');
    } else {
      localStorage.setItem('sidebarState', 'expanded');
    }
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [isCollapsed, sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && !isCollapsed) {
        const newWidth = e.clientX;
        const clamped = Math.max(280, Math.min(newWidth, 400));
        setSidebarWidth(clamped);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, isCollapsed]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTrash(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOverTrash(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTrash(false);
    try {
      const docId = e.dataTransfer.getData('text/plain');
      if (!docId) {
        console.error("Ошибка при удалении: ID документа не найден");
        return;
      }
      console.log("Удаление документа:", docId);
      if (!deleteDocument.isPending) {
        deleteDocument.mutate(docId);
      }
    } catch (error: unknown) {
      console.error("Ошибка при обработке перетаскивания для удаления:", error);
    }
  };

  const createNewDocument = () => {
    try {
      const title = `Новый документ ${documents.length + 1}`;
      console.log("Создаю новый документ:", title);
      createDocument.mutate({ 
        title,
        content: "",
      });
    } catch (error: unknown) {
      console.error("Ошибка при создании документа:", error);
    }
  };

  const handleTogglePin = (docId: string) => {
    const doc = documents.find((d: Document) => d.id === docId);
    if (doc) {
      togglePin.mutate({ id: docId, isPinned: !doc.isPinned });
    }
  };

  const reorderDocuments = (draggedId: string, targetId: string) => {
    try {
      if (!draggedId || !targetId) {
        console.error("Ошибка: ID документов не указаны");
        return;
      }
      
      if (togglePin.isPending || updateOrder.isPending) {
        return;
      }
      
      const draggedDoc = documents.find((d: Document) => d.id === draggedId);
      const targetDoc = documents.find((d: Document) => d.id === targetId);
      
      if (!draggedDoc || !targetDoc) {
        console.error("Ошибка: документы не найдены", { draggedId, targetId });
        return;
      }
  
      if (draggedDoc.isPinned !== targetDoc.isPinned) {
        console.log("Изменение закрепления при переносе между секциями:", { 
          draggedId, 
          targetId, 
          newPinned: targetDoc.isPinned 
        });
        togglePin.mutate({ id: draggedId, isPinned: targetDoc.isPinned });
      } else {
        const newOrder = targetDoc.order ? targetDoc.order + 1 : 1;
        console.log(`Обновляем порядок документа ${draggedId} на ${newOrder}`);
        updateOrder.mutate({ id: draggedId, order: newOrder });
      }
    } catch (error: unknown) {
      console.error("Ошибка при изменении порядка документов:", error);
    }
  };

  return (
    <>
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute top-4 left-4 z-50 bg-zinc-800 p-2 rounded hover:bg-zinc-700 transition"
        >
          ≡
        </button>
      )}

      <div
        ref={sidebarRef}
        style={{
          width: isCollapsed ? 0 : sidebarWidth,
          transition: isResizing ? 'none' : 'width 0.2s ease',
        }}
        className="relative bg-zinc-800 border-r border-zinc-700 h-screen flex-shrink-0 overflow-hidden flex flex-col"
      >
        {!isCollapsed && (
          <>
            {/* Фиксированный верхний блок */}
            <div className="flex-shrink-0 p-4 border-b border-zinc-700">
              {/* Заголовок */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold truncate mr-2">RUStion</h1>
                <button
                  onClick={createNewDocument}
                  className="p-2 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
                  title="Новый документ"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Навигация */}
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 p-2 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
                >
                  <Home className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Главная</span>
                </Link>
              </nav>
            </div>

            {/* Скроллируемый список документов */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-zinc-700">
                <div className="sticky top-0 bg-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-400">
                    Документы
                  </h2>
                </div>
                <div className="custom-scrollbar mt-2 h-[50vh] overflow-y-auto">
                  {isError ? (
                    <div className="text-red-400 text-sm p-2">
                      Ошибка загрузки документов. Обновите страницу.
                    </div>
                  ) : (
                    <DocumentList 
                      documents={documents} 
                      onTogglePin={handleTogglePin}
                      onReorder={reorderDocuments}
                    />
                  )}
                </div>
              </div>

              {/* Фиксированная корзина внизу */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-shrink-0 p-4 border-t border-zinc-700 transition-colors mt-auto ${
                  isDraggingOverTrash ? 'bg-red-500/20' : ''
                }`}
              >
                <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300">
                  <Trash2 
                    className={`w-5 h-5 flex-shrink-0 ${
                      isDraggingOverTrash 
                        ? 'animate-[shake_0.5s_ease-in-out_infinite]' 
                        : ''
                    }`} 
                  />
                  <span className="truncate">Корзина</span>
                </div>
              </div>
            </div>

            {/* Кнопка сворачивания */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-4 -right-3 bg-zinc-700 text-sm w-6 h-6 rounded-full hover:bg-zinc-600 transition flex items-center justify-center z-10"
            >
              ←
            </button>

            {/* Ресайзер */}
            <div
              onMouseDown={() => setIsResizing(true)}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
            />
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: rotate(-10deg); }
          25% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #52525b transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #52525b;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #71717a;
        }
      `}</style>
    </>
  );
}