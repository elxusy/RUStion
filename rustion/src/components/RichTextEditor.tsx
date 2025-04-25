'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bold, Italic, Link, Code, Type, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';

type RichTextEditorProps = {
  initialContent: string;
  onSave: (content: string) => void;
  placeholder?: string;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onSave,
  placeholder = 'Начните писать...'
}) => {
  const [content, setContent] = useState(initialContent || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
  const [showFormatBar, setShowFormatBar] = useState(false);

  // Инициализация контента с правильным направлением
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      fixTextDirection();
    }
  }, [initialContent]);

  // Функция для исправления направления текста
  const fixTextDirection = () => {
    if (!editorRef.current) return;
    
    // Установим явное направление для редактора
    editorRef.current.dir = 'ltr'; 
    editorRef.current.style.direction = 'ltr';
    editorRef.current.style.textAlign = 'left';
    
    // И для всех дочерних элементов
    const allElements = editorRef.current.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.dir = 'ltr';
        el.style.direction = 'ltr';
        el.style.textAlign = 'left';
      }
    });
  };

  // Обработка изменений в редакторе
  const handleInput = () => {
    if (editorRef.current) {
      fixTextDirection();
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onSave(newContent);
    }
  };

  // Отслеживание выделения текста
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (rect.width > 0) {
        setSelectionPosition({
          top: rect.top - 40 + window.scrollY,
          left: rect.left + rect.width / 2
        });
        setShowFormatBar(true);
      }
    } else {
      setShowFormatBar(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Форматирование текста
  const applyFormat = (format: string) => {
    document.execCommand(format, false);
    handleInput(); // Обновляем содержимое после форматирования
  };

  // Вставка заголовка определенного уровня
  const insertHeading = (level: number) => {
    document.execCommand('formatBlock', false, `h${level}`);
    handleInput();
  };

  // Вставка цитаты
  const insertQuote = () => {
    document.execCommand('formatBlock', false, 'blockquote');
    handleInput();
  };

  // Вставка списка
  const insertList = (ordered: boolean) => {
    if (ordered) {
      document.execCommand('insertOrderedList', false);
    } else {
      document.execCommand('insertUnorderedList', false);
    }
    handleInput();
  };

  // Обработка специальных клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Запустим проверку направления текста при каждом нажатии клавиши
    setTimeout(fixTextDirection, 0);
    
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      handleInput();
    }
    
    // Ctrl+B для жирного текста
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }
    
    // Ctrl+I для курсива
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }
    
    // Ctrl+K для ссылки
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const url = prompt('Введите URL:');
      if (url) {
        document.execCommand('createLink', false, url);
        handleInput();
      }
    }
  };

  // Создаем функцию для проверки направления при фокусе
  const handleFocus = () => {
    setIsFocused(true);
    fixTextDirection();
  };

  return (
    <div className="rich-editor-container relative" dir="ltr">
      {/* Панель форматирования (появляется при выделении текста) */}
      {showFormatBar && (
        <div 
          className="format-bar fixed bg-zinc-800 border border-zinc-700 rounded-md shadow-lg p-1 flex items-center gap-1 z-50"
          style={{ 
            top: selectionPosition.top, 
            left: selectionPosition.left,
            transform: 'translateX(-50%)'
          }}
        >
          <button 
            onClick={() => applyFormat('bold')}
            className="p-1.5 hover:bg-zinc-700 rounded-md"
            title="Жирный (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button 
            onClick={() => applyFormat('italic')}
            className="p-1.5 hover:bg-zinc-700 rounded-md"
            title="Курсив (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button 
            onClick={() => {
              const url = prompt('Введите URL:');
              if (url) {
                document.execCommand('createLink', false, url);
                handleInput();
              }
            }}
            className="p-1.5 hover:bg-zinc-700 rounded-md"
            title="Ссылка (Ctrl+K)"
          >
            <Link size={16} />
          </button>
          <button 
            onClick={() => {
              document.execCommand('formatBlock', false, 'pre');
              handleInput();
            }}
            className="p-1.5 hover:bg-zinc-700 rounded-md"
            title="Код"
          >
            <Code size={16} />
          </button>
        </div>
      )}
      
      {/* Панель с форматами блоков */}
      <div className="block-toolbar bg-zinc-800 border border-zinc-700 rounded-md p-1 mb-2 flex items-center gap-1 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => document.execCommand('formatBlock', false, 'p')}
          className="p-1.5 hover:bg-zinc-700 rounded-md flex items-center gap-1 text-xs"
          title="Обычный текст"
        >
          <Type size={14} />
          <span>Текст</span>
        </button>
        <button 
          onClick={() => insertHeading(1)}
          className="p-1.5 hover:bg-zinc-700 rounded-md flex items-center gap-1 text-xs"
          title="Заголовок 1"
        >
          <Heading1 size={14} />
          <span>H1</span>
        </button>
        <button 
          onClick={() => insertHeading(2)}
          className="p-1.5 hover:bg-zinc-700 rounded-md flex items-center gap-1 text-xs"
          title="Заголовок 2"
        >
          <Heading2 size={14} />
          <span>H2</span>
        </button>
        <button 
          onClick={() => insertList(false)}
          className="p-1.5 hover:bg-zinc-700 rounded-md flex items-center gap-1 text-xs"
          title="Маркированный список"
        >
          <List size={14} />
          <span>Список</span>
        </button>
        <button 
          onClick={() => insertList(true)}
          className="p-1.5 hover:bg-zinc-700 rounded-md flex items-center gap-1 text-xs"
          title="Нумерованный список"
        >
          <ListOrdered size={14} />
          <span>Номера</span>
        </button>
        <button 
          onClick={insertQuote}
          className="p-1.5 hover:bg-zinc-700 rounded-md flex items-center gap-1 text-xs"
          title="Цитата"
        >
          <Quote size={14} />
          <span>Цитата</span>
        </button>
      </div>
      
      {/* Сам редактор */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        className={`editor-content min-h-[200px] p-4 rounded-md border ${
          isFocused ? 'border-blue-500' : 'border-zinc-700'
        } focus:outline-none transition-colors bg-zinc-800/50 prose prose-invert max-w-none`}
        dangerouslySetInnerHTML={{ __html: initialContent || '' }}
        data-placeholder={placeholder}
        dir="ltr"
        style={{ 
          direction: 'ltr', 
          unicodeBidi: 'isolate',
          textAlign: 'left'
        }}
      />
      
      <style jsx>{`
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .editor-content h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          direction: ltr;
          text-align: left;
        }
        
        .editor-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          direction: ltr;
          text-align: left;
        }
        
        .editor-content p {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          direction: ltr;
          text-align: left;
        }
        
        .editor-content ul, .editor-content ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
          direction: ltr;
          text-align: left;
        }
        
        .editor-content blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 1rem;
          margin-left: 0;
          color: #a1a1aa;
          font-style: italic;
          direction: ltr;
          text-align: left;
        }
        
        .editor-content a {
          color: #818cf8;
          text-decoration: underline;
          direction: ltr;
        }
        
        .editor-content pre {
          background-color: #27272a;
          padding: 0.75rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
          direction: ltr;
          text-align: left;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 