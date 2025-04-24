'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Check, List, Calendar as CalendarIcon, Table, Layout, ChevronDown, Type, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import RichTextEditor from './RichTextEditor';
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setBlocks(initialBlocks);
  }, [initialTitle, initialContent, initialBlocks]);

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
      setIsSaving(false);
    }, 800),
    [onContentChange]
  );

  const debouncedBlocksChange = useCallback(
    debounce((newBlocks: DocumentBlock[]) => {
      onBlocksChange?.(newBlocks);
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
      debouncedContentChange(newContent);
    }
  };

  const handleBlockChange = (id: string, content: any) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    
    setBlocks(updatedBlocks);
    setIsSaving(true);
    debouncedBlocksChange(updatedBlocks);
  };

  const handleAddBlock = (type: DocumentBlock['type']) => {
    const newBlock: DocumentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
    };
    
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    setIsSaving(true);
    debouncedBlocksChange(updatedBlocks);
    setIsAddMenuOpen(false);
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
        return <Check className="w-5 h-5 text-emerald-500" />;
      case 'calendar':
        return <CalendarIcon className="w-5 h-5 text-blue-400" />;
      case 'table':
        return <Table className="w-5 h-5 text-purple-500" />;
      case 'dashboard':
        return <Layout className="w-5 h-5 text-yellow-500" />;
      default:
        return <Type className="w-5 h-5 text-zinc-400" />;
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

  const renderBlock = (block: DocumentBlock) => {
    switch (block.type) {
      case 'checklist':
        return (
          <div className="mb-8 relative group">
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
        <RichTextEditor
          initialContent={content}
          onSave={handleContentChange}
          placeholder="Начните писать..."
        />

        {blocks.map(block => (
          <div key={block.id} className="mt-8">
            {renderBlock(block)}
          </div>
        ))}
      </div>

      <div className="relative mt-10">
        <button
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 shadow-sm transition-colors"
        >
          <PlusCircle className="w-5 h-5 text-blue-400" />
          <span>Добавить блок</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isAddMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 p-1 z-10">
            <div className="p-2 text-xs font-medium text-zinc-400 border-b border-zinc-700">
              Выберите тип блока
            </div>
            <div className="py-1">
              <button
                onClick={() => handleAddBlock('checklist')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-700 rounded text-zinc-300 transition-colors"
              >
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Чеклист</span>
              </button>
              <button
                onClick={() => handleAddBlock('calendar')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-700 rounded text-zinc-300 transition-colors"
              >
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span>Календарь</span>
              </button>
              <button
                onClick={() => handleAddBlock('table')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-700 rounded text-zinc-300 transition-colors"
              >
                <Table className="w-5 h-5 text-purple-500" />
                <span>Таблица</span>
              </button>
              <button
                onClick={() => handleAddBlock('dashboard')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-700 rounded text-zinc-300 transition-colors"
              >
                <Layout className="w-5 h-5 text-yellow-500" />
                <span>Таск-менеджер</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditor; 