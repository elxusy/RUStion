'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';

export default function ResizableSidebar() {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: documents, refetch: refetchDocuments } = api.document.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const createDocument = api.document.create.useMutation({
    onSuccess: () => {
      void refetchDocuments();
    },
  });

  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'collapsed') {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  const addNewDocument = () => {
    createDocument.mutate({ title: 'Новый документ' });
  };

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
        const clamped = Math.max(220, Math.min(newWidth, 400));
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

  const renderDocument = (doc: { id: string; title: string; children?: Array<{ id: string; title: string }> }) => (
    <div key={doc.id} className="ml-4">
      <Link 
        href={`/document/${doc.id}`}
        className="block hover:text-white text-zinc-300 py-1"
      >
        {doc.title}
      </Link>
      {doc.children?.map((child) => renderDocument(child))}
    </div>
  );

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
        className="relative bg-zinc-800 border-r border-zinc-700 h-full flex-shrink-0 overflow-hidden"
      >
        {!isCollapsed && (
          <div className="h-full p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-6">🗒️ RUStion</h1>
            <nav className="space-y-2">
              <Link href="/" className="block hover:text-white text-zinc-300">
                🏠 Главная
              </Link>
              <Link href="/dashboard" className="block hover:text-white text-zinc-300">
                📋 Dashboard
              </Link>
              <button
                onClick={addNewDocument}
                className="block w-full text-left hover:text-white text-zinc-300"
              >
                ➕ Новый документ
              </button>
            </nav>
            <div className="mt-4">
              {documents?.map((doc: { id: string; title: string; children?: Array<{ id: string; title: string }> }) => renderDocument(doc))}
            </div>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute top-4 -right-3 bg-zinc-700 text-sm w-6 h-6 rounded-full hover:bg-zinc-600 transition flex items-center justify-center"
          >
            ←
          </button>
        )}
        {!isCollapsed && (
          <div
            onMouseDown={() => setIsResizing(true)}
            className="absolute top-0 right-0 w-1 cursor-col-resize h-full bg-transparent"
          />
        )}
      </div>
    </>
  );
}