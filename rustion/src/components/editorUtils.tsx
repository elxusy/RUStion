import { Type, Check, Calendar as CalendarIcon, Table, Layout } from 'lucide-react';
import React from 'react';

export type DocumentBlock = {
  id: string;
  type: 'text' | 'notion-text' | 'checklist' | 'calendar' | 'table' | 'dashboard';
  content: any;
};

export function getDefaultContentForType(type: DocumentBlock['type']): any {
  switch (type) {
    case 'notion-text':
      return '';
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
}

export function getBlockIcon(type: DocumentBlock['type']) {
  switch (type) {
    case 'notion-text':
      return (
        <div className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-900/30">
          <Type className="w-4 h-4 text-blue-400" />
        </div>
      );
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
}

export function getBlockName(type: DocumentBlock['type']) {
  switch (type) {
    case 'notion-text':
      return 'Текстовый блок';
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
} 