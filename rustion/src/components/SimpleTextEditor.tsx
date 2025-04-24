'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';

type SimpleTextEditorProps = {
  initialContent: string;
  onSave: (content: string) => void;
  placeholder?: string;
};

export const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  initialContent,
  onSave,
  placeholder = 'Начните писать...'
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [lastSavedContent, setLastSavedContent] = useState(initialContent || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialMount = useRef(true);

  // При изменении initialContent обновляем локальное состояние
  useEffect(() => {
    setContent(initialContent || '');
    setLastSavedContent(initialContent || '');
  }, [initialContent]);

  // Создаем debounced функцию сохранения для предотвращения частых вызовов
  const debouncedSave = useCallback(
    debounce((newContent: string) => {
      onSave(newContent);
      setLastSavedContent(newContent);
      console.log('Текст сохранен:', newContent);
    }, 800),
    [onSave]
  );

  // При изменении содержимого вызываем debounced функцию сохранения
  useEffect(() => {
    // Пропускаем первый рендер
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Проверяем, изменилось ли содержимое
    if (content !== lastSavedContent) {
      debouncedSave(content);
    }
  }, [content, lastSavedContent, debouncedSave]);

  // Автосохранение при размонтировании компонента
  useEffect(() => {
    return () => {
      // Если есть несохраненные изменения
      if (content !== lastSavedContent) {
        // Отменяем debounced сохранение и сохраняем сразу
        debouncedSave.cancel();
        onSave(content);
        console.log('Сохранено при размонтировании:', content);
      }
    };
  }, [content, lastSavedContent, debouncedSave, onSave]);

  // Обработчик изменения текста
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  // Автоматически регулируем высоту textarea
  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const element = e.target;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Инициализация высоты при первом рендере
  useEffect(() => {
    if (textareaRef.current) {
      const element = textareaRef.current;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [initialContent]);

  return (
    <div className="simple-editor-container relative" dir="ltr">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          handleChange(e);
          adjustHeight(e);
        }}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 rounded-md border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors bg-zinc-800/50 text-zinc-200 resize-none overflow-hidden"
        style={{ 
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'isolate'
        }}
        dir="ltr"
        spellCheck={false}
        onInput={adjustHeight}
      />
    </div>
  );
};

export default SimpleTextEditor; 