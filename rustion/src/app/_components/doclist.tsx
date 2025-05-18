import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Pin } from 'lucide-react';
import { type RouterOutputs } from "~/trpc/shared";

type Document = RouterOutputs["document"]["getAll"][number];

interface DocumentListProps {
  documents: Document[];
  onTogglePin: (docId: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onTogglePin, onReorder }) => {
  const router = useRouter();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'top' | 'bottom' } | null>(null);


  const sortDocs = useCallback((a: Document, b: Document) => {
    if (a.order !== undefined && b.order !== undefined) {
      return b.order - a.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  }, []);

  const { pinnedDocs, unpinnedDocs } = useMemo(() => {
    const pinned = documents
      .filter(doc => doc.isPinned)
      .sort(sortDocs);

    const unpinned = documents
      .filter(doc => !doc.isPinned)
      .sort(sortDocs);
      
    return { pinnedDocs: pinned, unpinnedDocs: unpinned };
  }, [documents, sortDocs]);

  const handleClick = (e: React.MouseEvent, docId: string) => {
    if (e.buttons === 1) return;
    router.push(`/doc/${docId}`);
  };

  const handleDragStart = (e: React.DragEvent, docId: string) => {
    e.dataTransfer.setData('text/plain', docId);
    setDraggedId(docId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === targetId) {
      setDropTarget(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    const position = e.clientY < midPoint ? 'top' : 'bottom';
    
    setDropTarget({ id: targetId, position });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (targetId: string) => {
    const draggedDocId = draggedId;
    

    setDraggedId(null);
    setDropTarget(null);

    if (!draggedDocId || draggedDocId === targetId) {
      return;
    }

    const draggedDoc = documents.find(doc => doc.id === draggedDocId);
    const targetDoc = documents.find(doc => doc.id === targetId);


    if (draggedDoc && targetDoc && draggedDoc.isPinned === targetDoc.isPinned) {
      if (draggedDoc.order !== targetDoc.order) {
        onReorder(draggedDocId, targetId);
      }
    } else {

      onReorder(draggedDocId, targetId);
    }
  };

  const renderDocument = (doc: Document) => (
    <div
      key={doc.id}
      draggable
      onClick={(e) => handleClick(e, doc.id)}
      onDragStart={(e) => handleDragStart(e, doc.id)}
      onDragOver={(e) => handleDragOver(e, doc.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        e.preventDefault();

        if (!draggedId) {
          const dataId = e.dataTransfer.getData('text/plain');
          if (dataId) {
            setDraggedId(dataId);
            handleDrop(doc.id);
          }
        } else {
          handleDrop(doc.id);
        }
      }}
      className={`${dropTarget && dropTarget.id === doc.id ? 'relative' : ''}`}
    >
      <div
        className={`group flex items-center gap-2 p-2 hover:bg-zinc-700 rounded-lg cursor-pointer select-none ${
          draggedId === doc.id ? 'opacity-50' : ''
        }`}
      >
        <FileText className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 flex-shrink-0" />
        <span className="flex-1 text-zinc-300 group-hover:text-white truncate">
          {doc.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(doc.id);
          }}
          className={`flex-shrink-0 p-1 rounded hover:bg-zinc-600 transition-opacity ${
            doc.isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Pin className={`w-4 h-4 ${doc.isPinned ? 'text-blue-400' : 'text-zinc-400'}`} />
        </button>
      </div>
      {dropTarget && dropTarget.id === doc.id && (
        <div 
          className={`absolute left-0 right-0 h-0.5 bg-blue-400 ${
            dropTarget?.position === 'top' ? '-top-px' : '-bottom-px'
          }`} 
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Закрепленные документы */}
      {pinnedDocs.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-zinc-500 px-2">Закрепленные</div>
          {pinnedDocs.map(renderDocument)}
        </div>
      )}

      {/* Остальные документы */}
      <div className="space-y-1">
        {pinnedDocs.length > 0 && unpinnedDocs.length > 0 && (
          <div className="text-xs font-medium text-zinc-500 px-2">Остальные</div>
        )}
        {unpinnedDocs.map(renderDocument)}
      </div>

      {/* Сообщение об отсутствии документов */}
      {documents.length === 0 && (
        <div className="text-zinc-500 text-sm p-2">
          Нет документов
        </div>
      )}
    </div>
  );
};

export default DocumentList;