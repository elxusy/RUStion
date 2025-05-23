'use client';

import React, { useState, useEffect, useCallback, useRef, memo, forwardRef, useImperativeHandle } from 'react';
import { PlusCircle, Check, List, Calendar as CalendarIcon, Table, Layout, ChevronDown, Type, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import ChecklistComponent from './ChecklistComponent';
import type { ChecklistItem } from './ChecklistComponent';
import CalendarComponent from './CalendarComponent';
import type { CalendarEvent } from './CalendarComponent';
import TableComponent from './TableComponent';
import type { TableComponentHandle } from './TableComponent';
import DashboardComponent from './DashboardComponent';
import type { TaskItem, ColumnInfo } from './DashboardComponent';
import NotionTextBlock from './NotionTextBlock';
import type { DocumentBlock } from './editorUtils';
import { getDefaultContentForType, getBlockIcon, getBlockName } from './editorUtils';

type DocumentEditorProps = {
  initialTitle: string;
  initialContent: string;
  initialBlocks?: DocumentBlock[];
};

export type DocumentEditorHandle = {
  getCurrentData: () => { title: string; content: string; blocks: DocumentBlock[] };
  setCurrentData: (data: { title: string; content: string; blocks: DocumentBlock[] }) => void;
};

export const DocumentEditor = forwardRef<DocumentEditorHandle, DocumentEditorProps>(function DocumentEditor({
  initialTitle,
  initialContent,
  initialBlocks = [],
}, ref) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [blocks, setBlocks] = useState<DocumentBlock[]>(initialBlocks);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ top: 0, left: 0 });
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const tableRefs = useRef<{ [blockId: string]: TableComponentHandle | null }>({});

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setBlocks(initialBlocks);
  }, [initialTitle, initialContent, initialBlocks]);

  useImperativeHandle(ref, () => ({
    getCurrentData: () => {
      const updatedBlocks = blocks.map((block) => {
        if (block.type === 'table' && tableRefs.current[block.id]) {
          return { ...block, content: tableRefs.current[block.id]!.getCurrentData() };
        }
        return block;
      });
      return { title, content, blocks: updatedBlocks };
    },
    setCurrentData: (data) => {
      setTitle(data.title);
      setContent(data.content);
      setBlocks(data.blocks);
    },
  }), [title, content, blocks]);

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

  const handleChange = useCallback((patch: Partial<{ title: string; content: string; blocks: DocumentBlock[] }>) => {
    if (patch.title !== undefined) {
      setTitle(patch.title);
    }
    if (patch.content !== undefined) {
      setContent(patch.content);
    }
    if (patch.blocks !== undefined) {
      setBlocks(patch.blocks);
    }
  }, []);

  const openAddBlockMenu = (e: React.MouseEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    

    const menuWidth = 280; 
    const menuHeight = 300; 
    

    const left = Math.min(e.clientX, windowWidth - menuWidth - 20);
    const top = Math.min(e.clientY + 10, windowHeight - menuHeight - 20);
    
    setAddMenuPosition({
      left,
      top
    });
    
    if (index !== undefined) {
      setActiveBlockIndex(index);
    }
    
    setIsAddMenuOpen(true);
  };

  const handleAddBlockAtPosition = (type: DocumentBlock['type']) => {
    const newBlock: DocumentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
    };
    
    let updatedBlocks: DocumentBlock[];
    
    if (activeBlockIndex !== null) {
      updatedBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
    } else {
      updatedBlocks = [...blocks, newBlock];
    }
    
    setBlocks(updatedBlocks);
    handleChange({ blocks: updatedBlocks });
    setIsAddMenuOpen(false);
    setActiveBlockIndex(null);
  };

  const handleRemoveBlock = (id: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    setBlocks(updatedBlocks);
    handleChange({ blocks: updatedBlocks });
  };

  const BlockView = memo(function BlockView({ block, index, openAddBlockMenu, blocks, handleChange }: {
    block: DocumentBlock;
    index: number;
    openAddBlockMenu: (e: React.MouseEvent, index?: number) => void;
    blocks: DocumentBlock[];
    handleChange: (patch: Partial<{ title: string; content: string; blocks: DocumentBlock[] }>) => void;
  }) {
    if (block.type === 'notion-text') {
      const [localValue, setLocalValue] = React.useState(block.content);
      React.useEffect(() => {
        if (block.content !== localValue) {
          setLocalValue(block.content);
        }
      }, [block.content]);
      const debouncedHandleChange = React.useRef(
        debounce((val: string) => {
          handleChange({ blocks: blocks.map((b, i) => i === index ? { ...b, content: val } : b) });
        }, 1000)
      ).current;
      const handleLocalChange = (val: string) => {
        setLocalValue(val);
        debouncedHandleChange(val);
      };
      return (
        <div className="mb-8 relative group">
          <div className="block-toolbar absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => openAddBlockMenu(e, index)}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
              title="Добавить блок"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              {getBlockIcon(block.type)}
              <span>{getBlockName(block.type)}</span>
            </div>
            <button
              onClick={() => handleChange({ blocks: blocks.filter((b, i) => i !== index) })}
              className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
              title="Удалить блок"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="block-content">
            <NotionTextBlock
              value={localValue}
              onChange={handleLocalChange}
              placeholder="Введите текст..."
            />
          </div>
        </div>
      );
    }
    switch (block.type) {
      case 'checklist':
        return (
          <div className="mb-8 relative group">
            <div className="block-toolbar absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => openAddBlockMenu(e, index)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
                title="Добавить блок"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                {getBlockIcon(block.type)}
                <span>{getBlockName(block.type)}</span>
              </div>
              <button
                onClick={() => handleChange({ blocks: blocks.filter((b, i) => i !== index) })}
                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
                title="Удалить блок"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="block-content">
              <ChecklistComponent
                initialItems={block.content}
                onChange={(items) => handleChange({ blocks: blocks.map((b, i) => i === index ? { ...b, content: items } : b) })}
              />
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="mb-8 relative group">
            <div className="block-toolbar absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => openAddBlockMenu(e, index)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
                title="Добавить блок"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                {getBlockIcon(block.type)}
                <span>{getBlockName(block.type)}</span>
              </div>
              <button
                onClick={() => handleChange({ blocks: blocks.filter((b, i) => i !== index) })}
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
        const [localData, setLocalData] = React.useState(block.content);
        React.useEffect(() => {
          if (block.content !== localData) {
            setLocalData(block.content);
          }
        }, [block.content]);
        const debouncedHandleChangeTable = React.useRef(
          debounce((val: any) => {
            handleChange({ blocks: blocks.map((b, i) => i === index ? { ...b, content: val } : b) });
          }, 1000)
        ).current;
        const handleTableChange = (val: any) => {
          setLocalData(val);
          debouncedHandleChangeTable(val);
        };
        return (
          <div className="mb-8 relative group">
            <div className="block-toolbar absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => openAddBlockMenu(e, index)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
                title="Добавить блок"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                {getBlockIcon(block.type)}
                <span>{getBlockName(block.type)}</span>
              </div>
              <button
                onClick={() => handleChange({ blocks: blocks.filter((b, i) => i !== index) })}
                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-all"
                title="Удалить блок"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="block-content">
              <TableComponent
                ref={(el) => {
                  if (el) {
                    tableRefs.current[block.id] = el;
                  }
                }}
                data={localData}
                onChange={handleTableChange}
              />
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="mb-8 relative group">
            <div className="block-toolbar absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => openAddBlockMenu(e, index)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-all"
                title="Добавить блок"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="block-header flex items-center justify-between mb-2 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                {getBlockIcon(block.type)}
                <span>{getBlockName(block.type)}</span>
              </div>
              <button
                onClick={() => handleChange({ blocks: blocks.filter((b, i) => i !== index) })}
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
                onChange={(columns, tasks) => handleChange({ blocks: blocks.map((b, i) => i === index ? { ...b, content: { columns, tasks } } : b) })}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  });

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
          onChange={(e) => handleChange({ title: e.target.value })}
          className="text-3xl font-bold w-full border-none outline-none focus:ring-0 py-2 text-zinc-200 bg-transparent"
          placeholder="Введите название документа..."
        />
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
        </div>

        {blocks.map((block, index) => (
          <BlockView key={block.id} block={block} index={index} openAddBlockMenu={openAddBlockMenu} blocks={blocks} handleChange={handleChange} />
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
              {['notion-text','checklist','calendar','table','dashboard'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddBlockAtPosition(type as DocumentBlock['type'])}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-zinc-700/80 transition-colors text-left"
                >
                  {getBlockIcon(type as DocumentBlock['type'])}
                  <div>
                    <div className="font-medium text-zinc-200">{getBlockName(type as DocumentBlock['type'])}</div>
                    <div className="text-xs text-zinc-400">
                      {type === 'notion-text' && 'Текст с форматированием (жирный, списки, ссылки и т.д.)'}
                      {type === 'checklist' && 'Список задач с отметками выполнения'}
                      {type === 'calendar' && 'Календарь с поддержкой событий'}
                      {type === 'table' && 'Табличные данные'}
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
});

export default DocumentEditor; 