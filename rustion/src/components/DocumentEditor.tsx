'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusCircle, Check, List, Calendar as CalendarIcon, Table, Layout, ChevronDown, Type, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import SimpleTextEditor from './SimpleTextEditor';
import ChecklistComponent from './ChecklistComponent';
import type { ChecklistItem } from './ChecklistComponent';
import CalendarComponent from './CalendarComponent';
import type { CalendarEvent } from './CalendarComponent';
import TableComponent from './TableComponent';
import type { TableData } from './TableComponent';
import DashboardComponent from './DashboardComponent';
import type { TaskItem, ColumnInfo } from './DashboardComponent';

export type DocumentBlock = {
  id: string;
  type: 'text' | 'checklist' | 'calendar' | 'table' | 'dashboard';
  content: any;
};

type DocumentEditorProps = {
  initialTitle: string;
  initialContent: string;
  initialBlocks?: DocumentBlock[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onBlocksChange?: (blocks: DocumentBlock[]) => void;
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialTitle,
  initialContent,
  initialBlocks = [],
  onTitleChange,
  onContentChange,
  onBlocksChange,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [blocks, setBlocks] = useState<DocumentBlock[]>(initialBlocks);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ top: 0, left: 0 });
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [lastSavedBlocks, setLastSavedBlocks] = useState(initialBlocks);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setBlocks(initialBlocks);
    setLastSavedContent(initialContent);
    setLastSavedBlocks(initialBlocks);
  }, [initialTitle, initialContent, initialBlocks]);

  // Обработчик клика вне меню добавления блоков
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const debouncedTitleChange = useCallback(
    debounce((newTitle: string) => {
      onTitleChange(newTitle);
      setIsSaving(false);
    }, 800),
    [onTitleChange]
  );

  const debouncedContentChange = useCallback(
    debounce((newContent: string) => {
      onContentChange(newContent);
      setLastSavedContent(newContent);
      setIsSaving(false);
    }, 800),
    [onContentChange]
  );

  const debouncedBlocksChange = useCallback(
    debounce((newBlocks: DocumentBlock[]) => {
      onBlocksChange?.(newBlocks);
      setLastSavedBlocks(newBlocks);
      setIsSaving(false);
    }, 800),
    [onBlocksChange]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsSaving(true);
    debouncedTitleChange(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    if (newContent !== content) {
      setContent(newContent);
      setIsSaving(true);
      
      // Проверяем, изменилось ли содержимое относительно сохраненного
      if (newContent !== lastSavedContent) {
        debouncedContentChange(newContent);
      } else {
        setIsSaving(false);
      }
    }
  };

  // Обработка завершения сохранения контента
  const handleContentSaved = (savedContent: string) => {
    setLastSavedContent(savedContent);
    setIsSaving(false);
  };

  const handleBlockChange = (id: string, blockContent: any) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, content: blockContent } : block
    );
    
    setBlocks(updatedBlocks);
    setIsSaving(true);
    
    // Проверяем, изменились ли блоки относительно сохраненных
    if (JSON.stringify(updatedBlocks) !== JSON.stringify(lastSavedBlocks)) {
      debouncedBlocksChange(updatedBlocks);
    } else {
      setIsSaving(false);
    }
  };

  // Обработка завершения сохранения блоков
  const handleBlocksSaved = (savedBlocks: DocumentBlock[]) => {
    setLastSavedBlocks(savedBlocks);
    setIsSaving(false);
  };

  // Открыть меню добавления блока с указанной позицией
  const openAddBlockMenu = (e: React.MouseEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Получим размеры окна
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Предполагаемая ширина и высота меню
    const menuWidth = 280; // px
    const menuHeight = 300; // px
    
    // Вычисляем позицию с учетом границ экрана
    const left = Math.min(e.clientX, windowWidth - menuWidth - 20);
    const top = Math.min(e.clientY + 10, windowHeight - menuHeight - 20);
    
    // Установим позицию меню
    setAddMenuPosition({
      left,
      top
    });
    
    // Если передан индекс, запомним его для вставки блока
    if (index !== undefined) {
      setActiveBlockIndex(index);
    }
    
    setIsAddMenuOpen(true);
  };

  // Добавить блок в указанную позицию
  const handleAddBlockAtPosition = (type: DocumentBlock['type']) => {
    const newBlock: DocumentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
    };
    
    let updatedBlocks: DocumentBlock[];
    
    // Если задан индекс, вставляем блок после него
    if (activeBlockIndex !== null) {
      updatedBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
    } else {
      // Иначе добавляем в конец
      updatedBlocks = [...blocks, newBlock];
    }
    
    setBlocks(updatedBlocks);
    setIsSaving(true);
    debouncedBlocksChange(updatedBlocks);
    setIsAddMenuOpen(false);
    setActiveBlockIndex(null);
  };

  const handleRemoveBlock = (id: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    setBlocks(updatedBlocks);
    setIsSaving(true);
    debouncedBlocksChange(updatedBlocks);
  };

  const getDefaultContentForType = (type: DocumentBlock['type']): any => {
    switch (type) {
      case 'checklist':
        return [];
      case 'calendar':
        return { events: [] };
      case 'table':
        return { headers: ['Столбец 1', 'Столбец 2'], rows: [['', '']] };
      case 'dashboard':
        return { 
          columns: [
            { id: 'todo', title: 'К выполнению', color: '#1e293b' },
            { id: 'in-progress', title: 'В процессе', color: '#0f172a' },
            { id: 'done', title: 'Выполнено', color: '#14532d' },
          ],
          tasks: []
        };
      default:
        return '';
    }
  };

  const getBlockIcon = (type: DocumentBlock['type']) => {
    switch (type) {
      case 'checklist':
        return (
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-900/30">
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
        );
      case 'calendar':
        return (
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-900/30">
            <CalendarIcon className="w-4 h-4 text-blue-400" />
          </div>
        );
      case 'table':
        return (
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-purple-900/30">
            <Table className="w-4 h-4 text-purple-500" />
          </div>
        );
      case 'dashboard':
        return (
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-900/30">
            <Layout className="w-4 h-4 text-yellow-500" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800">
            <Type className="w-4 h-4 text-zinc-400" />
          </div>
        );
    }
  };

  const getBlockName = (type: DocumentBlock['type']) => {
    switch (type) {
      case 'checklist':
        return 'Чеклист';
      case 'calendar':
        return 'Календарь';
      case 'table':
        return 'Таблица';
      case 'dashboard':
        return 'Таск-менеджер';
      default:
        return 'Текст';
    }
  };

  // Рендер верхней панели инструментов блока
  const renderBlockToolbar = (block: DocumentBlock, index: number) => {
    return (
      <div className="block-toolbar absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => openAddBlockMenu(e, index)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
          title="Добавить блок"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderBlock = (block: DocumentBlock, index: number) => {
    switch (block.type) {
      case 'checklist':
        return (
          <div className="mb-8 relative group">
            {renderBlockToolbar(block, index)}
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Чеклист</span>
              </div>
              <button
                onClick={() => handleRemoveBlock(block.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
                title="Удалить блок"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="block-content">
              <ChecklistComponent
                initialItems={block.content}
                onChange={(items) => handleBlockChange(block.id, items)}
              />
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="mb-8 relative group">
            {renderBlockToolbar(block, index)}
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span>Календарь</span>
              </div>
              <button
                onClick={() => handleRemoveBlock(block.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
                title="Удалить блок"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="block-content">
              <CalendarComponent
                events={block.content.events}
                onEventClick={() => {}}
              />
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="mb-8 relative group">
            {renderBlockToolbar(block, index)}
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Table className="w-4 h-4 text-purple-500" />
                <span>Таблица</span>
              </div>
              <button
                onClick={() => handleRemoveBlock(block.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
                title="Удалить блок"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="block-content">
              <TableComponent
                initialData={block.content}
                onChange={(data) => handleBlockChange(block.id, data)}
              />
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="mb-8 relative group">
            {renderBlockToolbar(block, index)}
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-yellow-500" />
                <span>Таск-менеджер</span>
              </div>
              <button
                onClick={() => handleRemoveBlock(block.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
                title="Удалить блок"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="block-content bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
              <DashboardComponent
                initialColumns={block.content.columns}
                initialTasks={block.content.tasks}
                onChange={(columns, tasks) => 
                  handleBlockChange(block.id, { columns, tasks })
                }
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="document-editor w-full max-w-5xl mx-auto p-6 bg-zinc-900 text-zinc-200">
      <style jsx global>{`
        .empty-content[contenteditable=true]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.3);
          cursor: text;
          font-style: italic;
        }
      `}</style>
      <div className="flex items-center justify-between gap-2 mb-8 pb-3 border-b border-zinc-700">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="text-3xl font-bold w-full border-none outline-none focus:ring-0 py-2 text-zinc-200 bg-transparent"
          placeholder="Введите название документа..."
        />
        {isSaving && (
          <span className="text-sm text-zinc-500 animate-pulse flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500 opacity-75"></span>
            Сохранение...
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div className="relative group" ref={editorRef}>
          {blocks.length === 0 && (
            <div 
              className="absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Добавить блок"
            >
              <button 
                onClick={(e) => openAddBlockMenu(e, -1)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          <SimpleTextEditor
            initialContent={content}
            onSave={handleContentChange}
            placeholder="Начните писать..."
          />
        </div>

        {blocks.map((block, index) => (
          <div key={block.id} className="mt-8">
            {renderBlock(block, index)}
          </div>
        ))}
      </div>

      <div className="my-8 relative">
        <button
          onClick={(e) => openAddBlockMenu(e)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 shadow-sm transition-colors"
        >
          <PlusCircle className="w-5 h-5 text-blue-400" />
          <span>Добавить блок</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isAddMenuOpen && (
          <div 
            ref={addMenuRef}
            className="fixed w-72 bg-zinc-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-zinc-700/80 p-2 z-50 max-h-[70vh] overflow-y-auto"
            style={{ 
              top: addMenuPosition.top, 
              left: addMenuPosition.left,
            }}
          >
            <div className="text-sm font-medium text-zinc-300 px-2 py-1.5 mb-2 border-b border-zinc-700/60">
              Выберите тип блока
            </div>
            <div className="grid grid-cols-1 gap-1.5 p-1">
              {['checklist', 'calendar', 'table', 'dashboard'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddBlockAtPosition(type as DocumentBlock['type'])}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-zinc-700/80 transition-colors text-left"
                >
                  {getBlockIcon(type as DocumentBlock['type'])}
                  <div>
                    <div className="font-medium text-zinc-200">{getBlockName(type as DocumentBlock['type'])}</div>
                    <div className="text-xs text-zinc-400">
                      {type === 'checklist' && 'Список задач с отметками выполнения'}
                      {type === 'calendar' && 'Календарь с поддержкой событий'}
                      {type === 'table' && 'Таблица для структурированных данных'}
                      {type === 'dashboard' && 'Канбан-доска для управления задачами'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditor; 